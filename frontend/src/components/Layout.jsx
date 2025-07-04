import React from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import ProfileMenu from './ProfileMenu';

const Layout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          My App
        </Typography>
        <ProfileMenu />
      </Toolbar>
    </AppBar>

    <Sidebar />

    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {children}
    </Box>
  </Box>
);

export default Layout;