#!/usr/bin/env python3
"""
Seed/Upsert the full category list.
Safe to run multiple times (uses ON DUPLICATE KEY UPDATE on slug).

Run: python migrate_seed_categories_full.py
"""

from app import app
from models.models import db
from sqlalchemy import text

CATEGORIES = [
    ("Γυμναστές / Personal Trainers", "personal-trainers"),
    ("Περιποίηση Άκρων (Manicure / Pedicure)", "nail-care"),
    ("Κομμωτήρια / Barber Shops", "hair-barber"),
    ("Αισθητικοί / Skincare Experts", "skincare"),
    ("Δάσκαλοι / Καθηγητές (ξένων γλωσσών, μουσικής κλπ)", "teachers"),
    ("Τεχνίτες / Άλλες Υπηρεσίες (ηλεκτρολόγοι, υδραυλικοί)", "technicians"),
    ("Wellness / Yoga / Massage Therapists", "wellness-yoga-massage"),
    ("Άλλο", "other"),
]


def upsert_categories():
    with app.app_context():
        try:
            for name, slug in CATEGORIES:
                db.session.execute(
                    text(
                        """
                        INSERT INTO categories (name, slug)
                        VALUES (:n, :s)
                        ON DUPLICATE KEY UPDATE name = VALUES(name)
                        """
                    ),
                    {"n": name, "s": slug},
                )
            db.session.commit()
            print("✅ Categories seeded/updated")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to seed categories: {e}")
            return False


if __name__ == "__main__":
    print("🚀 Seeding full category list...")
    ok = upsert_categories()
    print("✅ Done" if ok else "❌ Error")


