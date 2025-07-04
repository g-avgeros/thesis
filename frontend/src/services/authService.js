// src/services/authService.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const login = (payload) => api.post('/login', payload);
export const register = (payload) => api.post('/register', payload);
