from flask import Blueprint, request, jsonify

from agent.llm import ollama_available, ollama_ready
from agent.service import run_agent, user_agent_type
from routes.auth import token_required

agent_bp = Blueprint('agent_bp', __name__)


@agent_bp.route('/agent/status', methods=['GET'])
def agent_status():
    return jsonify({
        'ollama_available': ollama_available(),
        'ollama_ready': ollama_ready(),
    })


@agent_bp.route('/agent/chat', methods=['POST'])
@token_required
def agent_chat(user):
    data = request.get_json() or {}
    message = (data.get('message') or '').strip()
    agent_type = data.get('agent_type')
    history = data.get('history') or []

    if not message:
        return jsonify({'error': 'Το μήνυμα είναι υποχρεωτικό'}), 400

    if agent_type not in ('client', 'professional'):
        return jsonify({'error': 'agent_type πρέπει να είναι client ή professional'}), 400

    if user_agent_type(user) != agent_type:
        return jsonify({'error': 'Μη εξουσιοδοτημένη πρόσβαση στον βοηθό'}), 403

    try:
        result = run_agent(agent_type, user, message, history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Σφάλμα βοηθού: {str(e)}'}), 500
