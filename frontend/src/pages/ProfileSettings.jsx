import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
  Divider,
  Fade,
  Slide,
} from '@mui/material';
import { ArrowLeft, User, Lock, Save } from 'lucide-react';
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-family)',
      }}
      className="animate-fade-in"
    >
      {/* Header */}
      <Fade in timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            p: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              '&:hover': {
                bgcolor: '#e5e7eb',
                color: '#374151',
              },
              transition: 'all 150ms ease-in-out',
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Typography 
            variant="h4" 
            fontWeight={800}
            sx={{ 
              color: '#1e40af',
              flexGrow: 1,
            }}
          >
            Ρυθμίσεις Λογαριασμού
          </Typography>
        </Box>
      </Fade>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Alert Messages */}
        {(success || error) && (
          <Fade in timeout={500}>
            <Alert 
              severity={success ? 'success' : 'error'} 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                '& .MuiAlert-message': {
                  fontSize: '0.95rem',
                },
              }}
            >
              {success || error}
            </Alert>
          </Fade>
        )}

        {/* Profile Information Card */}
        <Slide direction="up" in timeout={500}>
          <Card
            sx={{
              mb: 3,
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <User size={24} />
                </Box>
                <Typography variant="h5" fontWeight={700} color="#1e40af">
                  Πληροφορίες Προφίλ
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="Όνομα"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  fullWidth
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f9fafb',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                />

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <Lock size={24} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} color="#1e40af">
                    Αλλαγή Κωδικού
                  </Typography>
                </Box>

                <TextField
                  label="Τρέχων Κωδικός"
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  fullWidth
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f9fafb',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                />

                <TextField
                  label="Νέος Κωδικός"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  disabled={!isChangingPassword}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: !isChangingPassword ? '#f3f4f6' : '#f9fafb',
                      '&:hover': {
                        backgroundColor: !isChangingPassword ? '#f3f4f6' : '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                />

                <TextField
                  label="Επιβεβαίωση Νέου Κωδικού"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  fullWidth
                  disabled={!isChangingPassword}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: !isChangingPassword ? '#f3f4f6' : '#f9fafb',
                      '&:hover': {
                        backgroundColor: !isChangingPassword ? '#f3f4f6' : '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      },
                    },
                  }}
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  startIcon={<Save size={20} />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 250ms ease-in-out',
                  }}
                >
                  Αποθήκευση Αλλαγών
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Box>
    </Box>
  );
}
