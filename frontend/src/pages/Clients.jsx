import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, Stack
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getClients, createClient, updateClient, deleteClient } from '../services/authService';
import Layout from '../components/Layout';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [isEdit, setIsEdit] = useState(false);

  const load = () => {
    setLoading(true);
    getClients()
      .then(res => setClients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (client) => {
    if (client) {
      setCurrent({ ...client });
      setIsEdit(true);
    } else {
      setCurrent({ full_name: '', email: '', phone: '', notes: '' });
      setIsEdit(false);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    const payload = {
      full_name: current.full_name,
      email: current.email || '',
      phone: current.phone || '',
      notes: current.notes || '',
    };
    const action = isEdit
      ? updateClient(current.id, payload)
      : createClient(payload);

    action.then(() => { load(); handleClose(); })
          .catch(err => console.error(err));
  };

  const handleDelete = id => {
    if (window.confirm('Διαγραφή πελάτη;')) {
      deleteClient(id).then(load);
    }
  };

  return (
    <Layout>
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Πελάτες</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => handleOpen()}>Νέος Πελάτης</Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Όνομα</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Τηλέφωνο</TableCell>
            <TableCell>Σημειώσεις</TableCell>
            <TableCell>Ενέργειες</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.full_name}</TableCell>
              <TableCell>{c.email || '-'}</TableCell>
              <TableCell>{c.phone || '-'}</TableCell>
              <TableCell>{c.notes || '-'}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpen(c)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(c.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{isEdit ? 'Επεξεργασία Πελάτη' : 'Νέος Πελάτης'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Όνομα" fullWidth sx={{ mb: 2 }}
            value={current.full_name}
            onChange={e => setCurrent(prev => ({ ...prev, full_name: e.target.value }))}
          />
          <TextField
            label="Email" fullWidth sx={{ mb: 2 }}
            value={current.email}
            onChange={e => setCurrent(prev => ({ ...prev, email: e.target.value }))}
          />
          <TextField
            label="Τηλέφωνο" fullWidth sx={{ mb: 2 }}
            value={current.phone}
            onChange={e => setCurrent(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            label="Σημειώσεις" fullWidth multiline rows={3}
            value={current.notes}
            onChange={e => setCurrent(prev => ({ ...prev, notes: e.target.value }))}
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
