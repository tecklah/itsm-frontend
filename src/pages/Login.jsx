import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { LOGIN_URL } from '../common/constants';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.username.trim() || !formData.password.trim()) {
      setAlert({
        severity: 'error',
        message: 'Please enter both username and password',
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const result = await response.json();

      if (result.status === 'successful') {
        // Store username in localStorage
        localStorage.setItem('username', formData.username);
        
        setAlert({
          severity: 'success',
          message: 'Login successful! Redirecting...',
        });

        // Redirect to addservicerequest page
        setTimeout(() => {
          navigate('/addservicerequest');
        }, 500);
      } else {
        throw new Error('Invalid credentials');
      }

    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', margin: 2 }}>
        <CardContent sx={{ padding: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
              <LoginIcon sx={{ fontSize: 48, color: '#1976d2', marginBottom: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Login To ITSM Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to access the system
              </Typography>
            </Box>

            {/* Alert */}
            {alert && (
              <Alert severity={alert.severity} onClose={() => setAlert(null)}>
                {alert.message}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ marginTop: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </Box>
            </form>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', marginTop: 2 }}>
              <Typography variant="body2" color="text.secondary">
                © 2025 ITSM Portal
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
