from flask import Blueprint, request, jsonify
from models.models import db, Client, Professional
from routes.auth import token_required
import time

client_bp = Blueprint('client_bp', __name__)

# ---------- CREATE ----------
@client_bp.route('/clients', methods=['POST'])
@token_required
def create_client(user):
    data = request.get_json() or {}

    # Require full_name and phone
    if not data.get('full_name') or not data.get('phone'):
        return jsonify({'error': 'Missing required fields: full_name and phone are required'}), 400

    # Email is optional; do not auto-generate if missing
    email = data.get('email')

    # If phone provided, reuse existing client record
    phone = data.get('phone')
    if phone:
        existing = Client.query.filter_by(phone=phone).first()
        if existing:
            return jsonify({'id': existing.id, 'full_name': existing.full_name}), 200

    # Some schemas have NOT NULL on password_hash; store empty string
    c = Client(
        full_name=data['full_name'],
        email=email,
        password_hash=data.get('password_hash', ''),
        phone=phone,
        notes=data.get('notes')
    )
    db.session.add(c)
    db.session.commit()

    return jsonify({'id': c.id, 'full_name': c.full_name}), 201

# ---------- READ ALL ----------
@client_bp.route('/clients', methods=['GET'])
@token_required
def get_all_clients(user):
    clients = Client.query.all()
    return jsonify([
        {
            'id': c.id,
            'full_name': c.full_name,
            'email': c.email,
            'phone': c.phone,
            'notes': c.notes
        } for c in clients
    ])

# ---------- READ ONE ----------
@client_bp.route('/clients/<int:id>', methods=['GET'])
@token_required
def get_client(user, id):
    c = Client.query.filter_by(id=id).first()
    if not c:
        return jsonify({'error': 'Client not found'}), 404
    return jsonify({
        'id': c.id,
        'full_name': c.full_name,
        'email': c.email,
        'phone': c.phone,
        'notes': c.notes
    })

# ---------- UPDATE ----------
@client_bp.route('/clients/<int:id>', methods=['PUT'])
@token_required
def update_client(user, id):
    data = request.get_json() or {}
    c = Client.query.filter_by(id=id).first()
    if not c:
        return jsonify({'error': 'Client not found'}), 404

    for field in ('full_name', 'email', 'phone', 'notes'):
        if field in data:
            setattr(c, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Client updated'})

# ---------- DELETE ----------
@client_bp.route('/clients/<int:id>', methods=['DELETE'])
@token_required
def delete_client(user, id):
    c = Client.query.filter_by(id=id).first()
    if not c:
        return jsonify({'error': 'Client not found'}), 404

    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Client deleted'})
