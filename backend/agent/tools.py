"""Agent tools — direct DB access scoped to the authenticated user."""
import os
import re
from datetime import datetime, date, timedelta

try:
    from zoneinfo import ZoneInfo
    APP_TZ = ZoneInfo(os.getenv('APP_TIMEZONE', 'Europe/Athens'))
except Exception:
    APP_TZ = None

from models.models import (
    db,
    Appointment,
    Professional,
    Client,
    Service,
    ProfessionalSchedule,
)


def _parse_dt(value):
    if isinstance(value, datetime):
        return value.replace(tzinfo=None)
    if isinstance(value, str):
        v = value.replace('Z', '+00:00')
        try:
            dt = datetime.fromisoformat(v)
        except Exception:
            try:
                dt = datetime.strptime(value.split('.')[0], '%Y-%m-%d %H:%M:%S')
            except Exception:
                return None
        return dt.replace(tzinfo=None)
    return None


def _local_now():
    if APP_TZ:
        return datetime.now(APP_TZ).replace(tzinfo=None)
    return datetime.now()


def _local_today():
    return _local_now().date()


def _day_bounds(d):
    start = datetime.combine(d, datetime.min.time())
    return start, start + timedelta(days=1)


def parse_date_from_text(text):
    """Parse dd/mm, dd-mm, dd.mm (optional year) from user message."""
    m = re.search(r'(\d{1,2})[/.\\-](\d{1,2})(?:[/.\\-](\d{2,4}))?', text or '')
    if not m:
        return None
    day, month = int(m.group(1)), int(m.group(2))
    year = int(m.group(3)) if m.group(3) else _local_today().year
    if year < 100:
        year += 2000
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _appointment_dict(a):
    client = getattr(a, 'client', None)
    return {
        'id': a.id,
        'professional_id': a.professional_id,
        'professional_name': getattr(a.professional, 'full_name', None),
        'client_id': a.client_id,
        'client_name': getattr(client, 'full_name', None) if client else None,
        'client_phone': getattr(client, 'phone', None) if client else None,
        'service_id': a.service_id,
        'service_name': getattr(a.service, 'name', None),
        'start_time': a.start_time.isoformat(sep=' '),
        'end_time': a.end_time.isoformat(sep=' '),
        'status': a.status,
    }


# ——— Client tools ———

def client_list_professionals(_user, _args):
    professionals = Professional.query.all()
    return {
        'professionals': [
            {
                'id': p.id,
                'full_name': p.full_name,
                'address': p.address,
                'categories': [c.name for c in p.categories],
            }
            for p in professionals
        ]
    }


def client_list_services(_user, args):
    pid = args.get('professional_id')
    if not pid:
        return {'error': 'professional_id απαιτείται'}
    services = Service.query.filter_by(professional_id=pid).all()
    return {
        'services': [
            {
                'id': s.id,
                'name': s.name,
                'duration_minutes': s.duration_minutes,
                'price': float(s.price) if s.price is not None else 0,
            }
            for s in services
        ]
    }


def client_my_appointments(user, _args):
    appointments = (
        Appointment.query.filter_by(client_id=user.id)
        .order_by(Appointment.start_time.desc())
        .limit(20)
        .all()
    )
    return {'appointments': [_appointment_dict(a) for a in appointments]}


def client_cancel_appointment(user, args):
    aid = args.get('appointment_id')
    if not aid:
        return {'error': 'appointment_id απαιτείται'}
    a = Appointment.query.filter_by(id=aid, client_id=user.id).first()
    if not a:
        return {'error': 'Το ραντεβού δεν βρέθηκε'}
    if a.status == 'cancelled':
        return {'message': 'Το ραντεβού είναι ήδη ακυρωμένο'}
    a.status = 'cancelled'
    db.session.commit()
    return {'message': 'Το ραντεβού ακυρώθηκε', 'appointment_id': a.id}


def client_book_appointment(user, args):
    required = ('professional_id', 'start_time', 'end_time')
    if not all(k in args for k in required):
        return {'error': 'Απαιτούνται professional_id, start_time, end_time'}

    start_dt = _parse_dt(args['start_time'])
    end_dt = _parse_dt(args['end_time'])
    if not start_dt or not end_dt:
        return {'error': 'Μη έγκυρη μορφή ημερομηνίας (χρησιμοποίησε YYYY-MM-DD HH:MM:SS)'}

    professional_id = args['professional_id']
    conflict = Appointment.query.filter_by(professional_id=professional_id).filter(
        Appointment.status != 'cancelled',
        Appointment.start_time < end_dt,
        Appointment.end_time > start_dt,
    ).first()
    if conflict:
        return {'error': 'Η ώρα δεν είναι διαθέσιμη'}

    a = Appointment(
        professional_id=professional_id,
        client_id=user.id,
        service_id=args.get('service_id'),
        start_time=start_dt,
        end_time=end_dt,
        status='scheduled',
    )
    db.session.add(a)
    db.session.commit()
    return {'message': 'Το ραντεβού κλείστηκε', 'appointment': _appointment_dict(a)}


