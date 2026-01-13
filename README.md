# Freelancing Appointments System

Ένα σύστημα διαχείρισης ραντεβού για επαγγελματίες και πελάτες.

## Αρχιτεκτονική

- **Backend**: Flask με SQLAlchemy (Python)
- **Frontend**: React με Material-UI
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose

## Απαιτήσεις

- Docker
- Docker Compose

## Εγκατάσταση και Εκτέλεση

### 1. Κλωνοποίηση του Repository

```bash
git clone <repository-url>
cd freelancing-appointments
```

### 2. Δημιουργία Environment Variables

```bash
cp env.example .env
```

Επεξεργαστείτε το `.env` αρχείο με τα δικά σας secrets.

### 3. Εκτέλεση με Docker Compose

```bash
# Build και run όλων των services
docker-compose up --build

# ή σε background mode
docker-compose up -d --build
```

### 4. Πρόσβαση στις Εφαρμογές

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306 (από τοπικό environment)

## Services

### Database (MySQL)
- **Container**: freelancing_db
- **Port**: 3306
- **Database**: freelancing_db
- **User**: app_user

### Backend (Flask)
- **Container**: freelancing_backend
- **Port**: 5000
- **API Documentation**: http://localhost:5000

### Frontend (React)
- **Container**: freelancing_frontend
- **Port**: 3000
- **Development**: Hot reload enabled

## Docker Commands

```bash
# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build backend

# View logs
docker-compose logs -f backend

# Access container shell
docker-compose exec backend bash

# Clean up (remove volumes)
docker-compose down -v
```

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## Database Schema

Το schema δημιουργείται αυτόματα από το SQLAlchemy models. Τα κύρια entities είναι:

- **Professionals**: Επαγγελματίες
- **Categories**: Κατηγορίες υπηρεσιών
- **Services**: Υπηρεσίες
- **Clients**: Πελάτες
- **Appointments**: Ραντεβού
- **ProfessionalSchedule**: Διαθεσιμότητα επαγγελματιών

## API Endpoints

Για λεπτομέρειες των API endpoints, δείτε τα αρχεία στο `backend/routes/`.

## Troubleshooting

### Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port Conflicts
Αν οι ports 3000, 5000, ή 3306 είναι ήδη σε χρήση, αλλάξτε τα στο `docker-compose.yml`.

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Production Deployment

Για production deployment, χρησιμοποιήστε production-ready images και ρυθμίσεις ασφαλείας.