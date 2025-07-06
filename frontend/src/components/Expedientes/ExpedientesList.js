import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Grid,
  Autocomplete,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ChangeCircle as ChangeIcon,
  Description as EvidenceIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import expedienteService from '../../services/expedienteService';
import userService from '../../services/userService';

const ExpedientesList = () => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [filteredExpedientes, setFilteredExpedientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEstadoDialog, setOpenEstadoDialog] = useState(false);
  const [editingExpediente, setEditingExpediente] = useState(null);
  const [changingEstado, setChangingEstado] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    tecnicoId: '',
    estado: ''
  });
  const [estadoData, setEstadoData] = useState({
    estado: '',
    justificacionRechazo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredExpedientes(expedientes);
    } else {
      const filtered = expedientes.filter(expediente =>
        expediente.Codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expediente.Estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTecnicoNombre(expediente.TecnicoId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        expediente.Id?.toString().includes(searchTerm)
      );
      setFilteredExpedientes(filtered);
    }
  }, [expedientes, searchTerm, tecnicos]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usuariosRes = await userService.getAllUsers();
      
      const tecnicosData = usuariosRes.data?.filter(
        user => user.Rol === 'Tecnico' || user.Rol === 'Supervisor'
      ) || [];
      setTecnicos(tecnicosData);
      
      try {
        const expedientesRes = await expedienteService.getAllExpedientes();
        const expedientesData = expedientesRes.data || [];
        setExpedientes(expedientesData);
        setFilteredExpedientes(expedientesData);
      } catch (expedientesErr) {
        console.warn('Servicio de expedientes no disponible:', expedientesErr.message);
        setExpedientes([]); 
        setFilteredExpedientes([]);
      }
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando los datos de usuarios');
      setTecnicos([]);
      setExpedientes([]);
      setFilteredExpedientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expediente = null) => {
    setEditingExpediente(expediente);
    setFormData(expediente ? {
      codigo: expediente.Codigo || '',
      tecnicoId: expediente.TecnicoId || '',
      estado: expediente.Estado || ''
    } : {
      codigo: '',
      tecnicoId: '',
      estado: 'Pendiente'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpediente(null);
    setFormData({ codigo: '', tecnicoId: '', estado: '' });
  };

  const handleOpenEstadoDialog = (expediente) => {
    setChangingEstado(expediente);
    setEstadoData({
      estado: expediente.Estado || '',
      justificacionRechazo: ''
    });
    setOpenEstadoDialog(true);
  };

  const handleCloseEstadoDialog = () => {
    setOpenEstadoDialog(false);
    setChangingEstado(null);
    setEstadoData({ estado: '', justificacionRechazo: '' });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleEstadoChange = (field) => (event) => {
    setEstadoData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveExpediente = async () => {
    try {
      setError(null);
      
      if (editingExpediente) {
        await expedienteService.updateExpediente(editingExpediente.Id, formData);
      } else {
        await expedienteService.createExpediente(formData);
      }
      
      handleCloseDialog();
      loadData();
    } catch (err) {
      console.error('Error guardando expediente:', err);
      setError(err.response?.data?.error || 'Error guardando el expediente');
    }
  };

  const handleChangeEstado = async () => {
    try {
      setError(null);
      
      // Preparar datos para enviar
      const dataToSend = {
        estado: estadoData.estado
      };
      
      // Solo incluir justificacionRechazo si el estado es "Rechazado" y hay justificación
      if (estadoData.estado === 'Rechazado' && estadoData.justificacionRechazo.trim()) {
        dataToSend.justificacionRechazo = estadoData.justificacionRechazo.trim();
      }
      
      await expedienteService.changeExpedienteEstado(changingEstado.Id, dataToSend);
      handleCloseEstadoDialog();
      loadData();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      setError(err.response?.data?.error || 'Error cambiando el estado');
    }
  };

  const handleDeleteExpediente = async (expedienteId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este expediente?')) {
      try {
        setError(null);
        await expedienteService.deleteExpediente(expedienteId);
        loadData();
      } catch (err) {
        console.error('Error eliminando expediente:', err);
        setError('Error eliminando el expediente');
      }
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'EnProceso': return 'info';
      case 'Completado': return 'success';
      case 'Rechazado': return 'error';
      default: return 'default';
    }
  };

  const getTecnicoNombre = (tecnicoId) => {
    const tecnico = tecnicos.find(t => t.Id === tecnicoId);
    return tecnico ? tecnico.Nombre : 'No asignado';
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
          Gestión de Expedientes y Evidencias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Expediente
        </Button>
      </Box>

      {/* Barra de búsqueda */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por código, estado, técnico asignado o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton
                size="small"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
              >
                <ClearIcon />
              </IconButton>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        {searchTerm && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mostrando {filteredExpedientes.length} de {expedientes.length} expedientes
          </Typography>
        )}
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
              <TableCell>Código</TableCell>
              <TableCell>Técnico Asignado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpedientes.map((expediente) => (
              <TableRow key={expediente.Id}>
                <TableCell>{expediente.Id}</TableCell>
                <TableCell>{expediente.Codigo}</TableCell>
                <TableCell>{getTecnicoNombre(expediente.TecnicoId)}</TableCell>
                <TableCell>
                  <Chip
                    label={expediente.Estado}
                    color={getEstadoColor(expediente.Estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {expediente.FechaCreacion ? 
                    new Date(expediente.FechaCreacion).toLocaleDateString() : 
                    'N/A'
                  }
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/expedientes/${expediente.Id}`)}
                    title="Ver Detalle y Gestionar Evidencias"
                    color="info"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(expediente)}
                    title="Editar Expediente"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEstadoDialog(expediente)}
                    title="Cambiar Estado"
                    color="primary"
                  >
                    <ChangeIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteExpediente(expediente.Id)}
                    title="Eliminar Expediente"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredExpedientes.length === 0 && expedientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay expedientes registrados
                </TableCell>
              </TableRow>
            )}
            {filteredExpedientes.length === 0 && expedientes.length > 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron expedientes que coincidan con la búsqueda "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar expediente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExpediente ? 'Editar Expediente' : 'Nuevo Expediente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Código del Expediente"
              value={formData.codigo}
              onChange={handleInputChange('codigo')}
              margin="normal"
              required
              placeholder="Ej: EXP-2025-001"
              helperText="Ingrese un código único para el expediente"
            />
            
            <Divider sx={{ my: 2 }} />
            
            {/* Autocomplete para técnicos con diseño mejorado */}
            <Autocomplete
              fullWidth
              options={tecnicos}
              getOptionLabel={(tecnico) => `${tecnico.Nombre} - ${tecnico.Rol}`}
              value={tecnicos.find(t => t.Id === formData.tecnicoId) || null}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  tecnicoId: newValue ? newValue.Id : ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Técnico Asignado"
                  required
                  margin="normal"
                  placeholder="Buscar técnico por nombre..."
                  helperText="Seleccione el técnico responsable del expediente"
                />
              )}
              renderOption={(props, tecnico) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    {tecnico.Nombre.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {tecnico.Nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tecnico.Rol} • {tecnico.Usuario}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="No se encontraron técnicos"
              sx={{ mt: 2 }}
            />
            
            <FormControl fullWidth margin="normal" required sx={{ mt: 2 }}>
              <InputLabel>Estado Inicial</InputLabel>
              <Select
                value={formData.estado}
                onChange={handleInputChange('estado')}
                label="Estado Inicial"
              >
                {expedienteService.getValidEstados().map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    <Chip 
                      label={estado} 
                      size="small" 
                      color={estado === 'Pendiente' ? 'warning' : estado === 'Aprobado' ? 'success' : 'default'} 
                      sx={{ mr: 1 }}
                    />
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveExpediente}
            variant="contained"
            disabled={!formData.codigo || !formData.tecnicoId || !formData.estado}
          >
            {editingExpediente ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar estado */}
      <Dialog open={openEstadoDialog} onClose={handleCloseEstadoDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Estado del Expediente</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Expediente: {changingEstado?.Codigo}
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={estadoData.estado}
                onChange={handleEstadoChange('estado')}
                label="Nuevo Estado"
              >
                {expedienteService.getValidEstados().map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {estadoData.estado === 'Rechazado' && (
              <TextField
                fullWidth
                label="Justificación del Rechazo"
                value={estadoData.justificacionRechazo}
                onChange={handleEstadoChange('justificacionRechazo')}
                margin="normal"
                multiline
                rows={3}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEstadoDialog}>Cancelar</Button>
          <Button
            onClick={handleChangeEstado}
            variant="contained"
            disabled={!estadoData.estado || (estadoData.estado === 'Rechazado' && !estadoData.justificacionRechazo)}
          >
            Cambiar Estado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpedientesList;
