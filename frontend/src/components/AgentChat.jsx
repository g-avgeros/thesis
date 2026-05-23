import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import { Bot, Send, X, Minimize2 } from 'lucide-react';
import { agentChat, getAgentStatus } from '../services/authService';

const WELCOME = {
  client: 'Γεια! Ρωτήστε για επαγγελματίες, υπηρεσίες ή τα ραντεβού σας.',
  professional: 'Γεια! Ρωτήστε για ραντεβού, πελάτες ή το πρόγραμμά σας.',
};

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 380;

const AgentChat = ({ agentType }) => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: WELCOME[agentType] }]);
      getAgentStatus()
        .then((res) => setMode(res.data?.ollama_ready ? 'ollama' : 'rules'))
        .catch(() => setMode('rules'));
    }
  }, [open, agentType, messages.length]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open, minimized]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextHistory = [...messages.filter((m) => m.role !== 'system'), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMinimized(false);

    try {
      const history = nextHistory.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await agentChat({
        message: text,
        agent_type: agentType,
        history,
      });
      setMode(res.data?.mode || 'rules');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data?.reply || 'Δεν υπάρχει απάντηση.' },
      ]);
    } catch (err) {
      let errText = 'Σφάλμα επικοινωνίας με τον βοηθό.';
      if (!err.response) {
        errText = 'Δεν συνδέεται το backend (port 5000). Επανεκκινήστε το Flask.';
      } else if (err.response.status === 401) {
        errText = 'Η σύνδεση έληξε. Κάντε logout και ξανά login.';
      } else if (err.response.data?.error) {
        errText = err.response.data.error;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const modeLabel =
    mode === 'ollama' ? 'AI' : mode === 'rules' ? 'Κανόνες' : '';

  const title = agentType === 'client' ? 'Βοηθός Πελάτη' : 'Βοηθός';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      <Collapse in={open} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: PANEL_WIDTH,
            maxWidth: 'calc(100vw - 32px)',
            height: minimized ? 'auto' : PANEL_HEIGHT,
            maxHeight: minimized ? 'auto' : 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Bot size={18} />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}
                noWrap
              >
                {title}
              </Typography>
              {modeLabel && (
                <Chip
                  label={modeLabel}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() => setMinimized((m) => !m)}
                sx={{ color: '#fff', p: 0.5 }}
                aria-label={minimized ? 'Ανάπτυξη' : 'Σμύκρινση'}
              >
                <Minimize2 size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                }}
                sx={{ color: '#fff', p: 0.5 }}
                aria-label="Κλείσιμο"
              >
                <X size={16} />
              </IconButton>
            </Box>
          </Box>

          {!minimized && (
            <>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 1.5,
                  bgcolor: '#f9fafb',
                  minHeight: 0,
                }}
              >
                {messages.map((msg, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        maxWidth: '88%',
                        borderRadius: 1.5,
                        bgcolor: msg.role === 'user' ? '#2563eb' : '#fff',
                        color: msg.role === 'user' ? '#fff' : '#374151',
                        border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.content}
                    </Paper>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <CircularProgress size={20} />
                  </Box>
                )}
                <div ref={bottomRef} />
              </Box>

              <Box
                sx={{
                  p: 1,
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: 0.5,
                  bgcolor: '#fff',
                  flexShrink: 0,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Μήνυμα..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.75 },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="small"
                  sx={{ bgcolor: '#eff6ff' }}
                >
                  <Send size={18} />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>

      <Fab
        color="primary"
        aria-label="Βοηθός AI"
        onClick={() => {
          if (open) {
            setOpen(false);
            setMinimized(false);
          } else {
            setOpen(true);
            setMinimized(false);
          }
        }}
        size="medium"
        sx={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
        }}
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </Fab>
    </Box>
  );
};

export default AgentChat;
