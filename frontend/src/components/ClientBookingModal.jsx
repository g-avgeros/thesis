import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid, Chip, Fade, IconButton
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import elLocale from 'date-fns/locale/el';
import { Calendar, Clock, Briefcase, X } from 'lucide-react';
import { getSchedules, getAppointments } from '../services/authService';

function dateToYMDLocal(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const ClientBookingModal = ({ open, onClose, onConfirm, professionalId, servicesProvider }) => {
  const [formData, setFormData] = useState({ service: '', date: '', timeslot: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInitial = useCallback(async () => {
    if (!open || !professionalId) return;
    setFormData({ service: '', date: '', timeslot: '' });
    setAvailableSlots([]);
    setSelectedSlot(null);
    try {
      setLoading(true);
      const [schedRes, apptRes] = await Promise.all([
        getSchedules(professionalId),
        getAppointments()
      ]);
      setSchedules(schedRes?.data?.schedules || []);
      setAppointments(apptRes?.data || []);
      // servicesProvider should return array of services for this professional
      const svcList = typeof servicesProvider === 'function' ? await servicesProvider(professionalId) : [];
      setServices(Array.isArray(svcList) ? svcList : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [open, professionalId, servicesProvider]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

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

    const selectedService = services.find(s => String(s.id) === String(formData.service));
    const slotDuration = selectedService?.duration_minutes || 30;
    const grid = 30;

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
      const hh = String(Math.floor(minutes / 60)).padStart(2,'0');
      const mm = String(minutes % 60).padStart(2,'0');
      const timeString = `${hh}:${mm}`;
      const hour = Number(hh);
      const displayTime = hour < 12 ? `${hour === 0 ? 12 : hour}:${mm} πμ` : (hour === 12 ? `12:${mm} μμ` : `${hour - 12}:${mm} μμ`);
      const slotEnd = minutes + slotDuration;
      const overlaps = bookedForDay.some(b => minutes < b.end && slotEnd > b.start);
      if (!overlaps) slots.push({ id: `${dateStr}-${timeString}`, time: timeString, displayTime, available: true });
    }
    return slots;
  }, [schedules, appointments, services, formData.service]);

  useEffect(() => {
    if (formData.date) setAvailableSlots(generateSlotsFromSchedule(formData.date));
  }, [formData.date, schedules, appointments, generateSlotsFromSchedule]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSlotSelect = (slot) => { if (slot.available) { setSelectedSlot(slot); setFormData(p => ({...p, timeslot: slot.time })); } };

  const handleConfirm = () => {
    if (!formData.service || !formData.date || !selectedSlot) return;
    onConfirm({ ...formData, professionalId, selectedSlot });
  };

  const shouldDisableDate = (day) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const current = new Date(day); current.setHours(0,0,0,0);
    if (current < today) return true;
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayName = dayNames[current.getDay()];
    return !schedules.some(s => s.day_of_week === dayName && s.is_available);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            onClick={onClose}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
          >
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Service */}
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
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db', borderWidth: 2 },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6', borderWidth: 2 },
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
                          <Chip label={`${service.duration_minutes || 30} λεπτά`} size="small" sx={{ bgcolor: '#f0f9ff', color: '#1e40af', fontWeight: 500 }} />
                          <Typography variant="body2" color="#059669" fontWeight={600}>€{service.price || 0}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Date */}
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
                onChange={(newValue) => handleInputChange('date', newValue ? dateToYMDLocal(newValue) : '')}
                shouldDisableDate={shouldDisableDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>

          {/* Timeslots */}
          {formData.date && (
            <Fade in timeout={300}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Clock size={20} color="#ef4444" />
                  <Typography variant="subtitle1" fontWeight={600} color="#374151">Ώρα</Typography>
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
                            borderRadius: '8px', textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, py: 1,
                            ...(selectedSlot?.id === slot.id && { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }),
                            ...(!slot.available && { opacity: 0.4, cursor: 'not-allowed' }),
                            '&:hover': { transform: 'translateY(-1px)' }, transition: 'all 200ms ease-in-out',
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
          onClick={onClose}
          sx={{ px: 3, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: '#6b7280', border: '2px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }, transition: 'all 200ms ease-in-out' }}
        >
          Ακύρωση
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!formData.service || !formData.date || !selectedSlot}
          variant="contained"
          sx={{ px: 3, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', '&:hover': { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)' }, '&:disabled': { background: '#d1d5db', color: '#9ca3af', boxShadow: 'none', transform: 'none' }, transition: 'all 200ms ease-in-out' }}
        >
          Δημιουργία Ραντεβού
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientBookingModal;


