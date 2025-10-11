import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Link,
  Stack,
  Paper,
  Breadcrumbs,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { registerClient } from '../services/authService';

const ClientSignUp = () => {
  const [data, setData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    user_type: "client"
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Μη έγκυρη μορφή email");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(data.email)) {
      setEmailError("Μη έγκυρη μορφή email");
      return;
    }
    
    if (data.password !== data.confirm) {
      return alert("Οι κωδικοί δεν ταιριάζουν");
    }
    
    try {
      await registerClient(data);
      alert("Επιτυχής εγγραφή πελάτη!");
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Σφάλμα εγγραφής";
      alert(errorMessage);
      console.error(err);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #bbf7d0 100%)",
        p: 1,
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 450, p: 2.5, borderRadius: 2 }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 1.5 }}>
          <Button
            startIcon={<ArrowLeft size={14} />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.875rem' }}
          >
            Αρχική
          </Button>
          <Typography color="text.primary" variant="body2">Εγγραφή Πελάτη</Typography>
        </Breadcrumbs>

        <Stack alignItems="center" spacing={1.5} mb={2}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#16a34a"
            borderRadius="50%"
            width={50}
            height={50}
          >
            <User color="#fff" size={24} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Εγγραφή Πελάτη
          </Typography>
          <Typography color="text.secondary" textAlign="center" variant="body2">
            Συμπλήρωσε τα στοιχεία σου
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSignUpSubmit} noValidate>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="Πλήρες όνομα"
              name="full_name"
              value={data.full_name}
              onChange={handleChange}
              required
            />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleChange}
                  required
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
            <TextField
              fullWidth
              label="Τηλέφωνο"
              name="phone"
              type="tel"
              value={data.phone}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              value={data.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((p) => !p)}
                      size="small"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Επιβεβαίωση password"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={data.confirm}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm((p) => !p)}
                      size="small"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                textTransform: "none",
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
              }}
            >
              Δημιουργία λογαριασμού πελάτη
            </Button>
          </Stack>
        </Box>

        <Typography variant="caption" textAlign="center" mt={2}>
          Έχεις ήδη λογαριασμό;{" "}
          <Link href="/login" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
            Σύνδεση
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ClientSignUp;
