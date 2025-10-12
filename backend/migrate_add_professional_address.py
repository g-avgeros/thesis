#!/usr/bin/env python3
"""
Migration: Add address column to professionals table
Run: python migrate_add_professional_address.py
"""

from app import app
from models.models import db
from sqlalchemy import text


def add_address_column():
    with app.app_context():
        try:
            db.session.execute(text("ALTER TABLE professionals ADD COLUMN address VARCHAR(255) NULL"))
            db.session.commit()
            print("✅ Added professionals.address column")
        except Exception as e:
            # If column exists or error occurs, print and return False
            db.session.rollback()
            print(f"⚠️ Migration notice: {e}")
            return False
        return True


if __name__ == "__main__":
    print("🚀 Starting migration: professionals.address")
    ok = add_address_column()
    if ok:
        print("✅ Migration completed successfully")
    else:
        print("⚠️ Migration may have already been applied or encountered an issue")


