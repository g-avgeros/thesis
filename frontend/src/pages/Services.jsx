import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, Stack
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  getServices, createService,
  updateService, deleteService
} from '../services/authService';
import Layout from '../components/Layout';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState({ name: '', duration_minutes: '', price: '' });
  const [isEdit, setIsEdit] = useState(false);

  const load = () => {
    setLoading(true);
    getServices()
      .then(res => setServices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (svc) => {
    if (svc) {
      setCurrent({ ...svc });
      setIsEdit(true);
    } else {
      setCurrent({ name: '', duration_minutes: '', price: '' });
      setIsEdit(false);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    const payload = {
      name: current.name,
      duration_minutes: +current.duration_minutes,
      price: +current.price,
    };
    const action = isEdit
      ? updateService(current.id, payload)
      : createService(payload);

    action.then(() => { load(); handleClose(); })
          .catch(err => console.error(err));
  };

  const handleDelete = id => {
    if (window.confirm('Διαγραφή υπηρεσίας;')) {
      deleteService(id).then(load);
    }
  };

  return (
    <Layout>
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Υπηρεσίες</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => handleOpen()}>Νέα Υπηρεσία</Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Υπηρεσία</TableCell>
            <TableCell>Διάρκεια (Λεπτά)</TableCell>
            <TableCell>Τιμή</TableCell>
            <TableCell>Ενέργειες</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.duration_minutes}</TableCell>
              <TableCell>{s.price.toFixed(2)}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpen(s)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(s.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{isEdit ? 'Επεξεργασία Υπηρεσίας' : 'Νέα Υπηρεσία'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Υπηρεσία" fullWidth sx={{ mb: 2 }}
            value={current.name}
            onChange={e => setCurrent(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Διάρκεια (λεπτά)" fullWidth sx={{ mb: 2 }}
            type="number"
            value={current.duration_minutes}
            onChange={e => setCurrent(prev => ({ ...prev, duration_minutes: e.target.value }))}
          />
          <TextField
            label="Τιμή" fullWidth sx={{ mb: 2 }}
            type="number"
            value={current.price}
            onChange={e => setCurrent(prev => ({ ...prev, price: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Ακύρωση</Button>
          <Button variant="contained" onClick={handleSave}>Αποθήκευση</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Layout>
  );
}
