import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarMonth, Add } from '@mui/icons-material';
import Layout from '../components/Layout';
import { createAppointment, getAppointments, getSchedules, getClients, getServices, cancelAppointment } from '../services/authService';
import BookingModal from '../components/BookingModal';

const ProfessionalDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  // kept for future use but avoid unused var warning by referencing in state
  const [newEvent, setNewEvent] = useState({ service: '', client: '', date: '', timeslot: '' });
  void newEvent;
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
  const dayNames = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  useEffect(() => {
    const load = async () => {
      const pid = Number(localStorage.getItem('user_id')) || 1;
      const [a, s, c, sv] = await Promise.all([
        getAppointments(),
        getSchedules(pid),
        getClients(),
        getServices(),
      ]);
      setAppointments(a.data || []);
      setSchedules(s.data?.schedules || []);
      setClients(c.data || []);
      setServices(Array.isArray(sv.data) ? sv.data : (sv.data?.services || []));
    };
    load();
  }, [openDialog]);

  const refreshAppointments = async () => {
    try {
      const a = await getAppointments();
      setAppointments(a.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper: get local YYYY-MM-DD for a Date
  const toLocalYMD = (d) => {
    if (!d) return '';
    const n = new Date(d.getTime());
    n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    return n.toISOString().slice(0, 10);
  };

  const appointmentsForSelected = useMemo(() => {
    if (!selectedDate) return [];
    const selectedYMD = toLocalYMD(selectedDate);
    const filtered = (appointments || []).filter((a) => {
      const start = String(a.start_time || '');
      const ymd = start.slice(0, 10); // works for both 'YYYY-MM-DD HH:mm:ss' and ISO
      return ymd === selectedYMD;
    });
    const toMs = (s) => new Date((String(s).includes('T') ? String(s) : String(s).replace(' ', 'T'))).getTime();
    return filtered.sort((a, b) => toMs(a.start_time) - toMs(b.start_time));
  }, [appointments, selectedDate]);

  const parseLocalDateTime = (val) => {
    if (!val) return new Date();
    const s = String(val);
    // Treat DB strings like 'YYYY-MM-DD HH:mm:ss' as local by replacing space with 'T'
    const isoLocal = s.includes('T') ? s : s.replace(' ', 'T');
    return new Date(isoLocal);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleBookingConfirm = async (bookingData) => {
    try {
      const { service, client, date, timeslot, serviceDurationMinutes } = bookingData;
      const start = new Date(`${date}T${timeslot}:00`);
      const end = new Date(start.getTime() + (serviceDurationMinutes || 30) * 60 * 1000);

      const pad = (n) => n.toString().padStart(2, '0');
      const formatLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      await createAppointment({
        service_id: service,
        client_id: client,
        start_time: formatLocal(start),
        end_time: formatLocal(end),
        status: 'scheduled',
      });
      // Refresh list so it appears immediately under the calendar
      await refreshAppointments();
    } catch (e) {
      console.error(e);
    } finally {
      setOpenDialog(false);
      setNewEvent(prev => prev); // keep state; not used elsewhere
    }
  };

  const handleBookingClose = () => {
    setOpenDialog(false);
    setNewEvent(prev => prev);
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarMonth color="primary" />
              <Box>
                <Typography variant="h5">Ημερολόγιο</Typography>
                <Typography color="text.secondary">
                  {currentDate.toLocaleDateString('el-GR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Νέο Γεγονός
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <IconButton onClick={() => navigateMonth(-1)}><ChevronLeft /></IconButton>
            <Typography variant="h6">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Typography>
            <IconButton onClick={() => navigateMonth(1)}><ChevronRight /></IconButton>
          </Box>

          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center">
            {dayNames.map(day => (
              <Typography key={day} variant="subtitle2" gutterBottom>{day}</Typography>
            ))}

            {days.map((day, idx) => {
              const today = new Date();
              today.setHours(0,0,0,0);
              const isPast = day && new Date(day.setHours(0,0,0,0)) < today;
              const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
              const available = day && schedules.some(s => s.day_of_week === dayNames[day.getDay()] && s.is_available);
              const disabled = !day || isPast || !available;
              return (
              <Box
                key={idx}
                height={60}
                border={1}
                borderColor="grey.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor={day && day.toDateString() === new Date().toDateString() ? 'primary.light' : 'transparent'}
                sx={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}
                onClick={() => !disabled && setSelectedDate(new Date(day))}
              >
                <Typography color={day ? 'text.primary' : 'transparent'}>
                  {day ? day.getDate() : ''}
                </Typography>
              </Box>
            );})}
          </Box>
        </Paper>

        {/* Appointments list for selected day */}
        {selectedDate && (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Κρατήσεις για {selectedDate.toLocaleDateString('el-GR')}
            </Typography>
            <Stack spacing={1}>
              {appointmentsForSelected.map(a => (
                <Box key={a.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <Chip label={`${parseLocalDateTime(a.start_time).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })} - ${parseLocalDateTime(a.end_time).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`} />
                    {a.status === 'cancelled' && (
                      <Chip size="small" color="error" variant="outlined" label="Ακυρωμένο" />
                    )}
                  </Box>
                  {(() => {
                    const client = clients.find(cl => String(cl.id) === String(a.client_id));
                    const svc = services.find(sv => String(sv.id) === String(a.service_id));
                    const clientName = client?.full_name || '—';
                    const clientPhone = client?.phone || '—';
                    const svcName = svc?.name || '—';
                    const svcDuration = svc?.duration_minutes != null ? `${svc.duration_minutes}′` : '—';
                    const svcPrice = svc?.price != null ? `${Number(svc.price).toFixed(2)}€` : '—';
                    return (
                      <Box sx={{ display:'flex', alignItems:'center', gap:2, flexGrow:1 }}>
                        <Typography variant="body1" sx={{ opacity: a.status === 'cancelled' ? 0.6 : 1 }}>
                          {clientName} · {clientPhone} · {svcName} ({svcDuration}, {svcPrice})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={a.status === 'cancelled'}
                          onClick={() => { setAppointmentToCancel(a); setConfirmCancelOpen(true); }}
                        >
                          Ακύρωση
                        </Button>
                      </Box>
                    );
                  })()}
                </Box>
              ))}
              {appointmentsForSelected.length === 0 && (
                <Typography color="text.secondary">Δεν υπάρχουν κρατήσεις για αυτή την ημέρα.</Typography>
              )}
            </Stack>
          </Paper>
        )}

        <BookingModal
          open={openDialog}
          onClose={handleBookingClose}
          onConfirm={handleBookingConfirm}
          professionalId={1} // You can get this from user context or props
        />

        {/* Cancel Confirm Dialog */}
        <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
          <DialogTitle>Επιβεβαίωση Ακύρωσης</DialogTitle>
          <DialogContent>
            <Typography>Θέλετε σίγουρα να ακυρώσετε αυτό το ραντεβού;</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCancelOpen(false)}>Όχι</Button>
            <Button color="error" variant="contained" onClick={async () => {
              try {
                if (appointmentToCancel) {
                  await cancelAppointment(appointmentToCancel.id);
                  await refreshAppointments();
                }
              } catch (e) { console.error(e); }
              finally { setConfirmCancelOpen(false); setAppointmentToCancel(null); }
            }}>Ναι, ακύρωση</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ProfessionalDashboard;
