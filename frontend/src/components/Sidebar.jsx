import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { CalendarMonth, BusinessCenter, People } from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
    }}
  >
    <Toolbar />
    <List>
      <ListItem button>
        <ListItemIcon><CalendarMonth /></ListItemIcon>
        <ListItemText primary="Ημερολόγιο" />
      </ListItem>
      <ListItem button>
        <ListItemIcon><BusinessCenter /></ListItemIcon>
        <ListItemText primary="Υπηρεσίες" />
      </ListItem>
      <ListItem button>
        <ListItemIcon><People /></ListItemIcon>
        <ListItemText primary="Πελάτες" />
      </ListItem>
    </List>
  </Drawer>
);

export default Sidebar;