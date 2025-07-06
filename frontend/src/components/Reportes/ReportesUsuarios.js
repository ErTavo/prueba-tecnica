import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';

import reporteService from '../../services/reporteService';
import userService from '../../services/userService';
import expedienteService from '../../services/expedienteService';
import indicioService from '../../services/indicioService';
import { useAuth } from '../../contexts/AuthContext';

const ReportesUsuarios = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [reporteData, setReporteData] = useState(null);
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [openDetalleDialog, setOpenDetalleDialog] = useState(false);
  
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    usuario: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error cargando la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, value) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: value
    }));
  };

  const handleInputChange = (campo) => (event) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: event.target.value
    }));
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usuariosRes, expedientesRes, indiciosRes] = await Promise.all([
        userService.getAllUsers(),
        expedienteService.getAllExpedientes(),
        indicioService.getAllIndicios()
      ]);
      
      const usuarios = usuariosRes.data || [];
      const expedientes = expedientesRes.data || [];
      const indicios = indiciosRes.data || [];
      
      let indiciosFiltrados = indicios;
      
      if (filtros.fechaInicio) {
        indiciosFiltrados = indiciosFiltrados.filter(indicio => 
          new Date(indicio.FechaRegistro) >= new Date(filtros.fechaInicio)
        );
      }
      
      if (filtros.fechaFin) {
        indiciosFiltrados = indiciosFiltrados.filter(indicio => 
          new Date(indicio.FechaRegistro) <= new Date(filtros.fechaFin)
        );
      }
      
      if (filtros.estado) {
        const estadoMap = {
          'aprobado': 'Aprobada',
          'rechazado': 'Denegada',
          'pendiente': 'Pendiente',
          'en_revision': 'En Revisión'
        };
        indiciosFiltrados = indiciosFiltrados.filter(indicio => 
          indicio.Estado === estadoMap[filtros.estado]
        );
      }
      
      if (filtros.usuario) {
        indiciosFiltrados = indiciosFiltrados.filter(indicio => 
          indicio.TecnicoId === parseInt(filtros.usuario)
        );
      }
      
      let expedientesFiltrados = expedientes;
      
      if (filtros.fechaInicio) {
        expedientesFiltrados = expedientesFiltrados.filter(expediente => 
          new Date(expediente.FechaRegistro || expediente.FechaCreacion) >= new Date(filtros.fechaInicio)
        );
      }
      
      if (filtros.fechaFin) {
        expedientesFiltrados = expedientesFiltrados.filter(expediente => 
          new Date(expediente.FechaRegistro || expediente.FechaCreacion) <= new Date(filtros.fechaFin)
        );
      }
      
      if (filtros.usuario) {
        expedientesFiltrados = expedientesFiltrados.filter(expediente => 
          expediente.TecnicoId === parseInt(filtros.usuario)
        );
      }
      
      const resumen = {
        totalRegistros: indiciosFiltrados.length,
        totalAprobaciones: indiciosFiltrados.filter(i => i.Estado === 'Aprobada').length,
        totalRechazos: indiciosFiltrados.filter(i => i.Estado === 'Denegada').length,
        totalPendientes: indiciosFiltrados.filter(i => !i.Estado || i.Estado === 'Pendiente').length
      };
      
      const usuariosConEstadisticas = usuarios.map(usuario => {
        const indiciosUsuario = indiciosFiltrados.filter(indicio => 
          indicio.TecnicoId === usuario.Id
        );
        
        const expedientesUsuario = expedientesFiltrados.filter(expediente => 
          expediente.TecnicoId === usuario.Id
        );
        
        return {
          id: usuario.Id,
          nombre: usuario.Nombre,
          usuario: usuario.Usuario,
          rol: usuario.Rol,
          estadisticas: {
            totalRegistros: indiciosUsuario.length,
            totalAprobaciones: indiciosUsuario.filter(i => i.Estado === 'Aprobada').length,
            totalRechazos: indiciosUsuario.filter(i => i.Estado === 'Denegada').length,
            totalPendientes: indiciosUsuario.filter(i => !i.Estado || i.Estado === 'Pendiente').length,
            expedientesAsignados: expedientesUsuario.length
          }
        };
      }).filter(usuario => {
        if (filtros.usuario) {
          return usuario.id === parseInt(filtros.usuario);
        }
        
        return usuario.estadisticas.totalRegistros > 0 || usuario.estadisticas.expedientesAsignados > 0;
      });
      
      const reporteData = {
        resumen,
        usuarios: usuariosConEstadisticas
      };
      
      setReporteData(reporteData);
      
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const verDetalleUsuario = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const [expedientesRes, indiciosRes] = await Promise.all([
        expedienteService.getAllExpedientes(),
        indicioService.getAllIndicios()
      ]);
      
      const expedientes = expedientesRes.data || [];
      const indicios = indiciosRes.data || [];
      
      let indiciosUsuario = indicios.filter(indicio => indicio.TecnicoId === userId);
      let expedientesUsuario = expedientes.filter(expediente => expediente.TecnicoId === userId);
      
      if (filtros.fechaInicio) {
        indiciosUsuario = indiciosUsuario.filter(indicio => 
          new Date(indicio.FechaRegistro) >= new Date(filtros.fechaInicio)
        );
        expedientesUsuario = expedientesUsuario.filter(expediente => 
          new Date(expediente.FechaRegistro || expediente.FechaCreacion) >= new Date(filtros.fechaInicio)
        );
      }
      
      if (filtros.fechaFin) {
        indiciosUsuario = indiciosUsuario.filter(indicio => 
          new Date(indicio.FechaRegistro) <= new Date(filtros.fechaFin)
        );
        expedientesUsuario = expedientesUsuario.filter(expediente => 
          new Date(expediente.FechaRegistro || expediente.FechaCreacion) <= new Date(filtros.fechaFin)
        );
      }
      
      const totalAprobaciones = indiciosUsuario.filter(i => i.Estado === 'Aprobada').length;
      const totalRegistros = indiciosUsuario.length;
      const tasaAprobacion = totalRegistros > 0 ? Math.round((totalAprobaciones / totalRegistros) * 100) : 0;
      
      const actividadesRecientes = indiciosUsuario
        .sort((a, b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro))
        .slice(0, 10)
        .map(indicio => ({
          fecha: indicio.FechaRegistro,
          tipo: 'Indicio/Evidencia',
          descripcion: indicio.Descripcion || `Indicio ID: ${indicio.Id}`,
          estado: indicio.Estado || 'Pendiente'
        }));
      
      const actividadesExpedientes = expedientesUsuario
        .sort((a, b) => new Date(b.FechaRegistro || b.FechaCreacion) - new Date(a.FechaRegistro || a.FechaCreacion))
        .slice(0, 5)
        .map(expediente => ({
          fecha: expediente.FechaRegistro || expediente.FechaCreacion,
          tipo: 'Expediente',
          descripcion: `${expediente.NumeroExpediente || expediente.Id} - ${expediente.Descripcion || 'Sin descripción'}`,
          estado: expediente.Estado || 'Abierto'
        }));
      
      const todasLasActividades = [...actividadesRecientes, ...actividadesExpedientes]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 15);
      
      const usuario = users.find(u => u.Id === userId);
      
      const detalleData = {
        usuario: usuario,
        estadisticas: {
          evidenciasCreadas: indiciosUsuario.length,
          expedientesCreados: expedientesUsuario.length,
          revisionesRealizadas: indiciosUsuario.filter(i => i.Estado && i.Estado !== 'Pendiente').length,
          tasaAprobacion: tasaAprobacion
        },
        actividades: todasLasActividades
      };
      
      setDetalleUsuario(detalleData);
      setOpenDetalleDialog(true);
      
    } catch (err) {
      console.error('Error obteniendo detalle del usuario:', err);
      setError('Error al obtener el detalle del usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = async (tipo) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!reporteData) {
        setError('Debe generar un reporte antes de exportar');
        return;
      }
      
      const csvContent = generarCSV(reporteData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_usuarios_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (err) {
      console.error('Error exportando reporte:', err);
      setError('Error al exportar el reporte: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  const generarCSV = (data) => {
    const headers = ['Usuario', 'Nombre', 'Rol', 'Total Registros', 'Aprobaciones', 'Rechazos', 'Pendientes', 'Expedientes Asignados'];
    const rows = data.usuarios.map(usuario => [
      usuario.usuario,
      usuario.nombre,
      usuario.rol,
      usuario.estadisticas.totalRegistros,
      usuario.estadisticas.totalAprobaciones,
      usuario.estadisticas.totalRechazos,
      usuario.estadisticas.totalPendientes,
      usuario.estadisticas.expedientesAsignados || 0
    ]);
    
    rows.unshift(['RESUMEN GENERAL', '', '', data.resumen.totalRegistros, data.resumen.totalAprobaciones, data.resumen.totalRechazos, data.resumen.totalPendientes, '']);
    rows.unshift(headers);
    
    return rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const getEstadoChip = (estado) => {
    const config = {
      'Aprobada': { color: 'success', icon: <CheckIcon />, label: 'Aprobada' },
      'Denegada': { color: 'error', icon: <CancelIcon />, label: 'Denegada' },
      'Pendiente': { color: 'warning', icon: <PendingIcon />, label: 'Pendiente' },
      'En Revisión': { color: 'info', icon: <PendingIcon />, label: 'En Revisión' },
      'Abierto': { color: 'info', icon: <PendingIcon />, label: 'Abierto' },
      'Cerrado': { color: 'success', icon: <CheckIcon />, label: 'Cerrado' },
      'aprobada': { color: 'success', icon: <CheckIcon />, label: 'Aprobada' },
      'denegada': { color: 'error', icon: <CancelIcon />, label: 'Denegada' },
      'pendiente': { color: 'warning', icon: <PendingIcon />, label: 'Pendiente' }
    };
    
    const configItem = config[estado] || { color: 'default', icon: null, label: estado || 'Sin estado' };
    
    return (
      <Chip
        size="small"
        color={configItem.color}
        icon={configItem.icon}
        label={configItem.label}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          Reportes de Usuarios
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros del Reporte
          </Typography>
          
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Fecha Inicio"
                type="date"
                value={filtros.fechaInicio}
                onChange={handleInputChange('fechaInicio')}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 200 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Fecha Fin"
                type="date"
                value={filtros.fechaFin}
                onChange={handleInputChange('fechaFin')}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 200 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="aprobado">Aprobado</MenuItem>
                  <MenuItem value="rechazado">Rechazado</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="en_revision">En Revisión</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  label="Usuario"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.Id} value={user.Id}>
                      {user.Nombre} ({user.Usuario})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={generarReporte}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
              sx={{ minWidth: 140 }}
            >
              Generar Reporte
            </Button>
            
            {reporteData && (
              <Button
                variant="outlined"
                onClick={() => exportarReporte('usuarios')}
                disabled={loading}
                startIcon={<DownloadIcon />}
                sx={{ minWidth: 140 }}
              >
                Exportar CSV
              </Button>
            )}
          </Box>
        </Paper>

        {/* Resumen General */}
        {reporteData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Registros
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {reporteData.resumen?.totalRegistros || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ bgcolor: 'success.light', color: 'success.contrastText', textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Aprobaciones
                  </Typography>
                  <Typography variant="h4" component="div">
                    {reporteData.resumen?.totalAprobaciones || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ bgcolor: 'error.light', color: 'error.contrastText', textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Rechazos
                  </Typography>
                  <Typography variant="h4" component="div">
                    {reporteData.resumen?.totalRechazos || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Pendientes
                  </Typography>
                  <Typography variant="h4" component="div">
                    {reporteData.resumen?.totalPendientes || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla de Usuarios */}
        {reporteData && reporteData.usuarios && (
          <Paper sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Estadísticas por Usuario
            </Typography>
            
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200 }}>Usuario</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Rol</TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>Registros</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>Aprobaciones</TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>Rechazos</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>Pendientes</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>Expedientes</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporteData.usuarios.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {userData.nombre}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {userData.usuario}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={userData.rol} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6">
                          {userData.estadisticas?.totalRegistros || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="success.main">
                          {userData.estadisticas?.totalAprobaciones || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="error.main">
                          {userData.estadisticas?.totalRechazos || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="warning.main">
                          {userData.estadisticas?.totalPendientes || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="info.main">
                          {userData.estadisticas?.expedientesAsignados || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => verDetalleUsuario(userData.id)}
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Dialog de Detalle de Usuario */}
        <Dialog
          open={openDetalleDialog}
          onClose={() => setOpenDetalleDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Detalle de Usuario: {detalleUsuario?.usuario?.Nombre}
          </DialogTitle>
          <DialogContent>
            {detalleUsuario && (
              <Box>
                {/* Estadísticas Detalladas */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Estadísticas Detalladas
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Evidencias Creadas
                        </Typography>
                        <Typography variant="h5">
                          {detalleUsuario.estadisticas?.evidenciasCreadas || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Expedientes Creados
                        </Typography>
                        <Typography variant="h5">
                          {detalleUsuario.estadisticas?.expedientesCreados || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Revisiones Realizadas
                        </Typography>
                        <Typography variant="h5">
                          {detalleUsuario.estadisticas?.revisionesRealizadas || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Tasa de Aprobación
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {detalleUsuario.estadisticas?.tasaAprobacion || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Actividades Recientes */}
                <Typography variant="h6" gutterBottom>
                  Actividades Recientes
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleUsuario.actividades?.map((actividad, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(actividad.fecha).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={actividad.tipo} />
                          </TableCell>
                          <TableCell>{actividad.descripcion}</TableCell>
                          <TableCell>
                            {getEstadoChip(actividad.estado)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!detalleUsuario.actividades || detalleUsuario.actividades.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No hay actividades registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetalleDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default ReportesUsuarios;
