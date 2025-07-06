import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import userService from '../../services/userService';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    contraseña: '',
    rol: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error cargando la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    setFormData(user ? {
      nombre: user.Nombre || '',
      usuario: user.Usuario || '',
      contraseña: '',
      rol: user.Rol || ''
    } : {
      nombre: '',
      usuario: '',
      contraseña: '',
      rol: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ nombre: '', usuario: '', contraseña: '', rol: '' });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveUser = async () => {
    try {
      setError(null);
      
      if (editingUser) {
        ualizar usuario existente
        const updateData = { ...formData };
        if (!updateData.contraseña) {
          delete updateData.contraseña;
        }
        await userService.updateUser(editingUser.Id, updateData);
      } else {
        await userService.createUser(formData);
      }
      
      handleCloseDialog();
      loadUsers(); 
    } catch (err) {
      console.error('Error guardando usuario:', err);
      setError(err.response?.data?.error || 'Error guardando el usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        setError(null);
        await userService.deleteUser(userId);
        loadUsers(); 
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        setError('Error eliminando el usuario');
      }
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Admin': return 'error';
      case 'Supervisor': return 'warning';
      case 'Tecnico': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.Id}>
                <TableCell>{user.Id}</TableCell>
                <TableCell>{user.Nombre}</TableCell>
                <TableCell>{user.Usuario}</TableCell>
                <TableCell>
                  <Chip
                    label={user.Rol}
                    color={getRolColor(user.Rol)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(user)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteUser(user.Id)}
                    title="Eliminar"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nombre Completo"
              value={formData.nombre}
              onChange={handleInputChange('nombre')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={formData.usuario}
              onChange={handleInputChange('usuario')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
              type="password"
              value={formData.contraseña}
              onChange={handleInputChange('contraseña')}
              margin="normal"
              required={!editingUser}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                onChange={handleInputChange('rol')}
                label="Rol"
              >
                <MenuItem value="Admin">Administrador</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Tecnico">Técnico</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!formData.nombre || !formData.usuario || !formData.rol || (!editingUser && !formData.contraseña)}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersList;
