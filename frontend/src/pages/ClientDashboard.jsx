import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Badge,
  Divider,
  Fade,
  Slide,
  Skeleton,
} from '@mui/material';
import {
  Search,
  LogOut,
  Settings,
  Clock,
  MapPin,
  Calendar,
  Plus,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfessionals, createAppointmentAsClient, getAppointments, cancelAppointment } from '../services/authService';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ClientBookingModal from '../components/ClientBookingModal';
import axios from 'axios';

const ClientDashboard = () => {
  const [bookings] = useState([]);
  const [clientBookings, setClientBookings] = useState([]);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeProfessionalId, setActiveProfessionalId] = useState(null);
  const navigate = useNavigate();

  // Load professionals from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getProfessionals();
        const list = Array.isArray(res.data) ? res.data : [];
        // Normalize to UI schema
        const normalized = list.map((p, idx) => ({
          id: p.id,
          name: p.full_name || p.name || `Επαγγελματίας #${p.id}`,
          specialty: p.specialty || 'Επαγγελματίας',
          rating: 4.7,
          reviews: 0,
          location: p.location || '—',
          services: p.services?.map(s => s.name) || [],
          priceRange: '—',
          image: null,
          address: p.address || '—',
          categories: p.categories || [],
        }));
        setProfessionals(normalized);
        setFilteredProfessionals(normalized);
      } catch (e) {
        console.error('Failed to load professionals', e);
        setProfessionals([]);
        setFilteredProfessionals([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load client's appointments
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await getAppointments();
        const list = Array.isArray(res.data) ? res.data : [];
        setClientBookings(list);
      } catch (e) {
        setClientBookings([]);
      }
    };
    loadBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const handleProfileSettings = () => {
    navigate('/settings');
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter(professional =>
        professional.name.toLowerCase().includes(term.toLowerCase()) ||
        professional.specialty.toLowerCase().includes(term.toLowerCase()) ||
        professional.location.toLowerCase().includes(term.toLowerCase()) ||
        professional.services.some(service => 
          service.toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredProfessionals(filtered);
    }
  };

  const handleBookAppointment = (professionalId) => {
    setActiveProfessionalId(professionalId);
    setBookingOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Επιβεβαιωμένο';
      case 'pending': return 'Εκκρεμές';
      case 'completed': return 'Ολοκληρωμένο';
      case 'cancelled': return 'Ακυρωμένο';
      default: return status;
    }
  };

  // removed unused formatDate helper


  return (
    <>
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--white) 50%, var(--secondary-50) 100%)',
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-family)',
      }}
      className="animate-fade-in"
    >
      {/* Modern Header */}
      <Fade in timeout={300}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-purple) 100%)',
            color: 'white',
          }}
        >
          {/* Decorative shapes */}
          <Box sx={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ position: 'absolute', right: 80, bottom: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

          <Box sx={{ position: 'relative' }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Καλώς ήρθατε!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Διαχειριστείτε τις κρατήσεις σας και ανακαλύψτε νέους επαγγελματίες
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleProfileSettings}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                width: 48,
                height: 48,
                border: '1px solid rgba(255,255,255,0.25)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.28)',
                  transform: 'scale(1.05)',
                },
                transition: 'all var(--transition-normal)',
              }}
              className="hover-scale"
            >
              <Settings size={20} />
            </IconButton>
            <IconButton
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                width: 48,
                height: 48,
                border: '1px solid rgba(255,255,255,0.25)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.28)',
                  transform: 'scale(1.05)',
                },
                transition: 'all var(--transition-normal)',
              }}
              className="hover-scale"
            >
              <LogOut size={20} />
            </IconButton>
          </Stack>
        </Box>
      </Fade>

      {/* Stats Cards removed as requested */}

      <Grid container spacing={4}>
        {/* Professional Search */}
        <Grid item xs={12} lg={7}>
          <Slide direction="right" in timeout={700}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-xl)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid var(--gray-200)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="var(--primary-800)">
                    Αναζήτηση Επαγγελματιών
                  </Typography>
                  <IconButton
                    sx={{
                      bgcolor: 'var(--primary-100)',
                      color: 'var(--primary-600)',
                      '&:hover': { bgcolor: 'var(--primary-200)' },
                    }}
                  >
                    <Filter size={20} />
                  </IconButton>
                </Box>
                
                <TextField
                  fullWidth
                  placeholder="Αναζήτηση επαγγελματία, υπηρεσία ή τοποθεσία..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="var(--gray-500)" size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--gray-50)',
                      '&:hover': {
                        backgroundColor: 'var(--gray-100)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: 'var(--shadow-md)',
                      },
                    },
                  }}
                />
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, maxHeight: '600px' }}>
                {loading ? (
                  <Stack spacing={2}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} sx={{ p: 2, borderRadius: 'var(--radius-xl)' }}>
                        <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 2 }} />
                      </Card>
                    ))}
                  </Stack>
                ) : filteredProfessionals.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Search size={32} color="var(--gray-400)" />
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Δεν βρέθηκαν επαγγελματίες
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {filteredProfessionals.map((professional, index) => (
                      <Fade in timeout={300 + index * 100} key={professional.id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            transition: 'all var(--transition-normal)',
                            '&:hover': {
                              borderColor: 'var(--primary-300)',
                              boxShadow: 'var(--shadow-lg)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                          className="hover-lift"
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'var(--primary-500)', 
                                  width: 56, 
                                  height: 56,
                                  fontSize: '1.25rem',
                                  fontWeight: 600,
                                }}
                              >
                                {professional.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="h6" fontWeight={600} color="var(--primary-800)">
                                    {professional.name}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="var(--primary-600)" fontWeight={500} gutterBottom>
                                  {professional.specialty}
                                </Typography>
                                
                                {professional.address && professional.address !== '—' && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <MapPin size={14} color="var(--gray-500)" />
                                    <Typography variant="body2" color="text.secondary">
                                      {professional.address}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {professional.priceRange && professional.priceRange !== '—' && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600} color="var(--accent-green)">
                                      {professional.priceRange}
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {professional.categories.slice(0, 3).map((c, index) => (
                                    <Chip
                                      key={index}
                                      label={c.name}
                                      size="small"
                                      sx={{
                                        bgcolor: 'var(--primary-50)',
                                        color: 'var(--primary-700)',
                                        border: '1px solid var(--primary-200)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}
                                    />
                                  ))}
                                  {professional.services.slice(0, 3).map((service, index) => (
                                    <Chip
                                      key={index}
                                      label={service}
                                      size="small"
                                      sx={{
                                        bgcolor: 'var(--primary-50)',
                                        color: 'var(--primary-700)',
                                        border: '1px solid var(--primary-200)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}
                                    />
                                  ))}
                                  {professional.categories.length > 3 && (
                                    <Chip
                                      label={`+${professional.categories.length - 3} άλλα`}
                                      size="small"
                                      sx={{
                                        bgcolor: 'var(--gray-100)',
                                        color: 'var(--gray-600)',
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ p: 3, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleBookAppointment(professional.id)}
                              sx={{
                                bgcolor: 'var(--primary-500)',
                                color: 'white',
                                py: 1.5,
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                '&:hover': { 
                                  bgcolor: 'var(--primary-600)',
                                  transform: 'translateY(-1px)',
                                },
                                transition: 'all var(--transition-normal)',
                              }}
                              className="hover-scale"
                            >
                              <Plus size={18} style={{ marginRight: '8px' }} />
                              Κλείσιμο Ραντεβού
                            </Button>
                          </CardActions>
                        </Card>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Slide>
        </Grid>

        {/* Bookings List */}
        <Grid item xs={12} lg={5}>
          <Slide direction="left" in timeout={700}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-xl)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid var(--gray-200)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight={700} color="var(--primary-800)">
                    Οι Κρατήσεις σας
                  </Typography>
                  <Badge badgeContent={bookings.length} color="primary">
                    <Calendar size={24} color="var(--primary-600)" />
                  </Badge>
                </Box>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, maxHeight: '600px' }}>
                {(clientBookings || []).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Calendar size={32} color="var(--gray-400)" />
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Δεν έχετε κρατήσεις
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ξεκινήστε κλείνοντας το πρώτο σας ραντεβού
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {clientBookings.map((booking, index) => (
                      <Fade in timeout={300 + index * 100} key={booking.id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            transition: 'all var(--transition-normal)',
                            '&:hover': {
                              borderColor: 'var(--primary-300)',
                              boxShadow: 'var(--shadow-md)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600} color="var(--primary-800)">
                                  {booking.professional_name || 'Επαγγελματίας'}
                                </Typography>
                                <Typography variant="body2" color="var(--primary-600)" fontWeight={500}>
                                  {booking.service_name || 'Υπηρεσία'}
                                </Typography>
                              </Box>
                              <Chip
                                label={getStatusText(booking.status)}
                                color={getStatusColor(booking.status)}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                            
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Clock size={16} color="var(--gray-500)" />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(booking.start_time).toLocaleString('el-GR')}
                                </Typography>
                              </Box>
                            </Stack>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Από: {new Date(booking.start_time).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                                {' '}έως{' '}
                                {new Date(booking.end_time).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={booking.status === 'cancelled'}
                                onClick={() => { setAppointmentToCancel(booking); setConfirmCancelOpen(true); }}
                              >
                                Ακύρωση
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Slide>
        </Grid>
      </Grid>
    </Box>
    <ClientBookingModal
      open={bookingOpen}
      onClose={() => setBookingOpen(false)}
      servicesProvider={async (pid) => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/services/public`, { params: { professional_id: pid } });
        return res.data || [];
      }}
      onConfirm={async (payload) => {
        try {
          // payload: { service, date: YYYY-MM-DD, timeslot: HH:MM, selectedSlot, professionalId }
          const start = `${payload.date} ${payload.timeslot}:00`;
          // duration will be handled on backend if needed; compute end from selected service if available
          const serviceId = payload.service;
          // Fallback 30 minutes if not available
          const durationMinutes = (payload.selectedSlot?.duration) || 30;
          const endDate = new Date(`${payload.date}T${payload.timeslot}:00`);
          endDate.setMinutes(endDate.getMinutes() + durationMinutes);
          const eH = String(endDate.getHours()).padStart(2,'0');
          const eM = String(endDate.getMinutes()).padStart(2,'0');
          const end = `${payload.date} ${eH}:${eM}:00`;
          await createAppointmentAsClient({ professional_id: payload.professionalId, service_id: serviceId, start_time: start, end_time: end });
          // refresh bookings list
          try {
            const res = await getAppointments();
            setClientBookings(Array.isArray(res.data) ? res.data : []);
          } catch (e) {}
        } catch (e) {
          console.error(e);
        } finally {
          setBookingOpen(false);
        }
      }}
      professionalId={activeProfessionalId}
    />
    {/* Cancel confirmation */}
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
              const res = await getAppointments();
              setClientBookings(Array.isArray(res.data) ? res.data : []);
            }
          } catch (e) { console.error('Cancel failed', e); }
          finally { setConfirmCancelOpen(false); setAppointmentToCancel(null); }
        }}>Ναι, ακύρωση</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default ClientDashboard;
