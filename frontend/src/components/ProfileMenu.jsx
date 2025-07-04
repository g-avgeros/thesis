import React, { useState } from 'react';
import { IconButton, Avatar, Menu, MenuItem } from '@mui/material';

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ ml: 2 }}>
        <Avatar alt="User" src="/static/images/avatar/1.jpg" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { /* TODO: navigate to settings */ handleClose(); }}>Settings</MenuItem>
        <MenuItem onClick={() => { /* TODO: perform logout */ handleClose(); }}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;