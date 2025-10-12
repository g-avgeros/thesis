import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (payload) => api.post('/login', payload);
export const register = (payload) => api.post('/register', payload);
export const registerClient = (payload) => api.post('/register/client', payload);
export const registerProfessional = (payload) => api.post('/register/professional', payload);

// Profile 
export const getProfile     = ()      => api.get('/me');
export const updateProfile  = payload => api.put ('/me',      payload);

// Services
export const getServices    = () => api.get('/services');
export const createService  = payload => api.post('/services', payload);
export const updateService  = (id, payload) => api.put(`/services/${id}`, payload);
export const deleteService  = id => api.delete(`/services/${id}`);

// Clients
export const getClients   = () => api.get('/clients');
export const createClient = payload => api.post('/clients', payload);
export const updateClient = (id, payload) => api.put(`/clients/${id}`, payload);
export const deleteClient = id => api.delete(`/clients/${id}`);

// Professionals
export const getProfessionals = () => api.get('/professionals');
export const getCategories    = () => api.get('/categories');

// Schedules & Appointments
export const getSchedules    = (professionalId) => api.get(`/schedules`, { params: { professional_id: professionalId } });
export const getAppointments = () => api.get('/appointments');
export const createAppointment = payload => api.post('/appointments', payload);
export const createAppointmentAsClient = payload => api.post('/appointments/client', payload);
export const cancelAppointment = id => api.post(`/appointments/${id}/cancel`);
