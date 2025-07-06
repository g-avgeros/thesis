import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
        <Avatar />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/settings');
          }}
        >
          Ρυθμίσεις
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Αποσύνδεση
        </MenuItem>
      </Menu>
    </>
  );
}
