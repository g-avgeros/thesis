from flask import Blueprint, request, jsonify
from models.models import db, ProfessionalSchedule, Professional
from datetime import time
import json

schedules_bp = Blueprint('schedules', __name__)

@schedules_bp.route('/schedules', methods=['GET'])
def get_schedules():
    """Get all schedules for a professional"""
    try:
        professional_id = request.args.get('professional_id')
        if not professional_id:
            return jsonify({'error': 'Professional ID is required'}), 400
        
        schedules = ProfessionalSchedule.query.filter_by(professional_id=professional_id).all()
        
        schedule_data = []
        for schedule in schedules:
            schedule_data.append({
                'id': schedule.id,
                'day_of_week': schedule.day_of_week,
                'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else None,
                'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else None,
                'is_available': schedule.is_available,
                'created_at': schedule.created_at.isoformat() if schedule.created_at else None,
                'updated_at': schedule.updated_at.isoformat() if schedule.updated_at else None
            })
        
        return jsonify({
            'success': True,
            'schedules': schedule_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@schedules_bp.route('/schedules', methods=['POST'])
def create_or_update_schedules():
    """Create or update multiple schedules for a professional"""
    try:
        data = request.get_json()
        professional_id = data.get('professional_id')
        schedules = data.get('schedules', [])
        
        if not professional_id:
            return jsonify({'error': 'Professional ID is required'}), 400
        
        if not schedules:
            return jsonify({'error': 'Schedules data is required'}), 400
        
        # Verify professional exists
        professional = Professional.query.get(professional_id)
        if not professional:
            return jsonify({'error': 'Professional not found'}), 404
        
        # Process each schedule
        for schedule_data in schedules:
            day_of_week = schedule_data.get('day_of_week')
            is_available = schedule_data.get('is_available', False)
            start_time = schedule_data.get('start_time', '09:00')
            end_time = schedule_data.get('end_time', '17:00')
            
            if not day_of_week:
                continue
            
            # Convert time strings to time objects
            try:
                start_time_obj = time.fromisoformat(start_time) if start_time else time(9, 0)
                end_time_obj = time.fromisoformat(end_time) if end_time else time(17, 0)
            except ValueError:
                return jsonify({'error': f'Invalid time format for {day_of_week}'}), 400
            
            # Check if schedule already exists
            existing_schedule = ProfessionalSchedule.query.filter_by(
                professional_id=professional_id,
                day_of_week=day_of_week
            ).first()
            
            if existing_schedule:
                # Update existing schedule
                existing_schedule.start_time = start_time_obj
                existing_schedule.end_time = end_time_obj
                existing_schedule.is_available = is_available
            else:
                # Create new schedule
                new_schedule = ProfessionalSchedule(
                    professional_id=professional_id,
                    day_of_week=day_of_week,
                    start_time=start_time_obj,
                    end_time=end_time_obj,
                    is_available=is_available
                )
                db.session.add(new_schedule)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedules updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@schedules_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update a specific schedule"""
    try:
        schedule = ProfessionalSchedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'start_time' in data:
            schedule.start_time = time.fromisoformat(data['start_time'])
        if 'end_time' in data:
            schedule.end_time = time.fromisoformat(data['end_time'])
        if 'is_available' in data:
            schedule.is_available = data['is_available']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedule updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@schedules_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a specific schedule"""
    try:
        schedule = ProfessionalSchedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Schedule deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@schedules_bp.route('/schedules/professional/<int:professional_id>', methods=['DELETE'])
def delete_all_schedules(professional_id):
    """Delete all schedules for a professional"""
    try:
        schedules = ProfessionalSchedule.query.filter_by(professional_id=professional_id).all()
        
        for schedule in schedules:
            db.session.delete(schedule)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'All schedules deleted for professional {professional_id}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
