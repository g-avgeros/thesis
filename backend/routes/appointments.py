from flask import Blueprint, request, jsonify
from models.models import db, Appointment, Professional, Client, Service
from routes.auth import token_required

appointment_bp = Blueprint('appointment_bp', __name__)

# ---------- CREATE ----------
@appointment_bp.route('/appointments', methods=['POST'])
@token_required
def create_appointment(user):
    data = request.get_json() or {}

    if not all(k in data for k in ('start_time', 'end_time')):
        return jsonify({'error': 'Missing required fields'}), 400

    a = Appointment(
        professional_id=user.id,  # Use authenticated user's ID
        client_id=data.get('client_id'),
        service_id=data.get('service_id'),
        start_time=data['start_time'],
        end_time=data['end_time'],
        status=data.get('status', 'scheduled')
    )
    db.session.add(a)
    db.session.commit()

    return jsonify({'id': a.id, 'status': a.status}), 201

# ---------- READ ALL ----------
@appointment_bp.route('/appointments', methods=['GET'])
@token_required
def get_all_appointments(user):
    appointments = Appointment.query.filter_by(professional_id=user.id).all()
    return jsonify([
        {
            'id': a.id,
            'professional_id': a.professional_id,
            'client_id': a.client_id,
            'service_id': a.service_id,
            'start_time': str(a.start_time),
            'end_time': str(a.end_time),
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
