#!/usr/bin/env python3
"""
Database migration script to add the professional_schedules table
Run this script to update your database with the new schedule functionality
"""

from app import app
from models.models import db, ProfessionalSchedule
from sqlalchemy import text

def create_schedules_table():
    """Create the professional_schedules table"""
    with app.app_context():
        try:
            # Create the table
            db.create_all()
            print("✅ professional_schedules table created successfully!")
            
            # Verify the table was created
            result = db.session.execute(text("SHOW TABLES LIKE 'professional_schedules'"))
            if result.fetchone():
                print("✅ Table verification successful!")
            else:
                print("❌ Table verification failed!")
                
        except Exception as e:
            print(f"❌ Error creating table: {e}")
            return False
    return True

def add_sample_data():
    """Add sample schedule data for testing"""
    with app.app_context():
        try:
            # Check if we have any professionals
            from models.models import Professional
            professionals = Professional.query.all()
            
            if not professionals:
                print("⚠️  No professionals found. Please create a professional first.")
                return False
                
            # Add sample schedule for the first professional
            professional = professionals[0]
            
            # Check if schedules already exist
            existing_schedules = ProfessionalSchedule.query.filter_by(professional_id=professional.id).count()
            if existing_schedules > 0:
                print("⚠️  Schedules already exist for this professional.")
                return True
                
            # Create sample schedules for all days
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            
            for day in days:
                schedule = ProfessionalSchedule(
                    professional_id=professional.id,
                    day_of_week=day,
                    start_time='09:00:00',
                    end_time='17:00:00',
                    is_available=True if day != 'sunday' else False
                )
                db.session.add(schedule)
            
            db.session.commit()
            print(f"✅ Sample schedule data added for professional: {professional.full_name}")
            return True
            
        except Exception as e:
            print(f"❌ Error adding sample data: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    print("🚀 Starting database migration for professional schedules...")
    print("=" * 60)
    
    # Create the table
    if create_schedules_table():
        print("\n📊 Adding sample data...")
        add_sample_data()
        print("\n✅ Migration completed successfully!")
        print("\n📋 New table structure:")
        print("   - professional_schedules")
        print("   - Columns: id, professional_id, day_of_week, start_time, end_time, is_available, created_at, updated_at")
        print("   - Unique constraint: (professional_id, day_of_week)")
    else:
        print("\n❌ Migration failed!")