# ——— Professional tools ———

def _pro_appointments_for_day(user, d):
    day_start, day_end = _day_bounds(d)
    appointments = (
        Appointment.query.filter_by(professional_id=user.id)
        .filter(
            Appointment.start_time >= day_start,
            Appointment.start_time < day_end,
            Appointment.status != 'cancelled',
        )
        .order_by(Appointment.start_time.asc())
        .all()
    )
    return [_appointment_dict(a) for a in appointments]


def pro_my_appointments(user, args):
    filt = (args.get('filter') or 'all').lower()
    q = Appointment.query.filter_by(professional_id=user.id)
    now = _local_now()

    if filt == 'today':
        day_start, day_end = _day_bounds(_local_today())
        q = q.filter(
            Appointment.start_time >= day_start,
            Appointment.start_time < day_end,
            Appointment.status != 'cancelled',
        )
    elif filt == 'upcoming':
        q = q.filter(
            Appointment.start_time >= now,
            Appointment.status != 'cancelled',
        )

    appointments = q.order_by(Appointment.start_time.asc()).limit(30).all()
    return {'appointments': [_appointment_dict(a) for a in appointments]}


def pro_today_summary(user, _args):
    today = _local_today()
    apps = _pro_appointments_for_day(user, today)
    return {
        'date': today.isoformat(),
        'count': len(apps),
        'appointments': apps,
    }


def pro_appointments_on_date(user, args):
    raw = args.get('date')
    if raw:
        try:
            d = date.fromisoformat(str(raw)[:10])
        except ValueError:
            return {'error': 'Μη έγκυρη ημερομηνία'}
    else:
        return {'error': 'Απαιτείται ημερομηνία (π.χ. 2026-05-26)'}

    apps = _pro_appointments_for_day(user, d)
    return {
        'date': d.isoformat(),
        'count': len(apps),
        'appointments': apps,
    }


def pro_list_services(user, _args):
    services = Service.query.filter_by(professional_id=user.id).all()
    return {
        'services': [
            {
                'id': s.id,
                'name': s.name,
                'duration_minutes': s.duration_minutes,
                'price': float(s.price) if s.price is not None else 0,
            }
            for s in services
        ]
    }


def pro_list_clients(user, _args):
    # Clients who have appointments with this professional
    client_ids = (
        db.session.query(Appointment.client_id)
        .filter_by(professional_id=user.id)
        .distinct()
        .all()
    )
    ids = [c[0] for c in client_ids if c[0]]
    clients = Client.query.filter(Client.id.in_(ids)).all() if ids else []
    return {
        'clients': [
            {'id': c.id, 'full_name': c.full_name, 'phone': c.phone, 'email': c.email}
            for c in clients
        ]
    }


def pro_list_schedules(user, _args):
    schedules = ProfessionalSchedule.query.filter_by(professional_id=user.id).all()
    return {
        'schedules': [
            {
                'day_of_week': s.day_of_week,
                'start_time': s.start_time.strftime('%H:%M') if s.start_time else None,
                'end_time': s.end_time.strftime('%H:%M') if s.end_time else None,
                'is_available': s.is_available,
            }
            for s in schedules
        ]
    }


CLIENT_TOOLS = {
    'list_professionals': client_list_professionals,
    'list_services': client_list_services,
    'my_appointments': client_my_appointments,
    'cancel_appointment': client_cancel_appointment,
    'book_appointment': client_book_appointment,
}

PROFESSIONAL_TOOLS = {
    'my_appointments': pro_my_appointments,
    'today_summary': pro_today_summary,
    'appointments_on_date': pro_appointments_on_date,
    'list_services': pro_list_services,
    'list_clients': pro_list_clients,
    'list_schedules': pro_list_schedules,
}


def run_tool(agent_type, user, action, args):
    registry = CLIENT_TOOLS if agent_type == 'client' else PROFESSIONAL_TOOLS
    fn = registry.get(action)
    if not fn:
        return {'error': f'Άγνωστο εργαλείο: {action}'}
    try:
        return fn(user, args or {})
    except Exception as e:
        return {'error': str(e)}
