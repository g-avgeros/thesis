import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarMonth, Add } from '@mui/icons-material';
import Layout from '../components/Layout';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', type: 'meeting' });

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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
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

            {days.map((day, idx) => (
              <Box
                key={idx}
                height={60}
                border={1}
                borderColor="grey.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor={day && day.toDateString() === new Date().toDateString() ? 'primary.light' : 'transparent'}
                sx={{ cursor: day ? 'pointer' : 'default' }}
                onClick={() => day && setSelectedDate(day)}
              >
                <Typography color={day ? 'text.primary' : 'transparent'}>
                  {day ? day.getDate() : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Νέο Γεγονός</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Υπηρεσία"
                value={newEvent.service}
                onChange={(e) => setNewEvent({ ...newEvent, service: e.target.value })}
                fullWidth
              />
              <TextField
                label="Ημερομηνία"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Ώρα"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Τοποθεσία"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                fullWidth
              />
              <TextField
                label="Τύπος"
                select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                fullWidth
              >
                <MenuItem value="meeting">Συνάντηση</MenuItem>
                <MenuItem value="presentation">Παρουσίαση</MenuItem>
                <MenuItem value="personal">Προσωπικό</MenuItem>
              </TextField>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button onClick={() => setOpenDialog(false)}>Ακύρωση</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    // can handle add event logic here
                    setOpenDialog(false);
                    setNewEvent({ title: '', date: '', time: '', location: '', type: 'meeting' });
                  }}
                >
                  Προσθήκη
                </Button>
              </Box>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Calendar;
