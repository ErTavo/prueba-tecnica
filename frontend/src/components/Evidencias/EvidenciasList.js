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
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextareaAutosize,
  Autocomplete,
  Avatar,
  Divider,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Scale as WeightIcon,
  Straighten as SizeIcon,
  Palette as ColorIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import evidenciaService from '../../services/evidenciaService';
import expedienteService from '../../services/expedienteService';
import userService from '../../services/userService';

const EvidenciasList = () => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const [evidencias, setEvidencias] = useState([]);
  const [expedientes, setExpedientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRevisionDialog, setOpenRevisionDialog] = useState(false);
  const [editingEvidencia, setEditingEvidencia] = useState(null);
  const [revisingEvidencia, setRevisingEvidencia] = useState(null);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterExpediente, setFilterExpediente] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    expedienteId: '',
    descripcion: '',
    color: '',
    tamano: '',
    peso: '',
    ubicacion: '',
    tecnicoId: '',
    estado: 'Pendiente',
    observaciones: ''
  });

  const [revisionData, setRevisionData] = useState({
    accion: '', 
    justificacion: '',
    observaciones: ''
  });

  const estadosEvidencia = ['Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'];

  useEffect(() => {
    loadData();
    
    const urlParams = new URLSearchParams(location.search);
    const estadoParam = urlParams.get('estado');
    if (estadoParam) {
      setFilterEstado(estadoParam);
      setTabValue(estadosEvidencia.indexOf(estadoParam.charAt(0).toUpperCase() + estadoParam.slice(1)));
    }
  }, [location]);

  useEffect(() => {
    if (filterEstado || filterExpediente) {
      loadFilteredEvidencias();
    } else {
      loadEvidencias();
    }
  }, [filterEstado, filterExpediente]);

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
      
      await loadEvidencias();
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadEvidencias = async () => {
    try {
      const response = await evidenciaService.getAllEvidencias();
      setEvidencias(response.data || []);
    } catch (err) {
      console.error('Error cargando evidencias:', err);
      setError('Error cargando las evidencias');
    }
  };

  const loadFilteredEvidencias = async () => {
    try {
      let response;
      if (filterExpediente) {
        response = await evidenciaService.getEvidenciasByExpediente(filterExpediente);
      } else {
        response = await evidenciaService.getAllEvidencias();
      }
      
      let filteredData = response.data || [];
      
      if (filterEstado) {
        filteredData = filteredData.filter(evidencia => 
          evidencia.Estado?.toLowerCase() === filterEstado.toLowerCase()
        );
      }
      
      setEvidencias(filteredData);
    } catch (err) {
      console.error('Error cargando evidencias filtradas:', err);
      setError('Error cargando las evidencias');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const estados = ['', 'Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'];
    setFilterEstado(estados[newValue]);
  };

  const handleOpenDialog = (evidencia = null) => {
    setEditingEvidencia(evidencia);
    setFormData(evidencia ? {
      expedienteId: evidencia.ExpedienteId || '',
      descripcion: evidencia.Descripcion || '',
      color: evidencia.Color || '',
      tamano: evidencia.Tamano || '',
      peso: evidencia.Peso || '',
      ubicacion: evidencia.Ubicacion || '',
      tecnicoId: evidencia.TecnicoId || '',
      estado: evidencia.Estado || 'Pendiente',
      observaciones: evidencia.Observaciones || ''
    } : {
      expedienteId: '',
      descripcion: '',
      color: '',
      tamano: '',
      peso: '',
      ubicacion: '',
      tecnicoId: user.id, 
      estado: 'Pendiente',
      observaciones: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvidencia(null);
    setFormData({
      expedienteId: '',
      descripcion: '',
      color: '',
      tamano: '',
      peso: '',
      ubicacion: '',
      tecnicoId: '',
      estado: 'Pendiente',
      observaciones: ''
    });
  };

  const handleOpenRevisionDialog = (evidencia) => {
    setRevisingEvidencia(evidencia);
    setRevisionData({
      accion: '',
      justificacion: '',
      observaciones: ''
    });
    setOpenRevisionDialog(true);
  };

  const handleCloseRevisionDialog = () => {
    setOpenRevisionDialog(false);
    setRevisingEvidencia(null);
    setRevisionData({
      accion: '',
      justificacion: '',
      observaciones: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRevisionChange = (field) => (event) => {
    setRevisionData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveEvidencia = async () => {
    try {
      setError(null);
      
      const validation = evidenciaService.validateEvidenciaData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      
      const dataToSend = { ...formData };
      if (dataToSend.peso) {
        dataToSend.peso = parseFloat(dataToSend.peso);
      }
      
      if (editingEvidencia) {
        await evidenciaService.updateEvidencia(editingEvidencia.Id, dataToSend);
      } else {
        await evidenciaService.createEvidencia(dataToSend);
      }
      
      handleCloseDialog();
      loadFilteredEvidencias();
    } catch (err) {
      console.error('Error guardando evidencia:', err);
      setError(err.response?.data?.error || 'Error guardando la evidencia');
    }
  };

  const handleRevisarEvidencia = async () => {
    try {
      setError(null);
      
      if (!revisionData.accion) {
        setError('Debe seleccionar una acción (aprobar o rechazar)');
        return;
      }
      
      if (revisionData.accion === 'rechazar' && !revisionData.justificacion.trim()) {
        setError('La justificación es requerida para rechazar una evidencia');
        return;
      }
      
      if (revisionData.accion === 'aprobar') {
        await evidenciaService.aprobarEvidencia(
          revisingEvidencia.Id, 
          revisionData.observaciones
        );
      } else {
        await evidenciaService.rechazarEvidencia(
          revisingEvidencia.Id, 
          revisionData.justificacion
        );
      }
      
      handleCloseRevisionDialog();
      loadFilteredEvidencias();
    } catch (err) {
      console.error('Error procesando revisión:', err);
      setError(err.response?.data?.error || 'Error procesando la revisión');
    }
  };

  const handleDeleteEvidencia = async (evidenciaId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta evidencia?')) {
      try {
        setError(null);
        await evidenciaService.deleteEvidencia(evidenciaId);
        loadFilteredEvidencias();
      } catch (err) {
        console.error('Error eliminando evidencia:', err);
        setError('Error eliminando la evidencia');
      }
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'En Revisión': return 'info';
      case 'Aprobado': return 'success';
      case 'Rechazado': return 'error';
      default: return 'default';
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

  const canEditEvidencia = (evidencia) => {

    const isOwner = evidencia.TecnicoId === user.id;
    const canManage = hasPermission('evidencias.editar');
    const editableStates = ['Pendiente', 'En Revisión'];
    
    return (isOwner || canManage) && editableStates.includes(evidencia.Estado);
  };

  const canReviewEvidencia = (evidencia) => {
    const canReview = hasPermission('evidencias.aprobar');
    const reviewableStates = ['Pendiente', 'En Revisión'];
    
    return canReview && reviewableStates.includes(evidencia.Estado);
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
          Gestión de Evidencias
        </Typography>
        {hasPermission('evidencias.crear') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Evidencia
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros por estado usando Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Todas" />
          <Tab label="Pendientes" />
          <Tab label="En Revisión" />
          <Tab label="Aprobadas" />
          <Tab label="Rechazadas" />
        </Tabs>
      </Box>

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
              <TableCell>Estado</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evidencias.map((evidencia) => (
              <TableRow key={evidencia.Id}>
                <TableCell>{evidencia.Id}</TableCell>
                <TableCell>{getExpedienteCodigo(evidencia.ExpedienteId)}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={evidencia.Descripcion}>
                      {evidencia.Descripcion}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={evidencia.Estado || 'Pendiente'}
                    color={getEstadoColor(evidencia.Estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getTecnicoNombre(evidencia.TecnicoId)}</TableCell>
                <TableCell>
                  {evidencia.FechaCreacion ? 
                    new Date(evidencia.FechaCreacion).toLocaleDateString() : 
                    'N/A'
                  }
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(evidencia)}
                    title="Ver/Editar"
                    disabled={!canEditEvidencia(evidencia)}
                  >
                    {canEditEvidencia(evidencia) ? <EditIcon /> : <ViewIcon />}
                  </IconButton>
                  
                  {canReviewEvidencia(evidencia) && (
                    <IconButton
                      size="small"
                      onClick={() => handleOpenRevisionDialog(evidencia)}
                      title="Revisar"
                      color="primary"
                    >
                      <ApproveIcon />
                    </IconButton>
                  )}
                  
                  {hasPermission('evidencias.eliminar') && evidencia.Estado === 'Pendiente' && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteEvidencia(evidencia.Id)}
                      title="Eliminar"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {evidencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {filterEstado || filterExpediente ? 
                    'No hay evidencias que coincidan con los filtros seleccionados' : 
                    'No hay evidencias registradas'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar evidencia */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="primary" />
            {editingEvidencia ? 'Editar Evidencia' : 'Nueva Evidencia'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {editingEvidencia ? 'Modifique los datos de la evidencia' : 'Complete la información de la nueva evidencia'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Información Principal */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="primary" />
                    Información Principal
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        fullWidth
                        options={expedientes}
                        getOptionLabel={(expediente) => expediente.Codigo || ''}
                        value={expedientes.find(e => e.Id === formData.expedienteId) || null}
                        onChange={(event, newValue) => {
                          setFormData(prev => ({
                            ...prev,
                            expedienteId: newValue ? newValue.Id : ''
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Expediente"
                            required
                            margin="normal"
                            placeholder="Buscar expediente..."
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CategoryIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        disabled={editingEvidencia && !hasPermission('evidencias.editar')}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
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
                            label="Técnico Responsable"
                            required
                            margin="normal"
                            placeholder="Buscar técnico..."
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
                                {tecnico.Rol}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        disabled={editingEvidencia && !hasPermission('evidencias.editar')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Descripción de la Evidencia */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="primary" />
                    Descripción de la Evidencia
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Descripción Detallada"
                    value={formData.descripcion}
                    onChange={handleInputChange('descripcion')}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                    placeholder="Describa detalladamente la evidencia encontrada..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`${formData.descripcion.length}/500 caracteres`}
                    disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Características Físicas */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoIcon color="primary" />
                    Características Físicas
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Color"
                        value={formData.color}
                        onChange={handleInputChange('color')}
                        margin="normal"
                        placeholder="Ej: Azul oscuro"
                        inputProps={{ maxLength: 50 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ColorIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Tamano"
                        value={formData.tamano}
                        onChange={handleInputChange('tamano')}
                        margin="normal"
                        placeholder="Ej: 15x10 cm"
                        inputProps={{ maxLength: 50 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SizeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Peso (lbs)"
                        type="number"
                        value={formData.peso}
                        onChange={handleInputChange('peso')}
                        margin="normal"
                        placeholder="0.0"
                        inputProps={{ min: 0, step: 0.1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WeightIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Ubicación"
                        value={formData.ubicacion}
                        onChange={handleInputChange('ubicacion')}
                        margin="normal"
                        placeholder="Lugar donde se encontró"
                        inputProps={{ maxLength: 200 }}
                        disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Observaciones Adicionales */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Observaciones Adicionales
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange('observaciones')}
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder="Información adicional relevante..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`Opcional • ${formData.observaciones.length}/500 caracteres`}
                    disabled={editingEvidencia && !canEditEvidencia(editingEvidencia)}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            size="large"
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          {(!editingEvidencia || canEditEvidencia(editingEvidencia)) && (
            <Button
              onClick={handleSaveEvidencia}
              variant="contained"
              size="large"
              startIcon={editingEvidencia ? <EditIcon /> : <AddIcon />}
              disabled={!formData.expedienteId || !formData.descripcion || !formData.tecnicoId}
              sx={{ 
                minWidth: 120,
                bgcolor: editingEvidencia ? 'warning.main' : 'primary.main',
                '&:hover': {
                  bgcolor: editingEvidencia ? 'warning.dark' : 'primary.dark',
                }
              }}
            >
              {editingEvidencia ? 'Actualizar' : 'Crear Evidencia'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para revisión de evidencias */}
      <Dialog open={openRevisionDialog} onClose={handleCloseRevisionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Revisar Evidencia - {revisingEvidencia?.Id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Descripción:</strong> {revisingEvidencia?.Descripcion}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Expediente:</strong> {getExpedienteCodigo(revisingEvidencia?.ExpedienteId)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              <strong>Técnico:</strong> {getTecnicoNombre(revisingEvidencia?.TecnicoId)}
            </Typography>
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Acción</InputLabel>
              <Select
                value={revisionData.accion}
                onChange={handleRevisionChange('accion')}
                label="Acción"
              >
                <MenuItem value="aprobar">Aprobar</MenuItem>
                <MenuItem value="rechazar">Rechazar</MenuItem>
              </Select>
            </FormControl>

            {revisionData.accion === 'rechazar' && (
              <TextField
                fullWidth
                label="Justificación del Rechazo"
                value={revisionData.justificacion}
                onChange={handleRevisionChange('justificacion')}
                margin="normal"
                multiline
                rows={3}
                required
                helperText="La justificación es requerida para rechazar una evidencia"
              />
            )}

            <TextField
              fullWidth
              label="Observaciones adicionales"
              value={revisionData.observaciones}
              onChange={handleRevisionChange('observaciones')}
              margin="normal"
              multiline
              rows={2}
              helperText="Opcional: Comentarios adicionales sobre la revisión"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRevisionDialog}>Cancelar</Button>
          <Button
            onClick={handleRevisarEvidencia}
            variant="contained"
            color={revisionData.accion === 'aprobar' ? 'success' : 'error'}
            disabled={!revisionData.accion || (revisionData.accion === 'rechazar' && !revisionData.justificacion)}
          >
            {revisionData.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenciasList;
