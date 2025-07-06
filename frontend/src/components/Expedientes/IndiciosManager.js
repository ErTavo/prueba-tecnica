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
  Alert,
  CircularProgress,
  Grid,
  Autocomplete,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormHelperText,
  Chip,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  Palette as ColorIcon,
  Straighten as SizeIcon,
  Scale as WeightIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import indicioService from '../../services/indicioService';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const IndiciosManager = ({ expedienteId, expedienteCodigo }) => {
  const { user, hasPermission } = useAuth();
  const [indicios, setIndicios] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedIndicio, setSelectedIndicio] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [editingIndicio, setEditingIndicio] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    color: '',
    tamano: '',
    peso: '',
    ubicacion: '',
    tecnicoId: ''
  });

  useEffect(() => {
    loadData();
  }, [expedienteId]);

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
        const indiciosRes = await indicioService.getIndiciosByExpediente(expedienteId);
        setIndicios(indiciosRes.data || []);
      } catch (indiciosErr) {
        console.warn('Error cargando indicios:', indiciosErr.message);
        setIndicios([]);
      }
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (indicio = null) => {
    setEditingIndicio(indicio);
    setFormData(indicio ? {
      descripcion: indicio.Descripcion || '',
      color: indicio.Color || '',
      tamano: indicio.Tamano || '',
      peso: indicio.Peso || '',
      ubicacion: indicio.Ubicacion || '',
      tecnicoId: indicio.TecnicoId || ''
    } : {
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
      descripcion: '',
      color: '',
      tamano: '',
      peso: '',
      ubicacion: '',
      tecnicoId: ''
    });
  };

  const handleInputChange = (field, value) => {
    const sanitizedValue = typeof value === 'string' ? value.normalize('NFC') : value;
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        descripcion: formData.descripcion?.normalize('NFC') || '',
        color: formData.color?.normalize('NFC') || '',
        tamano: formData.tamano?.normalize('NFC') || '',
        ubicacion: formData.ubicacion?.normalize('NFC') || '',
        tecnicoId: formData.tecnicoId,
        expedienteId: expedienteId,
        peso: formData.peso ? parseFloat(formData.peso) : 0
      };

      if (editingIndicio) {
        await indicioService.updateIndicio(editingIndicio.Id, submitData);
      } else {
        await indicioService.createIndicio(submitData);
      }
      
      handleCloseDialog();
      loadData();
    } catch (err) {
      console.error('Error guardando indicio:', err);
      setError(err.message || 'Error al guardar el indicio');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta evidencia?')) {
      try {
        await indicioService.deleteIndicio(id);
        loadData();
      } catch (err) {
        console.error('Error eliminando indicio:', err);
        setError(err.message || 'Error al eliminar el indicio');
      }
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredIndicios = () => {
    switch (tabValue) {
      case 0: // Pendientes
        return indicios.filter(indicio => !indicio.Estado || indicio.Estado === 'Pendiente');
      case 1: // Aprobadas
        return indicios.filter(indicio => indicio.Estado === 'Aprobada');
      case 2: // Denegadas
        return indicios.filter(indicio => indicio.Estado === 'Denegada');
      default:
        return indicios;
    }
  };

  const handleOpenApprovalDialog = (indicio, action) => {
    setSelectedIndicio(indicio);
    setApprovalAction(action);
    setJustificacion('');
    setOpenApprovalDialog(true);
  };

  const handleCloseApprovalDialog = () => {
    setOpenApprovalDialog(false);
    setSelectedIndicio(null);
    setApprovalAction('');
    setJustificacion('');
  };

  const handleApprovalSubmit = async () => {
    try {
      const data = {
        estado: approvalAction === 'approve' ? 'Aprobada' : 'Denegada'
      };
      
      if (approvalAction === 'deny' && justificacion.trim()) {
        data.justificacionRechazo = justificacion.trim();
      }

      await indicioService.updateIndicioEstado(selectedIndicio.Id, data);
      
      handleCloseApprovalDialog();
      loadData();
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError(err.response?.data?.error || 'Error al actualizar el estado de la evidencia');
    }
  };

  const handleOpenDetailDialog = (indicio) => {
    setSelectedIndicio(indicio);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedIndicio(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredIndicios = getFilteredIndicios();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Gestión de Evidencias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expediente: {expedienteCodigo}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1BA5D1 90%)',
              boxShadow: '0 4px 8px 3px rgba(33, 203, 243, .4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Agregar Nueva Evidencia
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Pestañas para filtrar evidencias */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingIcon fontSize="small" />
                Pendientes
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApproveIcon fontSize="small" />
                Aprobadas
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DenyIcon fontSize="small" />
                Denegadas
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Tabla de Indicios */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon fontSize="small" />
                  Descripción
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorIcon fontSize="small" />
                  Color
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SizeIcon fontSize="small" />
                  Tamaño
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WeightIcon fontSize="small" />
                  Peso
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" />
                  Ubicación
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  Técnico
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredIndicios().length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      No hay evidencias registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Haga clic en "Agregar Evidencia" para comenzar
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredIndicios().map((indicio, index) => (
                <TableRow 
                  key={indicio.Id}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={indicio.Descripcion}>
                        {indicio.Descripcion}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {indicio.Color ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ColorIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {indicio.Color}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SizeIcon fontSize="small" color="info" />
                      <Typography variant="body2">
                        {indicio.Tamano || 'No especificado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WeightIcon fontSize="small" color="warning" />
                      <Typography variant="body2">
                        {indicio.Peso ? `${indicio.Peso} lbs` : 'No especificado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="error" />
                      <Typography variant="body2">
                        {indicio.Ubicacion || 'No especificado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="success" />
                      <Typography variant="body2">
                        {indicio.TecnicoNombre || 'No asignado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {indicio.FechaRegistro ? 
                        new Date(indicio.FechaRegistro).toLocaleDateString('es-ES') : 
                        'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetailDialog(indicio)}
                        color="info"
                        title="Ver detalles"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'info.light',
                            color: 'white'
                          }
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(indicio)}
                        color="primary"
                        title="Editar evidencia"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Botones de aprobación solo para administradores y solo en pendientes */}
                      {hasPermission('evidencias.aprobar') && tabValue === 0 && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenApprovalDialog(indicio, 'approve')}
                            color="success"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'success.light',
                                color: 'white'
                              }
                            }}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenApprovalDialog(indicio, 'deny')}
                            color="warning"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'warning.light',
                                color: 'white'
                              }
                            }}
                          >
                            <DenyIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(indicio.Id)}
                        color="error"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para Crear/Editar Indicio */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {editingIndicio ? <EditIcon /> : <AddIcon />}
          {editingIndicio ? 'Editar Evidencia' : 'Agregar Nueva Evidencia'}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Card sx={{ mt: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <CardHeader 
              title="Información de la Evidencia"
              titleTypographyProps={{ variant: 'h6', color: 'primary' }}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                {/* Descripción */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción de la Evidencia"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    required
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 500,
                      style: { unicodeBidi: 'plaintext' }
                    }}
                    helperText="Describa detalladamente la evidencia encontrada (máx. 500 caracteres)"
                    variant="outlined"
                  />
                </Grid>
                
                {/* Color */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ColorIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 50,
                      style: { unicodeBidi: 'plaintext' }
                    }}
                    helperText="Color predominante de la evidencia (ej: marrón, beige)"
                    variant="outlined"
                  />
                </Grid>
                
                {/* Tamaño */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tamaño/Dimensiones"
                    value={formData.tamano}
                    onChange={(e) => handleInputChange('tamano', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SizeIcon color="info" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 100,
                      style: { unicodeBidi: 'plaintext' }
                    }}
                    helperText="Ej: 15cm x 20cm, Grande, Pequeño"
                    variant="outlined"
                  />
                </Grid>
                
                {/* Peso */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso"
                    type="number"
                    value={formData.peso}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WeightIcon color="warning" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
                    }}
                    inputProps={{ step: "0.01", min: "0" }}
                    helperText="Peso en libras"
                    variant="outlined"
                  />
                </Grid>
                
                {/* Ubicación */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ubicación de Hallazgo"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="error" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 200,
                      style: { unicodeBidi: 'plaintext' }
                    }}
                    helperText="Lugar exacto donde se encontró (ej: habitación principal)"
                    variant="outlined"
                  />
                </Grid>
                
                {/* Técnico Responsable */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={tecnicos}
                    getOptionLabel={(option) => `${option.Nombre} (${option.Rol})`}
                    value={tecnicos.find(t => t.Id === formData.tecnicoId) || null}
                    onChange={(event, newValue) => {
                      handleInputChange('tecnicoId', newValue?.Id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Técnico Responsable"
                        required
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="success" />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Seleccione el técnico responsable de esta evidencia"
                        variant="outlined"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body1">{option.Nombre}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.Rol}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Información adicional */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon fontSize="small" />
              <strong>Expediente:</strong> {expedienteCodigo}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Todos los campos marcados con * son obligatorios
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            size="large"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.descripcion || !formData.tecnicoId}
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            {editingIndicio ? 'Actualizar Evidencia' : 'Guardar Evidencia'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Aprobación/Rechazo de Indicio */}
      <Dialog
        open={openApprovalDialog}
        onClose={handleCloseApprovalDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: approvalAction === 'approve' ? 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #e57373 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {approvalAction === 'approve' ? <ApproveIcon /> : <DenyIcon />}
          {approvalAction === 'approve' ? 'Aprobar Evidencia' : 'Rechazar Evidencia'}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            {approvalAction === 'approve' ? '¿Está seguro de que desea aprobar esta evidencia?' : '¿Está seguro de que desea rechazar esta evidencia?'}
          </Typography>
          
          {approvalAction === 'deny' && (
            <TextField
              fullWidth
              label="Justificación de Rechazo"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              helperText="Explique brevemente el motivo del rechazo"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseApprovalDialog}
            startIcon={<CancelIcon />}
            size="large"
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleApprovalSubmit}
            variant="contained"
            startIcon={approvalAction === 'approve' ? <ApproveIcon /> : <DenyIcon />}
            color={approvalAction === 'approve' ? 'success' : 'error'}
            size="large"
            sx={{
              background: approvalAction === 'approve' ? 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)' : 'linear-gradient(45deg, #d32f2f 30%, #e57373 90%)',
              boxShadow: `0 3px 5px 2px rgba(${approvalAction === 'approve' ? '56, 142, 60' : '211, 47, 47'}, .3)`,
            }}
          >
            {approvalAction === 'approve' ? 'Sí, Aprobar' : 'Sí, Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Detalles */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ViewIcon />
          <Typography variant="h6" component="div">
            Detalles de la Evidencia
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedIndicio && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <DescriptionIcon />
                        </Avatar>
                      }
                      title="Información General"
                      subheader={`ID: ${selectedIndicio.Id}`}
                      sx={{ 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50'
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Descripción:
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                        {selectedIndicio.Descripcion || 'No especificada'}
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ColorIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Color:</Typography>
                            <Typography variant="body2">{selectedIndicio.Color || 'No especificado'}</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <SizeIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Tamaño:</Typography>
                            <Typography variant="body2">{selectedIndicio.Tamano || 'No especificado'}</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <WeightIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Peso:</Typography>
                            <Typography variant="body2">
                              {selectedIndicio.Peso ? `${selectedIndicio.Peso} lbs` : 'No especificado'}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <LocationIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Ubicación:</Typography>
                            <Typography variant="body2">{selectedIndicio.Ubicacion || 'No especificada'}</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Técnico Asignado:</Typography>
                            <Typography variant="body2">{selectedIndicio.TecnicoNombre || 'No asignado'}</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Fecha de Registro:</Typography>
                            <Typography variant="body2">
                              {selectedIndicio.FechaRegistro ? 
                                new Date(selectedIndicio.FechaRegistro).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                'No disponible'
                              }
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {selectedIndicio.Estado && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Estado:</Typography>
                          <Chip 
                            label={selectedIndicio.Estado}
                            color={selectedIndicio.Estado === 'Aprobada' ? 'success' : 
                                   selectedIndicio.Estado === 'Denegada' ? 'error' : 'warning'}
                            variant="outlined"
                            size="medium"
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Button 
            onClick={handleCloseDetailDialog}
            variant="contained"
            startIcon={<CancelIcon />}
            size="large"
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndiciosManager;
