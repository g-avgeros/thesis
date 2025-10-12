import React, { useState, useEffect, useCallback } from 'react';
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import elLocale from 'date-fns/locale/el';
import {
  X,
  Calendar,
  Clock,
  Briefcase,
  User,
  Check,
} from 'lucide-react';
import { getServices, getClients, createClient, getSchedules, getAppointments } from '../services/authService';
import Autocomplete from '@mui/material/Autocomplete';

const BookingModal = ({ open, onClose, onConfirm, professionalId }) => {
  // Helper functions to handle date-only values in LOCAL time (avoid UTC shifts)
  const dateToYMDLocal = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseYMDToLocalDate = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

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
  const [clientInput, setClientInput] = useState('');
  const [selectedClient, setSelectedClient] = useState(null); // { id, label, email }
  const [clientPhone, setClientPhone] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Generate slots from schedules and exclude booked appointments
  const generateSlotsFromSchedule = useCallback((dateStr) => {
    const date = parseYMDToLocalDate(dateStr);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const day = dayNames[date.getDay()];
    const entry = schedules.find(s => s.day_of_week === day && s.is_available);
    if (!entry) return [];

    const toMinutes = (t) => {
      const [h,m] = (t || '00:00').split(':').map(Number);
      return h*60 + m;
    };
    const start = toMinutes(entry.start_time || '09:00');
    const end = toMinutes(entry.end_time || '17:00');

    // compute service duration minutes (default 30)
    const selectedService = services.find(s => String(s.id) === String(formData.service));
    const slotDuration = selectedService?.duration_minutes || 30;
    const grid = 30; // generate every 30 minutes

    const bookedForDay = (appointments || []).filter(a => {
      const d = new Date(a.start_time);
      return dateToYMDLocal(d) === dateStr;
    }).map(a => {
      const s = new Date(a.start_time);
      const e = new Date(a.end_time);
      return { start: s.getHours()*60 + s.getMinutes(), end: e.getHours()*60 + e.getMinutes() };
    });

    const slots = [];
    for (let minutes = start; minutes + slotDuration <= end; minutes += grid) {
      const hh = Math.floor(minutes / 60).toString().padStart(2,'0');
      const mm = (minutes % 60).toString().padStart(2,'0');
      const timeString = `${hh}:${mm}`;
      const hour = Number(hh);
      const displayTime = hour < 12 ? `${hour === 0 ? 12 : hour}:${mm} πμ` : (hour === 12 ? `12:${mm} μμ` : `${hour - 12}:${mm} μμ`);

      // check overlap for full duration window
      const slotEnd = minutes + slotDuration;
      const overlaps = bookedForDay.some(b => minutes < b.end && slotEnd > b.start);
      if (!overlaps) {
        slots.push({ id: `${dateStr}-${timeString}`, time: timeString, displayTime, available: true });
      }
    }
    return slots;
  }, [schedules, appointments, services, formData.service]);

  // Fetch services and clients data when modal opens
  useEffect(() => {
    if (open) {
      // Reset all form-related state each time the modal opens
      resetForm();
      setSelectedClient(null);
      setClientInput('');
      setClientPhone('');
      fetchServices();
      fetchClients();
    }
  }, [open]);

  // Prepare schedules/appointments loader
  const professionalIdFromContext = useCallback(() => {
    return professionalId || Number(localStorage.getItem('user_id')) || undefined;
  }, [professionalId]);

  const fetchSchedulesAndAppointments = useCallback(async () => {
    try {
      const pid = professionalIdFromContext();
      if (!pid) return;
      const [schedRes, apptRes] = await Promise.all([
        getSchedules(pid),
        getAppointments(),
      ]);
      setSchedules(schedRes?.data?.schedules || []);
      setAppointments(apptRes?.data || []);
    } catch (e) {
      console.error('Failed to load schedules/appointments', e);
    }
  }, [professionalIdFromContext]);

  // Load schedules and appointments when modal opens
  useEffect(() => {
    if (!open) return;
    const run = async () => {
      await fetchSchedulesAndAppointments();
    };
    run();
  }, [open, fetchSchedulesAndAppointments]);

  useEffect(() => {
    if (formData.date) {
      const slots = generateSlotsFromSchedule(formData.date);
      setAvailableSlots(slots);
    }
  }, [formData.date, schedules, appointments, generateSlotsFromSchedule]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getServices();
      const data = res?.data;
      setServices(Array.isArray(data) ? data : (data?.services || []));
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await getClients();
      const data = res?.data;
      const list = Array.isArray(data) ? data : (data?.clients || []);
      setClients(list);
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

  const handleConfirm = async () => {
    if (!formData.service || !formData.date || !selectedSlot) return;

    let clientId = formData.client;

    // If no existing client is selected but there is input, auto-create client
    if (!clientId && clientInput && clientInput.trim().length > 0) {
      if (!clientPhone || clientPhone.trim().length === 0) {
        return; // guard: phone required for auto-create
      }
      try {
        setLoading(true);
        const full_name = clientInput.trim();
        const res = await createClient({ full_name, phone: clientPhone.trim() });
        clientId = res?.data?.id;
        if (clientId) {
          // Update local clients list to include the newly created one
          setClients(prev => [
            ...prev,
            { id: clientId, full_name, email: '', phone: clientPhone.trim() },
          ]);
          setSelectedClient({ id: clientId, label: clientInput.trim(), email: '' });
        }
      } catch (e) {
        console.error('Failed to auto-create client', e);
        alert('Αποτυχία δημιουργίας πελάτη. Παρακαλώ δοκιμάστε ξανά.');
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      const svc = services.find(s => String(s.id) === String(formData.service));
      const serviceDurationMinutes = svc?.duration_minutes || 30;
      onConfirm({
        ...formData,
        client: clientId,
        professionalId,
        selectedSlot,
        serviceDurationMinutes,
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
    // also clear client selector state
    setSelectedClient(null);
    setClientInput('');
    setClientPhone('');
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

          {/* Client Selection (Typeahead) */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <User size={20} color="#8b5cf6" />
              <Typography variant="subtitle1" fontWeight={600} color="#374151">
                Πελάτης
              </Typography>
            </Box>
            <Autocomplete
              freeSolo
              options={clients.map(c => ({ id: c.id, label: c.full_name, email: c.email, phone: c.phone }))}
              value={selectedClient}
              onChange={(e, newValue) => {
                setSelectedClient(newValue);
                handleInputChange('client', newValue?.id || '');
                if (newValue?.id) {
                  setClientPhone(newValue.phone || '');
                } else {
                  setClientPhone('');
                }
              }}
              inputValue={clientInput}
              onInputChange={(e, newInput) => {
                setClientInput(newInput);
                if (!newInput) {
                  setSelectedClient(null);
                  handleInputChange('client', '');
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Επιλέξτε ή πληκτρολογήστε Πελάτη"
                  placeholder="Π.χ. Γιάννης Παπαδόπουλος"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id || option.label}>
                  <Box>
                    <Typography fontWeight={500}>{option.label}</Typography>
                    {option.email && (
                      <Typography variant="body2" color="#6b7280">{option.email}</Typography>
                    )}
                  </Box>
                </li>
              )}
            />
            {/* Phone field: visible always; disabled when existing client selected */}
            <TextField
              label={selectedClient?.id ? 'Τηλέφωνο πελάτη' : 'Τηλέφωνο (απαραίτητο για νέο πελάτη)'}
              fullWidth
              required={!selectedClient?.id}
              disabled={!!selectedClient?.id}
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>

          {/* Date Selection */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Calendar size={20} color="#f59e0b" />
              <Typography variant="subtitle1" fontWeight={600} color="#374151">
                Ημερομηνία
              </Typography>
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={elLocale}>
              <DatePicker
                label="Ημερομηνία Ραντεβού"
                value={formData.date ? parseYMDToLocalDate(formData.date) : null}
                onChange={(newValue) => {
                  const d = newValue ? new Date(newValue) : null;
                  handleInputChange('date', d ? dateToYMDLocal(d) : '');
                }}
                shouldDisableDate={(day) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const current = new Date(day);
                  current.setHours(0,0,0,0);
                  // disable past dates
                  if (current < today) return true;
                  // disable weekdays without available schedule
                  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                  const dayName = dayNames[current.getDay()];
                  const available = schedules.some(s => s.day_of_week === dayName && s.is_available);
                  return !available;
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
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
                  Διαθέσιμες ώρες για {parseYMDToLocalDate(formData.date).toLocaleDateString('el-GR')}:
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
          disabled={!formData.service || (!formData.client && (!clientInput || !clientPhone)) || !formData.date || !selectedSlot}
          variant="contained"
          startIcon={<Check size={18} />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
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