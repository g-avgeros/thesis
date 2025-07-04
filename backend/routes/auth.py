import os, datetime, jwt, bcrypt
from flask import Blueprint, request, jsonify, current_app as app
from models.models import db, Professional

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/")

SECRET = os.getenv("JWT_SECRET", "devsecret")

def generate_token(user):
    payload = {
        "id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    required = ("full_name", "email", "password", "confirm")
    if not all(k in data for k in required):
        return jsonify({"error": "missing fields"}), 400

    if data["password"] != data["confirm"]:
        return jsonify({"error": "passwords do not match"}), 400

    if Professional.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "email exists"}), 409

    pw_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    prof = Professional(
        full_name=data["full_name"],
        email=data["email"],
        password_hash=pw_hash
    )

    db.session.add(prof)
    db.session.commit()

    return jsonify({"token": generate_token(prof), "id": prof.id})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = Professional.query.filter_by(email=data.get("email")).first()
    if not user or not bcrypt.checkpw(data.get("password","").encode(),
                                      user.password_hash.encode()):
        return jsonify({"error": "invalid credentials"}), 401
    return jsonify({"token": generate_token(user), "id": user.id})
