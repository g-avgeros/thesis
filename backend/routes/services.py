from flask import Blueprint, request, jsonify
from models.models import db, Service, Professional

service_bp = Blueprint('service_bp', __name__)

# ---------- CREATE ----------
@service_bp.route('/services', methods=['POST'])
def create_service():
    data = request.get_json() or {}

    if not all(k in data for k in ('professional_id', 'name')):
        return jsonify({'error': 'Missing required fields'}), 400

    # Optional: έλεγχος αν υπάρχει ο επαγγελματίας
    if not Professional.query.get(data['professional_id']):
        return jsonify({'error': 'Professional not found'}), 404

    s = Service(
        professional_id=data['professional_id'],
        name=data['name'],
        duration_minutes=data.get('duration_minutes', 30),
        price=data.get('price', 0.00)
    )
    db.session.add(s)
    db.session.commit()

    return jsonify({'id': s.id, 'name': s.name}), 201

# ---------- READ ALL ----------
@service_bp.route('/services', methods=['GET'])
def get_all_services():
    services = Service.query.all()
    return jsonify([
        {
            'id': s.id,
            'professional_id': s.professional_id,
            'name': s.name,
            'duration_minutes': s.duration_minutes,
            'price': float(s.price)
        } for s in services
    ])

# ---------- READ ONE ----------
@service_bp.route('/services/<int:id>', methods=['GET'])
def get_service(id):
    s = Service.query.get(id)
    if not s:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify({
        'id': s.id,
        'professional_id': s.professional_id,
        'name': s.name,
        'duration_minutes': s.duration_minutes,
        'price': float(s.price)
    })

# ---------- UPDATE ----------
@service_bp.route('/services/<int:id>', methods=['PUT'])
def update_service(id):
    data = request.get_json() or {}
    s = Service.query.get(id)
    if not s:
        return jsonify({'error': 'Service not found'}), 404

    if 'name' in data:
        s.name = data['name']
    if 'duration_minutes' in data:
        s.duration_minutes = data['duration_minutes']
    if 'price' in data:
        s.price = data['price']

    db.session.commit()
    return jsonify({'message': 'Service updated'})

# ---------- DELETE ----------
@service_bp.route('/services/<int:id>', methods=['DELETE'])
def delete_service(id):
    s = Service.query.get(id)
    if not s:
        return jsonify({'error': 'Service not found'}), 404

    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Service deleted'})
