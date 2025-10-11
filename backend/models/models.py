from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 1. PROFESSIONALS
class Professional(db.Model):
    __tablename__ = 'professionals'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    services = db.relationship('Service', backref='professional', lazy=True)
    appointments = db.relationship('Appointment', backref='professional', lazy=True)
    schedules = db.relationship('ProfessionalSchedule', backref='professional', lazy=True)

# 2. SERVICES
class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    price = db.Column(db.Numeric(10, 2), default=0.00)

    appointments = db.relationship('Appointment', backref='service', lazy=True)

# 3. CLIENTS
class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    notes = db.Column(db.Text)

    appointments = db.relationship('Appointment', backref='client', lazy=True)

# 4. APPOINTMENTS
class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('scheduled', 'completed', 'cancelled'), default='scheduled')

# 5. PROFESSIONAL SCHEDULES
class ProfessionalSchedule(db.Model):
    __tablename__ = 'professional_schedules'
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=False)
    day_of_week = db.Column(db.Enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Ensure one schedule per day per professional
    __table_args__ = (db.UniqueConstraint('professional_id', 'day_of_week', name='unique_professional_day'),)