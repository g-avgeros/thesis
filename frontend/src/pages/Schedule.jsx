import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Fade,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save,
} from 'lucide-react';
import Layout from '../components/Layout';

const daysOfWeek = [
  { value: 'monday', label: 'Δευτέρα' },
  { value: 'tuesday', label: 'Τρίτη' },
  { value: 'wednesday', label: 'Τετάρτη' },
  { value: 'thursday', label: 'Πέμπτη' },
  { value: 'friday', label: 'Παρασκευή' },
  { value: 'saturday', label: 'Σάββατο' },
  { value: 'sunday', label: 'Κυριακή' },
];

// Generate time options for dropdowns
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = hour === 0 && minute === 0 
        ? '12:00 πμ' 
        : hour < 12 
          ? `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} πμ`
          : hour === 12 
            ? `12:${minute.toString().padStart(2, '0')} μμ`
            : `${hour - 12}:${minute.toString().padStart(2, '0')} μμ`;
      
      options.push({
        value: timeString,
        label: displayTime
      });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const Schedule = () => {
  const [bulkFormData, setBulkFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing schedules
  const loadSchedules = async () => {
    try {
      const professionalId = localStorage.getItem('user_id');
      if (!professionalId) return;

      const response = await fetch(`http://localhost:5000/schedules?professional_id=${professionalId}`);
      const result = await response.json();

      if (response.ok && result.schedules) {
        // Convert schedules to bulk form data format
        const loadedData = {};
        daysOfWeek.forEach(day => {
          const existingSchedule = result.schedules.find(s => s.day_of_week === day.value);
          loadedData[day.value] = {
            isAvailable: existingSchedule ? existingSchedule.is_available : false,
            startTime: existingSchedule ? existingSchedule.start_time : '09:00',
            endTime: existingSchedule ? existingSchedule.end_time : '17:00',
          };
        });
        setBulkFormData(loadedData);
      } else {
        // Initialize with default values if no schedules exist
        const initialBulkData = {};
        daysOfWeek.forEach(day => {
          initialBulkData[day.value] = {
            isAvailable: false,
            startTime: '09:00',
            endTime: '17:00',
          };
        });
        setBulkFormData(initialBulkData);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      // Initialize with default values on error
      const initialBulkData = {};
      daysOfWeek.forEach(day => {
        initialBulkData[day.value] = {
          isAvailable: false,
          startTime: '09:00',
          endTime: '17:00',
        };
      });
      setBulkFormData(initialBulkData);
    }
  };

  // Initialize bulk form data with all days
  useEffect(() => {
    loadSchedules();
  }, []);

  const handleBulkInputChange = (dayValue, field, value) => {
    setBulkFormData(prev => {
      const currentDayData = prev[dayValue] || {};
      
      // If toggling availability to true, ensure we have default times
      if (field === 'isAvailable' && value === true) {
        return {
          ...prev,
          [dayValue]: {
            ...currentDayData,
            [field]: value,
            startTime: currentDayData.startTime || '09:00',
            endTime: currentDayData.endTime || '17:00',
          },
        };
      }
      
      return {
        ...prev,
        [dayValue]: {
          ...currentDayData,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      // Clear any previous error messages
      setErrorMessage('');
      
      // Debug: Log the current form data
      console.log('Current form data:', bulkFormData);
      
      // Validate that at least one day is available
      const hasAvailableDay = Object.values(bulkFormData).some(day => day.isAvailable);
      
      if (!hasAvailableDay) {
        setErrorMessage('Παρακαλώ επιλέξτε τουλάχιστον μία ημέρα ως διαθέσιμη.');
        return;
      }

      // Validate time ranges for available days
      for (const [dayValue, dayData] of Object.entries(bulkFormData)) {
        if (dayData.isAvailable) {
          // Check if time fields exist and are not empty strings
          if (!dayData.startTime || !dayData.endTime || 
              dayData.startTime === '' || dayData.endTime === '' ||
              dayData.startTime === '--:--' || dayData.endTime === '--:--') {
            setErrorMessage(`Παρακαλώ συμπληρώστε τις ώρες για ${daysOfWeek.find(d => d.value === dayValue)?.label}.`);
            return;
          }
          
          if (dayData.startTime >= dayData.endTime) {
            setErrorMessage(`Η ώρα έναρξης πρέπει να είναι πριν την ώρα λήξης για ${daysOfWeek.find(d => d.value === dayValue)?.label}.`);
            return;
          }
        }
      }

      // Get professional ID from localStorage
      const professionalId = localStorage.getItem('user_id');
      const userType = localStorage.getItem('user_type');
      
      console.log('Professional ID:', professionalId);
      console.log('User Type:', userType);
      
      if (!professionalId) {
        setErrorMessage('Δεν βρέθηκε το ID του επαγγελματία. Παρακαλώ συνδεθείτε ξανά.');
        return;
      }
      
      // Check if user is a professional
      if (userType !== 'professional') {
        setErrorMessage('Αυτή η λειτουργία είναι διαθέσιμη μόνο για επαγγελματίες.');
        return;
      }

      // Prepare schedules data
      const schedulesData = Object.entries(bulkFormData).map(([dayValue, dayData]) => ({
        day_of_week: dayValue,
        start_time: dayData.startTime,
        end_time: dayData.endTime,
        is_available: dayData.isAvailable
      }));

      // Save to backend
      const response = await fetch('http://localhost:5000/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: parseInt(professionalId),
          schedules: schedulesData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('Το πρόγραμμα αποθηκεύτηκε επιτυχώς!');
        setErrorMessage('');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(result.error || 'Προέκυψε σφάλμα κατά την αποθήκευση.');
      }
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      setErrorMessage('Προέκυψε σφάλμα κατά την αποθήκευση. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  return (
    <Layout>
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
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              p: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={800}
                sx={{ 
                  color: '#1e40af',
                  mb: 1,
                }}
              >
                Διαχείριση Προγράμματος
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ορίστε τις ώρες εργασίας σας για κάθε ημέρα της εβδομάδας
              </Typography>
            </Box>
            
            <Button
              onClick={handleSave}
              startIcon={<Save size={20} />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 250ms ease-in-out',
              }}
            >
              Αποθήκευση Όλων
            </Button>
          </Box>
        </Fade>

        {/* Success/Error Messages */}
        {successMessage && (
          <Fade in timeout={500}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
              }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {errorMessage && (
          <Fade in timeout={500}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
              }}
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>
          </Fade>
        )}

        {/* Schedule Grid */}
        <Slide direction="up" in timeout={500}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1e40af" mb={3}>
                Ορίστε τις ώρες εργασίας για κάθε ημέρα της εβδομάδας
              </Typography>
              
              <Grid container spacing={3}>
                {daysOfWeek.map((day, index) => (
                  <Grid item xs={12} sm={6} md={4} key={day.value}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        height: '100%',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '1.1rem' }}>
                            {day.label}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>
                              Ανοιχτό:
                            </Typography>
                            <Box
                              onClick={() => handleBulkInputChange(day.value, 'isAvailable', !bulkFormData[day.value]?.isAvailable)}
                              sx={{
                                width: 48,
                                height: 24,
                                borderRadius: '12px',
                                bgcolor: bulkFormData[day.value]?.isAvailable ? '#10b981' : '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 250ms ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  bgcolor: 'white',
                                  ml: bulkFormData[day.value]?.isAvailable ? '26px' : '2px',
                                  transition: 'all 250ms ease-in-out',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {bulkFormData[day.value]?.isAvailable && (
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                                  Ώρα Έναρξης
                                </InputLabel>
                                <Select
                                  value={bulkFormData[day.value]?.startTime || '09:00'}
                                  onChange={(e) => handleBulkInputChange(day.value, 'startTime', e.target.value)}
                                  label="Ώρα Έναρξης"
                                  sx={{
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6b7280',
                                      borderWidth: 2,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#3b82f6',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#3b82f6',
                                      borderWidth: 2,
                                    },
                                    '& .MuiSelect-select': {
                                      color: '#1f2937',
                                      fontWeight: 500,
                                      fontSize: '0.95rem',
                                      padding: '8px 12px',
                                    },
                                  }}
                                >
                                  {timeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                                  Ώρα Λήξης
                                </InputLabel>
                                <Select
                                  value={bulkFormData[day.value]?.endTime || '17:00'}
                                  onChange={(e) => handleBulkInputChange(day.value, 'endTime', e.target.value)}
                                  label="Ώρα Λήξης"
                                  sx={{
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#6b7280',
                                      borderWidth: 2,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#3b82f6',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#3b82f6',
                                      borderWidth: 2,
                                    },
                                    '& .MuiSelect-select': {
                                      color: '#1f2937',
                                      fontWeight: 500,
                                      fontSize: '0.95rem',
                                      padding: '8px 12px',
                                    },
                                  }}
                                >
                                  {timeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Slide>
      </Box>
    </Layout>
  );
};

export default Schedule;