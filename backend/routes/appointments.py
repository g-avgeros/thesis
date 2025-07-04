from flask import Blueprint, request, jsonify
from models.models import db, Appointment, Professional, Client, Service

appointment_bp = Blueprint('appointment_bp', __name__)

# ---------- CREATE ----------
@appointment_bp.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json() or {}

    if not all(k in data for k in ('professional_id', 'start_time', 'end_time')):
        return jsonify({'error': 'Missing required fields'}), 400

    if not Professional.query.get(data['professional_id']):
        return jsonify({'error': 'Professional not found'}), 404

    a = Appointment(
        professional_id=data['professional_id'],
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
def get_all_appointments():
    appointments = Appointment.query.all()
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
def get_appointment(id):
    a = Appointment.query.get(id)
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
def update_appointment(id):
    data = request.get_json() or {}
    a = Appointment.query.get(id)
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404

    for field in ('client_id', 'service_id', 'start_time', 'end_time', 'status'):
        if field in data:
            setattr(a, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Appointment updated'})

# ---------- DELETE ----------
@appointment_bp.route('/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    a = Appointment.query.get(id)
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404

    db.session.delete(a)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted'})
