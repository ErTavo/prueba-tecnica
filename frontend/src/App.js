import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle, ExitToApp, Dashboard as DashboardIcon, Group, Folder, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import UsersList from './components/Users/UsersList';
import ExpedientesList from './components/Expedientes/ExpedientesList';
import ExpedienteDetail from './components/Expedientes/ExpedienteDetail';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const NavBar = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MP DICRI - Sistema de Gestión de Evidencias
        </Typography>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Button 
            color="inherit" 
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            Dashboard
          </Button>
          
          {hasPermission('expedientes.ver') && (
            <Button 
              color="inherit" 
              startIcon={<Folder />}
              onClick={() => navigate('/expedientes')}
              sx={{ mr: 1 }}
            >
              Expedientes
            </Button>
          )}
          
          {hasPermission('usuarios.ver') && (
            <Button 
              color="inherit" 
              startIcon={<Group />}
              onClick={() => navigate('/usuarios')}
              sx={{ mr: 1 }}
            >
              Usuarios
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user.nombre} ({user.rol})
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <NavBar />
          <Container maxWidth={false} disableGutters>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/usuarios" element={
                <ProtectedRoute requiredPermission="usuarios.ver">
                  <UsersList />
                </ProtectedRoute>
              } />
              
              <Route path="/expedientes" element={
                <ProtectedRoute requiredPermission="expedientes.ver">
                  <ExpedientesList />
                </ProtectedRoute>
              } />
              
              <Route path="/expedientes/:id" element={
                <ProtectedRoute requiredPermission="expedientes.ver">
                  <ExpedienteDetail />
                </ProtectedRoute>
              } />
              
              {/* Redirigir rutas no encontradas al dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
