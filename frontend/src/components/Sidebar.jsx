import React from 'react';
import { Drawer, List, Toolbar, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CalendarMonth, BusinessCenter, People } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const drawerWidth = 180;

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { text: 'Ημερολόγιο', icon: <CalendarMonth />, path: '/calendar' },
    { text: 'Υπηρεσίες', icon: <BusinessCenter />, path: '/services' },
    { text: 'Πελάτες', icon: <People />, path: '/clients' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', position: 'fixed', },
      }}
    >
      <Toolbar />
      <List>
        {items.map(item => (
          <ListItem
            button
            key={item.text}
            selected={pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          > 
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
