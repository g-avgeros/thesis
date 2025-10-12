import os, datetime, jwt, bcrypt, re
from flask import Blueprint, request, jsonify, current_app as app
from models.models import db, Professional, Client, Category
from functools import wraps

auth_bp = Blueprint("auth_bp", __name__)
SECRET = os.getenv("JWT_SECRET", "devsecret")

def validate_email(email):
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_token(user):
    payload = {
        "id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", None)
        if not auth or not auth.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth.split()[1]
        try:
            payload = jwt.decode(token, SECRET, algorithms=["HS256"])
            # Try to find user in both tables
            user = Professional.query.get(payload["id"])
            if not user:
                user = Client.query.get(payload["id"])
            if not user:
                raise RuntimeError()
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(user, *args, **kwargs)
    return wrapper

@auth_bp.route("/register/professional", methods=["POST"])
def register_professional():
    data = request.get_json() or {}

    required = ("full_name", "email", "password", "confirm")
    if not all(k in data for k in required):
        return jsonify({"error": "missing fields"}), 400

    if not validate_email(data["email"]):
        return jsonify({"error": "invalid email format"}), 400

    if data["password"] != data["confirm"]:
        return jsonify({"error": "passwords do not match"}), 400

    if Professional.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "email exists"}), 409

    pw_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    prof = Professional(
        full_name=data["full_name"],
        email=data["email"],
        password_hash=pw_hash,
        address=data.get("address")
    )

    # Attach categories if provided
    category_ids = data.get('category_ids') or []
    if isinstance(category_ids, list) and category_ids:
        cats = Category.query.filter(Category.id.in_(category_ids)).all()
        prof.categories = cats

    db.session.add(prof)
    db.session.commit()

    return jsonify({"token": generate_token(prof), "id": prof.id})

@auth_bp.route("/register/client", methods=["POST"])
def register_client():
    data = request.get_json() or {}

    required = ("full_name", "email", "password", "confirm")
    if not all(k in data for k in required):
        return jsonify({"error": "missing fields"}), 400

    if not validate_email(data["email"]):
        return jsonify({"error": "invalid email format"}), 400

    if data["password"] != data["confirm"]:
        return jsonify({"error": "passwords do not match"}), 400

    if Client.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "email exists"}), 409

    pw_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    client = Client(
        full_name=data["full_name"],
        email=data["email"],
        password_hash=pw_hash,
        phone=data.get("phone", "")
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({"token": generate_token(client), "id": client.id})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password", "")
    
    if not validate_email(email):
        return jsonify({"error": "invalid email format"}), 400
    
    # Try to find user in both professionals and clients tables
    user = Professional.query.filter_by(email=email).first()
    user_type = "professional"
    
    if not user:
        user = Client.query.filter_by(email=email).first()
        user_type = "client"
    
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "invalid credentials"}), 401
    
    return jsonify({
        "token": generate_token(user), 
        "id": user.id,
        "user_type": user_type
    })

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_profile(user):
    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        **({"address": getattr(user, 'address', None)} if hasattr(user, 'address') else {}),
        **({"categories": [ { 'id': c.id, 'name': c.name } for c in getattr(user, 'categories', []) ]} if hasattr(user, 'categories') else {})
    })

@auth_bp.route("/me", methods=["PUT"])
@token_required
def update_profile(user):
    data = request.get_json() or {}

    if 'old_password' in data:
        old = data.get('old_password', '')

        if not bcrypt.checkpw(old.encode(), user.password_hash.encode()):
            return jsonify({'error': 'Old password is incorrect'}), 400

        new = data.get('new_password', '')
        confirm = data.get('confirm', '')
        if not new or new != confirm:
            return jsonify({'error': 'New passwords do not match'}), 400

        # hash & save νέου
        user.password_hash = bcrypt.hashpw(new.encode(), bcrypt.gensalt()).decode()

    # 2) Πάντα ενημέρωσε το full_name αν στάλθηκε
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'address' in data and hasattr(user, 'address'):
        user.address = data['address']
    # Update categories for professionals
    if 'category_ids' in data and hasattr(user, 'categories') and isinstance(data['category_ids'], list):
        cats = Category.query.filter(Category.id.in_(data['category_ids'])).all()
        user.categories = cats

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

