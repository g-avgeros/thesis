import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { 
  Briefcase, 
  Users, 
  Home,
  Calendar,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { 
      text: 'Αρχική', 
      icon: <Home size={20} />, 
      path: '/calendar',
      badge: null
    },
    { 
      text: 'Πρόγραμμα', 
      icon: <Calendar size={20} />, 
      path: '/schedule',
      badge: null
    },
    { 
      text: 'Υπηρεσίες', 
      icon: <Briefcase size={20} />, 
      path: '/services',
      badge: null
    },
    { 
      text: 'Πελάτες', 
      icon: <Users size={20} />, 
      path: '/clients',
      badge: null
    },
  ];

  const isSelected = (path) => pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          position: 'fixed',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-lg)',
        },
      }}
    >
      {/* Logo Section - Top */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            A
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              color: '#1e40af',
              fontSize: '1.25rem',
            }}
          >
            Agendify
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 3, borderColor: '#e5e7eb' }} />

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {items.map((item, index) => (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                cursor: 'pointer',
                borderRadius: '12px',
                mb: 0.5,
                mx: 1,
                px: 2,
                py: 1.5,
                transition: 'all 250ms ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                ...(isSelected(item.path) && {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: 600,
                  },
                }),
                ...(!isSelected(item.path) && {
                  '&:hover': {
                    backgroundColor: '#eff6ff',
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      color: '#2563eb',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#1e40af',
                      fontWeight: 600,
                    },
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isSelected(item.path) ? 'white' : '#6b7280',
                  transition: 'all 150ms ease-in-out',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: isSelected(item.path) ? 600 : 500,
                    color: isSelected(item.path) ? 'white' : '#374151',
                    transition: 'all 150ms ease-in-out',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
