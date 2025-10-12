#!/usr/bin/env python3
"""
Migration: Make clients.email nullable (allow creating clients without email)
Run: python migrate_clients_email_nullable.py
"""

from app import app
from models.models import db
from sqlalchemy import text


def make_clients_email_nullable():
    with app.app_context():
        try:
            db.session.execute(text("ALTER TABLE clients MODIFY COLUMN email VARCHAR(100) NULL"))
            db.session.commit()
            print("✅ Updated clients.email to allow NULL")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {e}")
            return False


if __name__ == "__main__":
    print("🚀 Starting migration: clients.email -> NULLABLE")
    ok = make_clients_email_nullable()
    if ok:
        print("✅ Migration completed successfully")
    else:
        print("❌ Migration failed")


