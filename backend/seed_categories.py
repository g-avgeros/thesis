#!/usr/bin/env python3
"""Script to seed initial categories in the database"""
from app import app
from models.models import db, Category

with app.app_context():
    # Check if categories already exist
    existing = Category.query.count()
    if existing > 0:
        print(f"Categories already exist ({existing}). Skipping seed.")
    else:
        categories = [
            Category(name='Γυμναστές', slug='gymnastes'),
            Category(name='Περιποίηση Άκρων', slug='peripoihsh-akrwn'),
            Category(name='Δάσκαλοι', slug='daskaloi'),
            Category(name='Barber Shop', slug='barber-shop'),
            Category(name='Άλλο', slug='allo'),
        ]
        db.session.add_all(categories)
        db.session.commit()
        print(f"Added {len(categories)} categories:")
        for cat in categories:
            print(f"  - {cat.name} (slug: {cat.slug})")
