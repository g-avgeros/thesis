import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleUserTypeSelection = (userType) => {
    navigate(`/register/${userType}`);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background: "linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #bbf7d0 100%)",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        margin: 0,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color="#16a34a"
          gutterBottom
        >
          Καλώς ήρθατε
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
        >
          Επιλέξτε τον τύπο λογαριασμού σας
        </Typography>
      </Box>

      {/* User Type Selection Cards */}
      <Grid container spacing={2} sx={{ maxWidth: '600px', width: '100%', mb: 2 }}>
        {/* Client Card */}
        <Grid item xs={12} sm={6}>
          <Card
            elevation={6}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 12,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#16a34a',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <User color="#fff" size={24} />
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Πελάτης
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Βρείτε επαγγελματίες και κλείστε ραντεβού
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 1.5, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowRight size={18} />}
                onClick={() => handleUserTypeSelection('client')}
                sx={{
                  textTransform: 'none',
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                Εγγραφή ως Πελάτης
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Professional Card */}
        <Grid item xs={12} sm={6}>
          <Card
            elevation={6}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 12,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#2563eb',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <Briefcase color="#fff" size={24} />
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Επαγγελματίας
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Διαχειριστείτε την επιχείρησή σας
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 1.5, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowRight size={18} />}
                onClick={() => handleUserTypeSelection('professional')}
                sx={{
                  textTransform: 'none',
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                Εγγραφή ως Επαγγελματίας
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Login Link */}
      <Typography variant="caption" textAlign="center">
        Έχεις ήδη λογαριασμό;{' '}
        <Button
          variant="text"
          size="small"
          onClick={() => navigate('/login')}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#16a34a',
            '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.1)' },
          }}
        >
          Σύνδεση
        </Button>
      </Typography>
    </Box>
  );
};

export default Landing;