import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
  Fade,
} from '@mui/material';
import {
  X,
  Calendar,
  Clock,
  Briefcase,
  User,
  Check,
} from 'lucide-react';

const BookingModal = ({ open, onClose, onConfirm, professionalId }) => {
  const [formData, setFormData] = useState({
    service: '',
    client: '',
    date: '',
    timeslot: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate time slots based on professional's schedule
  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = hour < 12 
          ? `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} πμ`
          : hour === 12 
            ? `12:${minute.toString().padStart(2, '0')} μμ`
            : `${hour - 12}:${minute.toString().padStart(2, '0')} μμ`;
        
        slots.push({
          id: `${date}-${timeString}`,
          time: timeString,
          displayTime: displayTime,
          available: Math.random() > 0.3, // Mock availability
        });
      }
    }
    return slots;
  };

  // Fetch services and clients data when modal opens
  useEffect(() => {
    if (open) {
      fetchServices();
      fetchClients();
    }
  }, [open]);

  useEffect(() => {
    if (formData.date) {
      setAvailableSlots(generateTimeSlots(formData.date));
    }
  }, [formData.date]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/services');
      const result = await response.json();
      if (response.ok) {
        setServices(result.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/clients');
      const result = await response.json();
      if (response.ok) {
        setClients(result.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setFormData(prev => ({
        ...prev,
        timeslot: slot.time
      }));
    }
  };

  const handleConfirm = () => {
    if (formData.service && formData.client && formData.date && selectedSlot) {
      onConfirm({
        ...formData,
        professionalId,
        selectedSlot,
      });
      onClose();
    }
  };


  const resetForm = () => {
    setFormData({
      service: '',
      client: '',
      date: '',
      timeslot: '',
    });
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Νέο Ραντεβού
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Service Selection */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Briefcase size={20} color="#3b82f6" />
              <Typography variant="subtitle1" fontWeight={600} color="#374151">
                Υπηρεσία
              </Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Επιλέξτε Υπηρεσία</InputLabel>
              <Select
                value={formData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                label="Επιλέξτε Υπηρεσία"
                disabled={loading}
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                    borderWidth: 2,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                  },
                }}
              >
                {services.length === 0 && !loading ? (
                  <MenuItem disabled>
                    <Typography color="text.secondary">Δεν υπάρχουν διαθέσιμες υπηρεσίες</Typography>
                  </MenuItem>
                ) : (
                  services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography fontWeight={500}>{service.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={`${service.duration_minutes || 30} λεπτά`}
                            size="small"
                            sx={{ 
                              bgcolor: '#f0f9ff', 
                              color: '#1e40af',
                              fontWeight: 500,
                            }}
                          />
                          <Typography variant="body2" color="#059669" fontWeight={600}>
                            €{service.price || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Client Selection */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <User size={20} color="#8b5cf6" />
              <Typography variant="subtitle1" fontWeight={600} color="#374151">
                Πελάτης
              </Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Επιλέξτε Πελάτη</InputLabel>
              <Select
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                label="Επιλέξτε Πελάτη"
                disabled={loading}
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                    borderWidth: 2,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                  },
                }}
              >
                {clients.length === 0 && !loading ? (
                  <MenuItem disabled>
                    <Typography color="text.secondary">Δεν υπάρχουν διαθέσιμοι πελάτες</Typography>
                  </MenuItem>
                ) : (
                  clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      <Box>
                        <Typography fontWeight={500}>{client.full_name}</Typography>
                        <Typography variant="body2" color="#6b7280">
                          {client.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Date Selection */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Calendar size={20} color="#f59e0b" />
              <Typography variant="subtitle1" fontWeight={600} color="#374151">
                Ημερομηνία
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Ημερομηνία Ραντεβού"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  borderWidth: 2,
                  '& fieldset': {
                    borderColor: '#d1d5db',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

          {/* Time Slots Selection - Only show after date is selected */}
          {formData.date && (
            <Fade in timeout={300}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Clock size={20} color="#ef4444" />
                  <Typography variant="subtitle1" fontWeight={600} color="#374151">
                    Ώρα
                  </Typography>
                </Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 2 }}>
                  Διαθέσιμες ώρες για {new Date(formData.date).toLocaleDateString('el-GR')}:
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  <Grid container spacing={1}>
                    {availableSlots.map((slot) => (
                      <Grid item xs={6} sm={4} key={slot.id}>
                        <Button
                          variant={selectedSlot?.id === slot.id ? 'contained' : 'outlined'}
                          size="small"
                          fullWidth
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            py: 1,
                            ...(selectedSlot?.id === slot.id && {
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                            }),
                            ...(!slot.available && {
                              opacity: 0.4,
                              cursor: 'not-allowed',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 200ms ease-in-out',
                          }}
                        >
                          {slot.displayTime}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#6b7280',
            border: '2px solid #e5e7eb',
            '&:hover': {
              bgcolor: '#f9fafb',
              borderColor: '#d1d5db',
            },
            transition: 'all 200ms ease-in-out',
          }}
        >
          Ακύρωση
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!formData.service || !formData.client || !formData.date || !selectedSlot}
          startIcon={<Check size={18} />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
            },
            '&:disabled': {
              background: '#d1d5db',
              color: '#9ca3af',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 200ms ease-in-out',
          }}
        >
          Δημιουργία Ραντεβού
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;