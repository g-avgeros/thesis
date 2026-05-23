from models.models import Professional

from agent.llm import chat_rule_based, chat_with_ollama, ollama_ready


def user_agent_type(user):
    return 'professional' if isinstance(user, Professional) else 'client'


def run_agent(agent_type, user, message, history=None):
    history = history or []

    if user_agent_type(user) != agent_type:
        return {
            'reply': 'Δεν έχετε πρόσβαση σε αυτόν τον βοηθό.',
            'mode': 'error',
            'tool_steps': [],
        }

    if ollama_ready():
        try:
            return chat_with_ollama(agent_type, user, message, history)
        except Exception:
            pass

    result = chat_rule_based(agent_type, user, message, history)
    if result.get('mode') != 'rules':
        result['mode'] = 'rules'
    return result
