#!/usr/bin/env python3
"""
Migration: Create categories and professional_categories tables and seed defaults
Run: python migrate_add_categories.py
"""

from app import app
from models.models import db
from sqlalchemy import text

SEED = [
    ('γυμναστές', 'gym-trainers'),
    ('περιποίηση άκρων', 'nail-care'),
    ('δάσκαλοι', 'teachers'),
    ('barber shop', 'barber-shop'),
    ('άλλο', 'other'),
]

def run():
    with app.app_context():
        try:
            db.session.execute(text(
                """
                CREATE TABLE IF NOT EXISTS categories (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(100) NOT NULL,
                  slug VARCHAR(120) UNIQUE
                ) ENGINE=InnoDB;
                """
            ))
            db.session.execute(text(
                """
                CREATE TABLE IF NOT EXISTS professional_categories (
                  professional_id INT NOT NULL,
                  category_id INT NOT NULL,
                  PRIMARY KEY (professional_id, category_id),
                  FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
                  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                ) ENGINE=InnoDB;
                """
            ))
            # seed if empty
            res = db.session.execute(text("SELECT COUNT(*) as c FROM categories"))
            if res.fetchone()[0] == 0:
                for name, slug in SEED:
                    db.session.execute(text("INSERT INTO categories(name, slug) VALUES (:n, :s)"), {"n": name, "s": slug})
            db.session.commit()
            print("✅ Categories and join table created/seeded")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {e}")
            return False

if __name__ == '__main__':
    run()


