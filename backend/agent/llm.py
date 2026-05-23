"""Ollama client with rule-based fallback (no paid API)."""
import json
import os
import re

import requests

from agent.prompts import CLIENT_SYSTEM, PROFESSIONAL_SYSTEM
from agent.tools import parse_date_from_text, run_tool

OLLAMA_BASE = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.2:3b')
MAX_TOOL_ROUNDS = 3


def _extract_json(text):
    if not text:
        return None
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r'\{[^{}]*"action"[^{}]*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    brace = text.find('{')
    if brace >= 0:
        try:
            return json.loads(text[brace:])
        except json.JSONDecodeError:
            pass
    return None


def ollama_available():
    """Ollama server responds (may have zero models)."""
    try:
        r = requests.get(f'{OLLAMA_BASE}/api/tags', timeout=2)
        return r.status_code == 200
    except Exception:
        return False


def ollama_ready():
    """Ollama is up AND the configured model is installed."""
    try:
        r = requests.get(f'{OLLAMA_BASE}/api/tags', timeout=2)
        if r.status_code != 200:
            return False
        names = [m.get('name', '') for m in r.json().get('models', [])]
        if not names:
            return False
        want_base = OLLAMA_MODEL.split(':')[0]
        return any(
            n == OLLAMA_MODEL
            or n.split(':')[0] == want_base
            for n in names
        )
    except Exception:
        return False


def _ollama_chat(messages):
    payload = {
        'model': OLLAMA_MODEL,
        'messages': messages,
        'stream': False,
        'options': {'temperature': 0.3},
    }
    r = requests.post(f'{OLLAMA_BASE}/api/chat', json=payload, timeout=30)
    r.raise_for_status()
    return r.json()['message']['content']


def _rule_based_plan(agent_type, message):
    """Simple Greek keyword routing when Ollama is offline."""
    m = message.lower()

    if agent_type == 'client':
        if any(w in m for w in ('ακύρω', 'ακυρω', 'cancel')):
            nums = re.findall(r'\d+', message)
            if nums:
                return {'action': 'cancel_appointment', 'args': {'appointment_id': int(nums[0])}}
        if any(w in m for w in ('ραντεβού', 'ραντεβου', 'κρατήσ', 'κρατησ', 'appointment')):
            return {'action': 'my_appointments', 'args': {}}
        if any(w in m for w in ('υπηρεσ', 'τιμ', 'service', 'διάρκει')):
            nums = re.findall(r'\d+', message)
            if nums:
                return {'action': 'list_services', 'args': {'professional_id': int(nums[0])}}
        if any(w in m for w in ('επαγγελματ', 'εύρεση', 'ευρεση', 'ποιος', 'λίστα', 'λιστα')):
            return {'action': 'list_professionals', 'args': {}}
        return {
            'action': 'reply',
            'text': (
                'Γεια! Είμαι ο βοηθός πελάτη. Μπορώ να σας βοηθήσω με:\n'
                '• «Δείξε επαγγελματίες»\n'
                '• «Υπηρεσίες επαγγελματία 1» (αλλάξτε το id)\n'
                '• «Τα ραντεβού μου»\n'
                '• «Ακύρωσε ραντεβού 5» (με id)\n\n'
                'Για πλήρη AI απάντηση, εγκαταστήστε Ollama τοπικά.'
            ),
        }

    # professional
    parsed_date = parse_date_from_text(message)
    if parsed_date and any(w in m for w in ('ραντεβού', 'ραντεβου', 'κρατήσ', 'κρατησ', 'ημερολόγι', 'ημερολογι')):
        return {
            'action': 'appointments_on_date',
            'args': {'date': parsed_date.isoformat()},
        }
    if any(w in m for w in ('σήμερα', 'σημερα', 'today')):
        if any(w in m for w in ('ραντεβού', 'ραντεβου', 'κρατήσ', 'κρατησ', 'ημερολόγι', 'ημερολογι')):
            return {'action': 'today_summary', 'args': {}}
    if any(w in m for w in ('αύριο', 'αυριο', 'επόμεν', 'επομεν', 'upcoming')):
        return {'action': 'my_appointments', 'args': {'filter': 'upcoming'}}
    if any(w in m for w in ('ραντεβού', 'ραντεβου', 'ημερολόγι', 'ημερολογι')):
        return {'action': 'my_appointments', 'args': {'filter': 'all'}}
    if any(w in m for w in ('υπηρεσ', 'service')):
        return {'action': 'list_services', 'args': {}}
    if any(w in m for w in ('πελάτ', 'πελατ', 'client')):
        return {'action': 'list_clients', 'args': {}}
    if any(w in m for w in ('πρόγραμμα', 'προγραμμα', 'ωράρι', 'ωραρι', 'schedule')):
        return {'action': 'list_schedules', 'args': {}}
    return {
        'action': 'reply',
        'text': (
            'Γεια! Είμαι ο βοηθός επαγγελματία. Δοκιμάστε:\n'
            '• «Ραντεβού σήμερα»\n'
            '• «Ραντεβού 26/5» (συγκεκριμένη ημερομηνία)\n'
            '• «Επόμενα ραντεβού»\n'
            '• «Οι υπηρεσίες μου»\n'
            '• «Οι πελάτες μου»\n'
            '• «Το πρόγραμμά μου»\n\n'
            'Για πλήρη AI, εγκαταστήστε Ollama τοπικά.'
        ),
    }


def _format_tool_result(action, result):
    return f'Αποτέλεσμα εργαλείου «{action}»:\n{json.dumps(result, ensure_ascii=False, indent=2)}'


def _format_date_label(iso_date):
    if not iso_date:
        return ''
    try:
        y, mo, d = iso_date.split('-')
        return f'{d}/{mo}/{y}'
    except ValueError:
        return iso_date


def _format_professional_appt(a):
    start = a.get('start_time') or ''
    time_part = start[11:16] if len(start) >= 16 else start[:16]
    client = a.get('client_name') or 'Πελάτης'
    phone = a.get('client_phone')
    svc = a.get('service_name') or 'Υπηρεσία'
    extra = f' · {phone}' if phone else ''
    return f'{time_part} — {client}{extra} · {svc}'


def _rule_based_reply(agent_type, action, result):
    if action == 'my_appointments':
        apps = result.get('appointments', [])
        if not apps:
            return 'Δεν έχετε καταχωρημένα ραντεβού.'
        if agent_type == 'professional':
            lines = [f"#{a['id']}: {_format_professional_appt(a)}" for a in apps[:10]]
        else:
            lines = [
                f"#{a['id']}: {a.get('service_name') or '—'} — {a['start_time']} ({a['status']})"
                for a in apps[:10]
            ]
        return 'Τα ραντεβού σας:\n' + '\n'.join(lines)

    if action in ('today_summary', 'appointments_on_date'):
        n = result.get('count', 0)
        d_label = _format_date_label(result.get('date'))
        if action == 'today_summary':
            header = f'Σήμερα ({d_label})' if d_label else 'Σήμερα'
        else:
            header = f'Ραντεβού για {d_label}' if d_label else 'Ραντεβού'
        if n == 0:
            return f'{header}: δεν έχετε ραντεβού.'
        lines = [_format_professional_appt(a) for a in result.get('appointments', [])]
        note = (
            '\n\n(Σημείωση: «σήμερα» = η σημερινή ημερομηνία, όχι η μέρα που επιλέγετε στο ημερολόγιο. '
            'Για συγκεκριμένη μέρα π.χ. «ραντεβού 26/5».)'
            if action == 'today_summary'
            else ''
        )
        return f'{header}: {n} ραντεβού:\n' + '\n'.join(lines) + note

    if action == 'list_professionals':
        pros = result.get('professionals', [])
        if not pros:
            return 'Δεν βρέθηκαν επαγγελματίες.'
        lines = [f"#{p['id']}: {p['full_name']} — {', '.join(p.get('categories') or []) or '—'}" for p in pros[:15]]
        return 'Επαγγελματίες:\n' + '\n'.join(lines)

    if action == 'list_services':
        sv = result.get('services', [])
        if not sv:
            return 'Δεν βρέθηκαν υπηρεσίες.'
        lines = [f"#{s['id']}: {s['name']} ({s['duration_minutes']}′, {s['price']}€)" for s in sv]
        return 'Υπηρεσίες:\n' + '\n'.join(lines)

    if action == 'list_clients':
        cl = result.get('clients', [])
        if not cl:
            return 'Δεν βρέθηκαν πελάτες.'
        lines = [f"#{c['id']}: {c['full_name']} — {c.get('phone') or '—'}" for c in cl]
        return 'Πελάτες:\n' + '\n'.join(lines)

    if action == 'list_schedules':
        sch = result.get('schedules', [])
        if not sch:
            return 'Δεν έχετε ορισμένο πρόγραμμα.'
        lines = [
            f"{s['day_of_week']}: {s['start_time']}-{s['end_time']} ({'ανοιχτό' if s['is_available'] else 'κλειστό'})"
            for s in sch
        ]
        return 'Πρόγραμμα:\n' + '\n'.join(lines)

    if 'message' in result:
        return result['message']
    if 'error' in result:
        return f"Σφάλμα: {result['error']}"
    return json.dumps(result, ensure_ascii=False)


def chat_with_ollama(agent_type, user, message, history):
    system = CLIENT_SYSTEM if agent_type == 'client' else PROFESSIONAL_SYSTEM
    messages = [{'role': 'system', 'content': system}]
    for h in history[-8:]:
        role = h.get('role', 'user')
        if role in ('user', 'assistant'):
            messages.append({'role': role, 'content': h.get('content', '')})
    messages.append({'role': 'user', 'content': message})

    tool_steps = []
    for _ in range(MAX_TOOL_ROUNDS):
        raw = _ollama_chat(messages)
        plan = _extract_json(raw)
        if not plan:
            return {'reply': raw.strip() or 'Δεν κατάλαβα. Δοκιμάστε ξανά.', 'mode': 'ollama', 'tool_steps': tool_steps}

        action = plan.get('action')
        if action == 'reply':
            return {'reply': plan.get('text', raw), 'mode': 'ollama', 'tool_steps': tool_steps}

        args = plan.get('args') or {}
        result = run_tool(agent_type, user, action, args)
        tool_steps.append({'action': action, 'args': args, 'result': result})
        messages.append({'role': 'assistant', 'content': json.dumps(plan, ensure_ascii=False)})
        messages.append({'role': 'user', 'content': _format_tool_result(action, result)})

    return {
        'reply': 'Έφτασα το όριο βημάτων. Δοκιμάστε πιο απλή ερώτηση.',
        'mode': 'ollama',
        'tool_steps': tool_steps,
    }


def chat_rule_based(agent_type, user, message, _history):
    plan = _rule_based_plan(agent_type, message)
    action = plan.get('action')
    if action == 'reply':
        return {'reply': plan.get('text', ''), 'mode': 'rules', 'tool_steps': []}

    args = plan.get('args') or {}
    result = run_tool(agent_type, user, action, args)
    reply = _rule_based_reply(agent_type, action, result)
    return {
        'reply': reply,
        'mode': 'rules',
        'tool_steps': [{'action': action, 'args': args, 'result': result}],
    }
