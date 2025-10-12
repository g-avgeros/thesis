from flask import Blueprint, request, jsonify
from models.models import db, Appointment, Professional, Client, Service
from routes.auth import token_required
from datetime import datetime

appointment_bp = Blueprint('appointment_bp', __name__)

# ---------- CREATE ----------
@appointment_bp.route('/appointments', methods=['POST'])
@token_required
def create_appointment(user):
    data = request.get_json() or {}

    if not all(k in data for k in ('start_time', 'end_time')):
        return jsonify({'error': 'Missing required fields'}), 400

    # Parse incoming start/end which may be ISO strings (e.g. 2025-10-13T10:30:00.000Z)
    def parse_dt(value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            v = value.replace('Z', '+00:00')
            try:
                dt = datetime.fromisoformat(v)
            except Exception:
                # Fallback to 'YYYY-MM-DD HH:MM:SS'
                try:
                    dt = datetime.strptime(value.split('.')[0], '%Y-%m-%d %H:%M:%S')
                except Exception:
                    return None
            # store naive (no tz) for MySQL DATETIME
            return dt.replace(tzinfo=None)
        return None

    start_dt = parse_dt(data['start_time'])
    end_dt = parse_dt(data['end_time'])
    if not start_dt or not end_dt:
        return jsonify({'error': 'Invalid datetime format'}), 400

    # Prevent overlapping appointments for this professional
    conflict = Appointment.query.filter_by(professional_id=user.id).filter(
        Appointment.start_time < end_dt,
        Appointment.end_time > start_dt,
    ).first()
    if conflict:
        return jsonify({'error': 'Time slot already booked'}), 409

    a = Appointment(
        professional_id=user.id,  # Use authenticated user's ID
        client_id=data.get('client_id'),
        service_id=data.get('service_id'),
        start_time=start_dt,
        end_time=end_dt,
        status=data.get('status', 'scheduled')
    )
    db.session.add(a)
    db.session.commit()

    return jsonify({'id': a.id, 'status': a.status}), 201

# ---------- CLIENT CREATE ----------
@appointment_bp.route('/appointments/client', methods=['POST'])
@token_required
def create_appointment_as_client(user):
    """Create appointment as a client token: professional_id is provided, client_id = user.id"""
    data = request.get_json() or {}

    if not all(k in data for k in ('start_time', 'end_time', 'professional_id')):
        return jsonify({'error': 'Missing required fields'}), 400

    def parse_dt(value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            v = value.replace('Z', '+00:00')
            try:
                dt = datetime.fromisoformat(v)
            except Exception:
                try:
                    dt = datetime.strptime(value.split('.')[0], '%Y-%m-%d %H:%M:%S')
                except Exception:
                    return None
            return dt.replace(tzinfo=None)
        return None

    start_dt = parse_dt(data['start_time'])
    end_dt = parse_dt(data['end_time'])
    if not start_dt or not end_dt:
        return jsonify({'error': 'Invalid datetime format'}), 400

    professional_id = data.get('professional_id')
    if not professional_id:
        return jsonify({'error': 'professional_id is required'}), 400

    # Prevent overlapping appointments for this professional
    conflict = Appointment.query.filter_by(professional_id=professional_id).filter(
        Appointment.start_time < end_dt,
        Appointment.end_time > start_dt,
    ).first()
    if conflict:
        return jsonify({'error': 'Time slot already booked'}), 409

    a = Appointment(
        professional_id=professional_id,
        client_id=user.id,
        service_id=data.get('service_id'),
        start_time=start_dt,
        end_time=end_dt,
        status=data.get('status', 'scheduled')
    )
    db.session.add(a)
    db.session.commit()

    return jsonify({'id': a.id, 'status': a.status}), 201

# ---------- CANCEL (client or professional) ----------
@appointment_bp.route('/appointments/<int:id>/cancel', methods=['POST'])
@token_required
def cancel_appointment(user, id):
    a = Appointment.query.filter_by(id=id).first()
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404

    # Allow cancel if current user is the professional or the client of the appointment
    if a.professional_id != getattr(user, 'id', None) and a.client_id != getattr(user, 'id', None):
        return jsonify({'error': 'Not authorized'}), 403

    a.status = 'cancelled'
    db.session.commit()
    return jsonify({'id': a.id, 'status': a.status}), 200

# ---------- READ ALL ----------
@appointment_bp.route('/appointments', methods=['GET'])
@token_required
def get_all_appointments(user):
    # Return appointments for professional or client depending on token entity
    try:
        from models.models import Professional as Prof, Client as Cli
        if isinstance(user, Prof):
            q = Appointment.query.filter_by(professional_id=user.id)
        else:
            q = Appointment.query.filter_by(client_id=user.id)
    except Exception:
        q = Appointment.query.filter_by(professional_id=user.id)

    appointments = q.all()
    return jsonify([
        {
            'id': a.id,
            'professional_id': a.professional_id,
            'client_id': a.client_id,
            'service_id': a.service_id,
            'service_name': getattr(a.service, 'name', None),
            'professional_name': getattr(a.professional, 'full_name', None),
            'start_time': a.start_time.isoformat(sep=' '),
            'end_time': a.end_time.isoformat(sep=' '),
            'status': a.status
        } for a in appointments
    ])

# ---------- READ ONE ----------
@appointment_bp.route('/appointments/<int:id>', methods=['GET'])
@token_required
def get_appointment(user, id):
    a = Appointment.query.filter_by(id=id, professional_id=user.id).first()
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404
    return jsonify({
        'id': a.id,
        'professional_id': a.professional_id,
        'client_id': a.client_id,
        'service_id': a.service_id,
        'start_time': str(a.start_time),
        'end_time': str(a.end_time),
        'status': a.status
    })

# ---------- UPDATE ----------
@appointment_bp.route('/appointments/<int:id>', methods=['PUT'])
@token_required
def update_appointment(user, id):
    data = request.get_json() or {}
    a = Appointment.query.filter_by(id=id, professional_id=user.id).first()
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404

    for field in ('client_id', 'service_id', 'start_time', 'end_time', 'status'):
        if field in data:
            setattr(a, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Appointment updated'})

# ---------- DELETE ----------
@appointment_bp.route('/appointments/<int:id>', methods=['DELETE'])
@token_required
def delete_appointment(user, id):
    a = Appointment.query.filter_by(id=id, professional_id=user.id).first()
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404

    db.session.delete(a)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted'})
