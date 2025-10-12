from flask import Blueprint, request, jsonify
from models.models import db, Service, Professional, Category
from routes.auth import token_required

service_bp = Blueprint('service_bp', __name__)

# ---------- CATEGORIES (public) ----------
@service_bp.route('/categories', methods=['GET'])
def get_categories_public():
    cats = Category.query.all()
    return jsonify([{ 'id': c.id, 'name': c.name, 'slug': c.slug } for c in cats])

# Public: list services for a professional
@service_bp.route('/services/public', methods=['GET'])
def get_services_public():
    professional_id = request.args.get('professional_id')
    if not professional_id:
        return jsonify({'error': 'professional_id is required'}), 400
    services = Service.query.filter_by(professional_id=professional_id).all()
    return jsonify([
        {
            'id': s.id,
            'professional_id': s.professional_id,
            'name': s.name,
            'duration_minutes': s.duration_minutes,
            'price': float(s.price),
        } for s in services
    ])

# ---------- CREATE ----------
@service_bp.route('/services', methods=['POST'])
@token_required
def create_service(user):
    data = request.get_json() or {}

    # Require all three fields
    if not data.get('name') or data.get('duration_minutes') is None or data.get('price') is None:
        return jsonify({'error': 'Missing required fields: name, duration_minutes, price'}), 400

    s = Service(
        professional_id=user.id,  # Use authenticated user's ID
        name=data['name'],
        duration_minutes=data['duration_minutes'],
        price=data['price']
    )
    db.session.add(s)
    db.session.commit()

    return jsonify({'id': s.id, 'name': s.name}), 201

# ---------- READ ALL ----------
@service_bp.route('/services', methods=['GET'])
@token_required
def get_all_services(user):
    services = Service.query.filter_by(professional_id=user.id).all()
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
@token_required
def get_service(user, id):
    s = Service.query.filter_by(id=id, professional_id=user.id).first()
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
@token_required
def update_service(user, id):
    data = request.get_json() or {}
    s = Service.query.filter_by(id=id, professional_id=user.id).first()
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
@token_required
def delete_service(user, id):
    s = Service.query.filter_by(id=id, professional_id=user.id).first()
    if not s:
        return jsonify({'error': 'Service not found'}), 404

    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Service deleted'})
