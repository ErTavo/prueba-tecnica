import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (loginError) setLoginError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(null);

    if (!formData.usuario.trim()) {
      setLoginError('El nombre de usuario es requerido');
      return;
    }

    if (!formData.contraseña.trim()) {
      setLoginError('La contraseña es requerida');
      return;
    }

    try {
      const result = await login(formData);
      if (!result.success) {
        setLoginError(result.error);
      } else {
        setLoginSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      }
    } catch (err) {
      setLoginError('Error inesperado durante el login');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        {/* Mostrar logo del MP cuando login es exitoso */}
        {loginSuccess ? (
          <Fade in={loginSuccess} timeout={1000}>
            <Paper elevation={8} sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
              <CardContent sx={{ p: 6 }}>
                <Zoom in={loginSuccess} timeout={1500}>
                  <Box>
                    <img 
                      src="/MP_logo.png" 
                      alt="Ministerio Público Logo" 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        maxHeight: '200px',
                        marginBottom: '24px'
                      }} 
                    />
                  </Box>
                </Zoom>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                  ¡Bienvenido!
                </Typography>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Login exitoso
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Accediendo al sistema...
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <CircularProgress color="primary" />
                </Box>
              </CardContent>
            </Paper>
          </Fade>
        ) : (
          /* Formulario de login original */
          <Paper elevation={8} sx={{ width: '100%', maxWidth: 400 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box textAlign="center" mb={4}>
                  <Typography variant="h4" component="h1" gutterBottom color="primary">
                    MP DICRI
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    Sistema de Gestión de Evidencias
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Inicie sesión para acceder al sistema
                  </Typography>
                </Box>

                {/* Error Alert */}
                {(loginError || error) && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {loginError || error}
                  </Alert>
                )}

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Usuario"
                    value={formData.usuario}
                    onChange={handleInputChange('usuario')}
                    margin="normal"
                    required
                    autoFocus
                    autoComplete="username"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.contraseña}
                    onChange={handleInputChange('contraseña')}
                    margin="normal"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
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
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || !formData.usuario.trim() || !formData.contraseña.trim()}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </Box>

                {/* Footer Info */}
                <Box textAlign="center" mt={3}>
                  <Typography variant="caption" color="textSecondary">
                    Ministerio Público - DICRI
                  </Typography>
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    Sistema de gestión de expedientes e indicios
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Login;
