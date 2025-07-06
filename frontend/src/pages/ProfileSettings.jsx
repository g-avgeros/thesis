import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/authService';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Flag: true when user enters current password to change password
  const isChangingPassword = oldPassword !== '';

  useEffect(() => {
    getProfile()
      .then(res => setFullName(res.data.full_name))
      .catch(() => setError('Couldn’t load profile'));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Enforce all password fields only if changing password
    if (isChangingPassword) {
      if (!newPassword || !confirm) {
        setError('Πρέπει να συμπληρώσετε όλα τα πεδία κωδικού');
        return;
      }
      if (newPassword !== confirm) {
        setError('Οι νέοι κωδικοί δεν ταιριάζουν');
        return;
      }
    }

    const payload = {
      full_name: fullName,
      ...(isChangingPassword && {
        old_password: oldPassword,
        new_password: newPassword,
        confirm,
      }),
    };

    try {
      await updateProfile(payload);
      setSuccess('Profile updated!');
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, justifyContent: 'flex-start' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Πίσω
        </Button>
        <Typography variant="h5">
          Ρυθμίσεις Λογαριασμού
        </Typography>
      </Stack>

      {(success || error) && (
        <Alert severity={success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {success || error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Current Password"
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          fullWidth
          disabled={!isChangingPassword}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          fullWidth
          disabled={!isChangingPassword}
          sx={{ mb: 3 }}
        />

        <Button type="submit" variant="contained" fullWidth>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
