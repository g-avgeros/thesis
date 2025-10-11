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
} from '@mui/material';
import {
  Search,
  LogOut,
  Settings,
  Clock,
  MapPin,
  Phone,
  Star,
  Calendar,
  Plus,
  Filter,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const navigate = useNavigate();

  // Mock data for bookings and professionals
  useEffect(() => {
    const mockBookings = [
      {
        id: 1,
        professional: 'Dr. John Smith',
        service: 'Haircut',
        date: '2024-01-15',
        time: '10:00',
        status: 'confirmed',
        duration: 30,
        price: 25,
        location: '123 Main St',
        phone: '+1234567890'
      },
      {
        id: 2,
        professional: 'Maria Garcia',
        service: 'Facial Treatment',
        date: '2024-01-18',
        time: '14:30',
        status: 'pending',
        duration: 60,
        price: 80,
        location: '456 Oak Ave',
        phone: '+1234567891'
      },
      {
        id: 3,
        professional: 'Alex Johnson',
        service: 'Massage',
        date: '2024-01-20',
        time: '16:00',
        status: 'completed',
        duration: 90,
        price: 120,
        location: '789 Pine St',
        phone: '+1234567892'
      }
    ];

    const mockProfessionals = [
      {
        id: 1,
        name: 'Dr. John Smith',
        specialty: 'Κομμωτής',
        rating: 4.8,
        reviews: 124,
        location: 'Αθήνα, Κέντρο',
        services: ['Κούρεμα', 'Χτένισμα', 'Χρώμα'],
        priceRange: '€20-50',
        image: null
      },
      {
        id: 2,
        name: 'Maria Garcia',
        specialty: 'Αισθητική',
        rating: 4.9,
        reviews: 89,
        location: 'Αθήνα, Γλυφάδα',
        services: ['Facial', 'Μασάζ προσώπου', 'Manicure'],
        priceRange: '€60-120',
        image: null
      },
      {
        id: 3,
        name: 'Alex Johnson',
        specialty: 'Θεραπευτικό Μασάζ',
        rating: 4.7,
        reviews: 156,
        location: 'Αθήνα, Κηφισιά',
        services: ['Θεραπευτικό μασάζ', 'Σπορ μασάζ', 'Ανανέωση'],
        priceRange: '€80-150',
        image: null
      },
      {
        id: 4,
        name: 'Elena Papadopoulou',
        specialty: 'Νυχιά',
        rating: 4.6,
        reviews: 67,
        location: 'Αθήνα, Παγκράτι',
        services: ['Manicure', 'Pedicure', 'Gel'],
        priceRange: '€25-60',
        image: null
      },
      {
        id: 5,
        name: 'George Dimitriou',
        specialty: 'Μπάρμπερ',
        rating: 4.5,
        reviews: 203,
        location: 'Αθήνα, Εξάρχεια',
        services: ['Κούρεμα', 'Γενειάδα', 'Μουστάκι'],
        priceRange: '€15-40',
        image: null
      }
    ];

    setBookings(mockBookings);
    setProfessionals(mockProfessionals);
    setFilteredProfessionals(mockProfessionals);
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
    // TODO: Implement booking functionality
    alert(`Κλείσιμο ραντεβού με επαγγελματία ID: ${professionalId}`);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={800} 
              className="text-gradient"
              sx={{ mb: 1 }}
            >
              Καλώς ήρθατε!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Διαχειριστείτε τις κρατήσεις σας και ανακαλύψτε νέους επαγγελματίες
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={handleProfileSettings}
              sx={{
                bgcolor: 'var(--primary-500)',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': { 
                  bgcolor: 'var(--primary-600)',
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
                bgcolor: 'var(--accent-red)',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': { 
                  bgcolor: '#dc2626',
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

      {/* Stats Cards */}
      <Slide direction="up" in timeout={500}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
              }}
              className="hover-lift"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {bookings.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ενεργές Κρατήσεις
                  </Typography>
                </Box>
                <Calendar size={32} style={{ opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)',
                color: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
              }}
              className="hover-lift"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {professionals.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Διαθέσιμοι Επαγγελματίες
                  </Typography>
                </Box>
                <Users size={32} style={{ opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, var(--accent-orange) 0%, #d97706 100%)',
                color: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
              }}
              className="hover-lift"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {bookings.filter(b => b.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ολοκληρωμένες
                  </Typography>
                </Box>
                <Award size={32} style={{ opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
              }}
              className="hover-lift"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {bookings.reduce((sum, b) => sum + b.price, 0)}€
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Συνολικό Κόστος
                  </Typography>
                </Box>
                <TrendingUp size={32} style={{ opacity: 0.8 }} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Slide>

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
                {filteredProfessionals.length === 0 ? (
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Star size={16} color="var(--accent-orange)" fill="var(--accent-orange)" />
                                    <Typography variant="body2" fontWeight={600} color="var(--gray-700)">
                                      {professional.rating}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Typography variant="body2" color="var(--primary-600)" fontWeight={500} gutterBottom>
                                  {professional.specialty}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <MapPin size={14} color="var(--gray-500)" />
                                  <Typography variant="body2" color="text.secondary">
                                    {professional.location}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {professional.reviews} αξιολογήσεις
                                  </Typography>
                                  <Divider orientation="vertical" flexItem />
                                  <Typography variant="body2" fontWeight={600} color="var(--accent-green)">
                                    {professional.priceRange}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                                  {professional.services.length > 3 && (
                                    <Chip
                                      label={`+${professional.services.length - 3} άλλα`}
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
                {bookings.length === 0 ? (
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
                    {bookings.map((booking, index) => (
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
                                  {booking.professional}
                                </Typography>
                                <Typography variant="body2" color="var(--primary-600)" fontWeight={500}>
                                  {booking.service}
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
                                  {formatDate(booking.date)} στις {booking.time}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <MapPin size={16} color="var(--gray-500)" />
                                <Typography variant="body2" color="text.secondary">
                                  {booking.location}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone size={16} color="var(--gray-500)" />
                                <Typography variant="body2" color="text.secondary">
                                  {booking.phone}
                                </Typography>
                              </Box>
                            </Stack>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Διάρκεια: {booking.duration} λεπτά
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="var(--accent-green)">
                                €{booking.price}
                              </Typography>
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
  );
};

export default ClientDashboard;
