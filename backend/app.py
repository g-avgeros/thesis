from flask import Flask
from flask_cors import CORS
from models.models import db
from routes.professionals import professional_bp
from routes.services import service_bp
from routes.appointments import appointment_bp
from routes.clients import client_bp
from routes.auth import auth_bp
from routes.schedules import schedules_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# DB config
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Routes
app.register_blueprint(auth_bp)
app.register_blueprint(professional_bp)
app.register_blueprint(service_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(client_bp)
app.register_blueprint(schedules_bp)

@app.route('/')
def index():
    return "Freelancing Appointments API ✅"

if __name__ == '__main__':
    app.run(debug=True)
