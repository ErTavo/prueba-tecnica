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
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import indicioService from '../../services/indicioService';
import expedienteService from '../../services/expedienteService';
import userService from '../../services/userService';

const IndiciosList = () => {
  const [indicios, setIndicios] = useState([]);
  const [expedientes, setExpedientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndicio, setEditingIndicio] = useState(null);
  const [filterExpediente, setFilterExpediente] = useState('');
  const [formData, setFormData] = useState({
    expedienteId: '',
    descripcion: '',
    color: '',
    tamano: '',
    peso: '',
    ubicacion: '',
    tecnicoId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterExpediente) {
      loadIndiciosByExpediente(filterExpediente);
    } else {
      loadIndicios();
    }
  }, [filterExpediente]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [expedientesRes, usuariosRes] = await Promise.all([
        expedienteService.getAllExpedientes(),
        userService.getAllUsers()
      ]);

      setExpedientes(expedientesRes.data || []);
      const tecnicosData = usuariosRes.data?.filter(
        user => user.Rol === 'Tecnico' || user.Rol === 'Supervisor'
      ) || [];
      setTecnicos(tecnicosData);
      
      await loadIndicios();
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadIndicios = async () => {
    try {
      const response = await indicioService.getAllIndicios();
      setIndicios(response.data || []);
    } catch (err) {
      console.error('Error cargando indicios:', err);
      setError('Error cargando los indicios');
    }
  };

  const loadIndiciosByExpediente = async (expedienteId) => {
    try {
      const response = await indicioService.getIndiciosByExpediente(expedienteId);
      setIndicios(response.data || []);
    } catch (err) {
      console.error('Error cargando indicios del expediente:', err);
      setError('Error cargando los indicios del expediente');
    }
  };

  const handleOpenDialog = (indicio = null) => {
    setEditingIndicio(indicio);
    setFormData(indicio ? {
      expedienteId: indicio.ExpedienteId || '',
      descripcion: indicio.Descripcion || '',
      color: indicio.Color || '',
      tamano: indicio.Tamano || '',
      peso: indicio.Peso || '',
      ubicacion: indicio.Ubicacion || '',
      tecnicoId: indicio.TecnicoId || ''
    } : {
      expedienteId: '',
      descripcion: '',
      color: '',
      tamano: '',
      peso: '',
      ubicacion: '',
      tecnicoId: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndicio(null);
    setFormData({
      expedienteId: '',
      descripcion: '',
      color: '',
      tamano: '',
      peso: '',
      ubicacion: '',
      tecnicoId: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveIndicio = async () => {
    try {
      setError(null);
      
      const validation = indicioService.validateIndicioData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      
      const dataToSend = { ...formData };
      if (dataToSend.peso) {
        dataToSend.peso = parseFloat(dataToSend.peso);
      }
      
      if (editingIndicio) {
        await indicioService.updateIndicio(editingIndicio.Id, dataToSend);
      } else {
        await indicioService.createIndicio(dataToSend);
      }
      
      handleCloseDialog();
      if (filterExpediente) {
        loadIndiciosByExpediente(filterExpediente);
      } else {
        loadIndicios();
      }
    } catch (err) {
      console.error('Error guardando indicio:', err);
      setError(err.response?.data?.error || 'Error guardando el indicio');
    }
  };

  const handleDeleteIndicio = async (indicioId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este indicio?')) {
      try {
        setError(null);
        await indicioService.deleteIndicio(indicioId);
        if (filterExpediente) {
          loadIndiciosByExpediente(filterExpediente);
        } else {
          loadIndicios();
        }
      } catch (err) {
        console.error('Error eliminando indicio:', err);
        setError('Error eliminando el indicio');
      }
    }
  };

  const getExpedienteCodigo = (expedienteId) => {
    const expediente = expedientes.find(e => e.Id === expedienteId);
    return expediente ? expediente.Codigo : 'N/A';
  };

  const getTecnicoNombre = (tecnicoId) => {
    const tecnico = tecnicos.find(t => t.Id === tecnicoId);
    return tecnico ? tecnico.Nombre : 'N/A';
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
          Gestión de Indicios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Indicio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtro por expediente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Expediente</InputLabel>
                <Select
                  value={filterExpediente}
                  onChange={(e) => setFilterExpediente(e.target.value)}
                  label="Filtrar por Expediente"
                >
                  <MenuItem value="">Todos los expedientes</MenuItem>
                  {expedientes.map((expediente) => (
                    <MenuItem key={expediente.Id} value={expediente.Id}>
                      {expediente.Codigo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Expediente</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Tamano</TableCell>
              <TableCell>Peso (lbs)</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indicios.map((indicio) => (
              <TableRow key={indicio.Id}>
                <TableCell>{indicio.Id}</TableCell>
                <TableCell>{getExpedienteCodigo(indicio.ExpedienteId)}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={indicio.Descripcion}>
                      {indicio.Descripcion}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{indicio.Color || '-'}</TableCell>
                <TableCell>{indicio.Tamano || '-'}</TableCell>
                <TableCell>{indicio.Peso ? `${indicio.Peso} lbs` : '-'}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 150 }}>
                    <Typography variant="body2" noWrap title={indicio.Ubicacion}>
                      {indicio.Ubicacion || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getTecnicoNombre(indicio.TecnicoId)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(indicio)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteIndicio(indicio.Id)}
                    title="Eliminar"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {indicios.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {filterExpediente ? 
                    'No hay indicios para el expediente seleccionado' : 
                    'No hay indicios registrados'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar indicio */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndicio ? 'Editar Indicio' : 'Nuevo Indicio'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Expediente</InputLabel>
                  <Select
                    value={formData.expedienteId}
                    onChange={handleInputChange('expedienteId')}
                    label="Expediente"
                  >
                    {expedientes.map((expediente) => (
                      <MenuItem key={expediente.Id} value={expediente.Id}>
                        {expediente.Codigo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Técnico Responsable</InputLabel>
                  <Select
                    value={formData.tecnicoId}
                    onChange={handleInputChange('tecnicoId')}
                    label="Técnico Responsable"
                  >
                    {tecnicos.map((tecnico) => (
                      <MenuItem key={tecnico.Id} value={tecnico.Id}>
                        {tecnico.Nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleInputChange('descripcion')}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.descripcion.length}/500 caracteres`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={formData.color}
                  onChange={handleInputChange('color')}
                  margin="normal"
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tamano"
                  value={formData.tamano}
                  onChange={handleInputChange('tamano')}
                  margin="normal"
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Peso (lbs)"
                  type="number"
                  value={formData.peso}
                  onChange={handleInputChange('peso')}
                  margin="normal"
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={formData.ubicacion}
                  onChange={handleInputChange('ubicacion')}
                  margin="normal"
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveIndicio}
            variant="contained"
            disabled={!formData.expedienteId || !formData.descripcion || !formData.tecnicoId}
          >
            {editingIndicio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndiciosList;
