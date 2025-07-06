import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <BlockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Acceso Denegado
          </Typography>
          
          <Typography variant="h6" color="textSecondary" paragraph>
            No tienes permisos para acceder a esta página
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Usuario actual:</strong> {user?.nombre} ({user?.usuario})
              <br />
              <strong>Rol:</strong> {user?.rol}
              <br />
              <strong>Motivo:</strong> Tu rol no tiene los permisos necesarios para acceder a esta funcionalidad.
            </Typography>
          </Alert>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            Si crees que esto es un error, contacta al administrador del sistema.
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              onClick={handleGoHome}
            >
              Ir al Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
