import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
} from '@mui/material';
import { 
  Settings, 
  LogOut,
} from 'lucide-react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              A
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                color: '#1e40af',
                display: { xs: 'none', sm: 'block' },
                fontSize: '1.5rem',
              }}
            >
              Agendify
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigate('/settings')}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  bgcolor: '#f3f4f6',
                  color: '#2563eb',
                },
                transition: 'all 150ms ease-in-out',
              }}
            >
              <Settings size={20} />
            </IconButton>
            
            <IconButton
              onClick={handleLogout}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  bgcolor: '#fee2e2',
                  color: '#ef4444',
                },
                transition: 'all 150ms ease-in-out',
              }}
            >
              <LogOut size={20} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 0,
          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--white) 50%, var(--secondary-50) 100%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>

    </Box>
  );
};

export default Layout;