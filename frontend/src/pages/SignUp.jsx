// SignUp.jsx
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
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const SignUp = () => {
  const [data, setData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirm) {
      return alert("Οι κωδικοί δεν ταιριάζουν");
    }
    try {
      await register(data);
      alert("Επιτυχής εγγραφή!");
      navigate('/login');
    } catch (err) {
      alert("Σφάλμα εγγραφής");
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
          "linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #bbf7d0 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 440, p: 4, borderRadius: 3 }}
      >
        <Stack alignItems="center" spacing={2} mb={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#16a34a"
            borderRadius="50%"
            width={64}
            height={64}
          >
            <User color="#fff" size={32} />
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
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              required
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
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
              }}
            >
              Δημιουργία λογαριασμού
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

export default SignUp;
