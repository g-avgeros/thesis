from flask import Blueprint, request, jsonify
from models.models import db, Client, Professional

client_bp = Blueprint('client_bp', __name__)

# ---------- CREATE ----------
@client_bp.route('/clients', methods=['POST'])
def create_client():
    data = request.get_json() or {}

    if not all(k in data for k in ('professional_id', 'full_name')):
        return jsonify({'error': 'Missing required fields'}), 400

    if not Professional.query.get(data['professional_id']):
        return jsonify({'error': 'Professional not found'}), 404

    c = Client(
        professional_id=data['professional_id'],
        full_name=data['full_name'],
        email=data.get('email'),
        phone=data.get('phone'),
        notes=data.get('notes')
    )
    db.session.add(c)
    db.session.commit()

    return jsonify({'id': c.id, 'full_name': c.full_name}), 201

# ---------- READ ALL ----------
@client_bp.route('/clients', methods=['GET'])
def get_all_clients():
    clients = Client.query.all()
    return jsonify([
        {
            'id': c.id,
            'professional_id': c.professional_id,
            'full_name': c.full_name,
            'email': c.email,
            'phone': c.phone,
            'notes': c.notes
        } for c in clients
    ])

# ---------- READ ONE ----------
@client_bp.route('/clients/<int:id>', methods=['GET'])
def get_client(id):
    c = Client.query.get(id)
    if not c:
        return jsonify({'error': 'Client not found'}), 404
    return jsonify({
        'id': c.id,
        'professional_id': c.professional_id,
        'full_name': c.full_name,
        'email': c.email,
        'phone': c.phone,
        'notes': c.notes
    })

# ---------- UPDATE ----------
@client_bp.route('/clients/<int:id>', methods=['PUT'])
def update_client(id):
    data = request.get_json() or {}
    c = Client.query.get(id)
    if not c:
        return jsonify({'error': 'Client not found'}), 404

    for field in ('full_name', 'email', 'phone', 'notes'):
        if field in data:
            setattr(c, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Client updated'})

# ---------- DELETE ----------
@client_bp.route('/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    c = Client.query.get(id)
    if not c:
        return jsonify({'error': 'Client not found'}), 404

    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Client deleted'})
