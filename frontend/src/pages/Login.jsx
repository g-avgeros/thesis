import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Checkbox,
  Link,
  Stack,
  Paper,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import PersonIcon from '@mui/icons-material/Person';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({
        email: credentials.email,
        password: credentials.password,
      });
      const { token, id } = res.data;
      localStorage.setItem('user_id', id);
      localStorage.setItem('token', token);
      alert('Επιτυχής σύνδεση!');
      navigate('/calendar');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Λάθος email ή κωδικός!');
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
          "linear-gradient(135deg, #ebf4ff 0%, #ffffff 50%, #e0f2fe 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Stack alignItems="center" spacing={2} mb={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#2563EB"
            borderRadius="50%"
            width={64}
            height={64}
          >
            <PersonIcon color="#fff" size={32} />
          </Box>
          <Typography variant="h4" fontWeight={700}>
            Καλώς ήρθες
          </Typography>
          <Typography color="text.secondary">
            Συνδέσου στον λογαριασμό σου
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleLoginSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={credentials.email}
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
              name="password"
              label="Κωδικός"
              type={showPw ? "text" : "password"}
              value={credentials.password}
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
                      edge="end"
                      size="small"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Checkbox size="small" />
                <Typography variant="body2">Θυμήσου με</Typography>
              </Box>
              <Link href="#" variant="body2">
                Ξέχασες το password;
              </Link>
            </Box>

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                textTransform: "none",
                py: 1.2,
                fontWeight: 600,
                bgcolor: "#2563EB",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Σύνδεση
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center" mt={3}>
          Δεν έχεις λογαριασμό;{" "}
          <Link href="/register" fontWeight={600}>
            Εγγραφή
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
