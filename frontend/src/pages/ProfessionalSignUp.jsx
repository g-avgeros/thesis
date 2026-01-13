// ProfessionalSignUp.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { registerProfessional, getCategories } from '../services/authService';

const ProfessionalSignUp = () => {
  const [data, setData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    address: "",
    category_id: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [categories, setCategories] = useState([]);
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

  React.useEffect(() => {
    console.log('Loading categories...', process.env.REACT_APP_API_URL);
    getCategories()
      .then(res => {
        console.log('Categories loaded:', res.data);
        setCategories(res.data || []);
      })
      .catch(err => {
        console.error('Error loading categories:', err);
        console.error('Error details:', err.response?.data || err.message);
        setCategories([]);
      });
  }, []);

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
      const payload = {
        ...data,
        category_ids: data.category_id ? [data.category_id] : [],
      };
      delete payload.category_id;
      await registerProfessional(payload);
      alert("Επιτυχής εγγραφή επαγγελματία!");
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Σφάλμα εγγραφής";
      alert(errorMessage);
      console.error(err);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #bfdbfe 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 440, p: 4, borderRadius: 3 }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Αρχική
          </Button>
          <Typography color="text.primary">Εγγραφή Επαγγελματία</Typography>
        </Breadcrumbs>

        <Stack alignItems="center" spacing={2} mb={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#2563eb"
            borderRadius="50%"
            width={64}
            height={64}
          >
            <Briefcase color="#fff" size={32} />
          </Box>
          <Typography variant="h4" fontWeight={700}>
            Δημιούργησε λογαριασμό
          </Typography>
          <Typography color="text.secondary">
            Συμπλήρωσε τα στοιχεία σου
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSignUpSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Πλήρες όνομα"
              name="full_name"
              value={data.full_name}
              onChange={handleChange}
              required
            />
            {/* Category single-select (dropdown closes on select) */}
            <FormControl fullWidth>
              <InputLabel id="categories-label">Κατηγορία</InputLabel>
              <Select
                labelId="categories-label"
                value={data.category_id || ''}
                label="Κατηγορία"
                onChange={(e) => setData(prev => ({ ...prev, category_id: e.target.value }))}
                MenuProps={{ PaperProps: { style: { maxHeight: 300, width: 300 } } }}
                sx={{ mt: 1 }}
              >
                {(categories || []).map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              label="Διεύθυνση"
              name="address"
              value={data.address}
              onChange={handleChange}
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
                py: 1.2,
                fontWeight: 600,
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Δημιουργία λογαριασμού επαγγελματία
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center" mt={3}>
          Έχεις ήδη λογαριασμό;{" "}
          <Link href="/login" fontWeight={600}>
            Σύνδεση
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfessionalSignUp;