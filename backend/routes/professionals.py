from flask import Blueprint, request, jsonify
from models.models import db, Professional, Category

professional_bp = Blueprint('professional_bp', __name__)

# ---------- CREATE ----------
@professional_bp.route('/professionals', methods=['POST'])
def create_professional():
    data = request.get_json() or {}
    if not all(k in data for k in ('full_name', 'email', 'password_hash')):
        return jsonify({'error': 'Missing required fields'}), 400

    if Professional.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    prof = Professional(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=data['password_hash'],
        address=data.get('address')
    )
    # attach categories if provided
    category_ids = data.get('category_ids') or []
    if isinstance(category_ids, list) and category_ids:
        cats = Category.query.filter(Category.id.in_(category_ids)).all()
        prof.categories = cats
    db.session.add(prof)
    db.session.commit()

    return jsonify({
        'id': prof.id,
        'full_name': prof.full_name,
        'email': prof.email,
        'address': prof.address,
        'categories': [ { 'id': c.id, 'name': c.name } for c in prof.categories ]
    }), 201

# ---------- READ ALL ----------
@professional_bp.route('/professionals', methods=['GET'])
def get_all_professionals():
    professionals = Professional.query.all()
    return jsonify([
        {
            'id': p.id,
            'full_name': p.full_name,
            'email': p.email,
            'address': p.address,
            'categories': [ { 'id': c.id, 'name': c.name } for c in p.categories ]
        } for p in professionals
    ])

# ---------- READ ONE ----------
@professional_bp.route('/professionals/<int:id>', methods=['GET'])
def get_professional(id):
    p = Professional.query.get(id)
    if not p:
        return jsonify({'error': 'Professional not found'}), 404
    return jsonify({
        'id': p.id,
        'full_name': p.full_name,
        'email': p.email,
        'address': p.address,
        'categories': [ { 'id': c.id, 'name': c.name } for c in p.categories ]
    })

# ---------- UPDATE ----------
@professional_bp.route('/professionals/<int:id>', methods=['PUT'])
def update_professional(id):
    data = request.get_json() or {}
    p = Professional.query.get(id)
    if not p:
        return jsonify({'error': 'Professional not found'}), 404

    if 'full_name' in data:
        p.full_name = data['full_name']
    if 'email' in data:
        if Professional.query.filter(Professional.email == data['email'], Professional.id != id).first():
            return jsonify({'error': 'Email already in use'}), 409
        p.email = data['email']
    if 'password_hash' in data:
        p.password_hash = data['password_hash']
    if 'address' in data:
        p.address = data['address']
    if 'category_ids' in data and isinstance(data['category_ids'], list):
        cats = Category.query.filter(Category.id.in_(data['category_ids'])).all()
        p.categories = cats

    db.session.commit()
    return jsonify({'message': 'Professional updated'})

# ---------- DELETE ----------
@professional_bp.route('/professionals/<int:id>', methods=['DELETE'])
def delete_professional(id):
    p = Professional.query.get(id)
    if not p:
        return jsonify({'error': 'Professional not found'}), 404

    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Professional deleted'})
