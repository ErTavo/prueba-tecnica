import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  CardActions,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Stack
} from '@mui/material';
import {
  Group as UsersIcon,
  Folder as ExpedientesIcon,
  Assessment as StatsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Description as EvidenceIcon,
  Pending as PendingIcon,
  Cancel as DenyIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import expedienteService from '../services/expedienteService';
import indicioService from '../services/indicioService';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuarios: 0,
    expedientes: 0,
    expedientesAsignados: 0,
    expedientesPendientes: 0,
    indicios: 0,
    indiciosAsignados: 0,
    indiciosPendientes: 0,
    indiciosAprobados: 0,
    indiciosDenegados: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAdmin = user?.rol === 'Admin' || user?.rol === 'Supervisor';
      let statsData = {
        usuarios: 0,
        expedientes: 0,
        expedientesAsignados: 0,
        expedientesPendientes: 0,
        indicios: 0,
        indiciosAsignados: 0,
        indiciosPendientes: 0,
        indiciosAprobados: 0,
        indiciosDenegados: 0
      };

      if (isAdmin && hasPermission('usuarios.ver')) {
        try {
          const usuariosRes = await userService.getAllUsers();
          statsData.usuarios = usuariosRes.data?.length || 0;
        } catch (err) {
          console.warn('Error cargando usuarios:', err.message);
        }
      }

      try {
        let expedientesRes;
        if (isAdmin) {
          expedientesRes = await expedienteService.getAllExpedientes();
        } else {
          expedientesRes = await expedienteService.getExpedientesByTecnico(user?.id);
        }

        const expedientes = expedientesRes.data || [];
        
        statsData.expedientes = expedientes.length;
        statsData.expedientesAsignados = expedientes.length;

        statsData.expedientesPendientes = expedientes.filter(
          exp => exp.Estado === 'Pendiente' || exp.Estado === 'Abierto'
        ).length;

      } catch (err) {
        console.warn('Error cargando expedientes:', err.message);
      }

      try {
        let indiciosRes;
        if (isAdmin) {
          indiciosRes = await indicioService.getAllIndicios();
        } else {
          indiciosRes = await indicioService.getIndiciosByTecnico(user?.id);
        }

        const indicios = indiciosRes.data || [];
        
        statsData.indicios = indicios.length;
        statsData.indiciosAsignados = indicios.length;

        statsData.indiciosPendientes = indicios.filter(
          ind => !ind.Estado || ind.Estado === 'Pendiente'
        ).length;
        
        statsData.indiciosAprobados = indicios.filter(
          ind => ind.Estado === 'Aprobada'
        ).length;

        statsData.indiciosDenegados = indicios.filter(
          ind => ind.Estado === 'Denegada'
        ).length;

        const recentIndicios = indicios
          .sort((a, b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro))
          .slice(0, 5)
          .map(ind => ({
            id: ind.Id,
            tipo: 'evidencia',
            descripcion: ind.Descripcion || 'Sin descripción',
            estado: ind.Estado || 'Pendiente',
            fecha: ind.FechaRegistro,
            expedienteId: ind.ExpedienteId
          }));

        setRecentActivity(recentIndicios);

      } catch (err) {
        console.warn('Error cargando indicios:', err.message);
      }

      setStats(statsData);

    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('Error cargando los datos del dashboard. Algunos servicios pueden no estar disponibles.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobada':
      case 'Aprobado':
        return 'success';
      case 'Denegada':
      case 'Denegado':
      case 'Rechazado':
        return 'error';
      case 'Pendiente':
        return 'warning';
      case 'En Revisión':
        return 'info';
      default:
        return 'default';
    }
  };

  const getQuickActions = () => {
    const actions = [];
    const isAdmin = user?.rol === 'Admin' || user?.rol === 'Supervisor';

    if (hasPermission('expedientes.ver')) {
      actions.push({
        title: isAdmin ? 'Gestionar Expedientes' : 'Mis Expedientes',
        description: isAdmin ? 'Ver y gestionar todos los expedientes' : 'Ver expedientes asignados',
        icon: ExpedientesIcon,
        color: 'primary',
        action: () => navigate('/expedientes')
      });
    }

    if (isAdmin && hasPermission('evidencias.aprobar')) {
      actions.push({
        title: 'Revisar Evidencias',
        description: 'Aprobar o denegar evidencias pendientes',
        icon: ApproveIcon,
        color: 'warning',
        action: () => navigate('/expedientes'),
        badge: stats.indiciosPendientes > 0 ? stats.indiciosPendientes : null
      });
    }

    if (isAdmin && hasPermission('usuarios.ver')) {
      actions.push({
        title: 'Gestionar Usuarios',
        description: 'Administrar usuarios del sistema',
        icon: UsersIcon,
        color: 'info',
        action: () => navigate('/usuarios')
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6
        },
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2 0%, #1565c0 100%' :
                     color === 'secondary' ? '#7b1fa2 0%, #6a1b9a 100%' :
                     color === 'success' ? '#388e3c 0%, #2e7d32 100%' :
                     color === 'warning' ? '#f57c00 0%, #ef6c00 100%' :
                     color === 'info' ? '#0288d1 0%, #0277bd 100%' :
                     '#757575 0%, #616161 100%'})`,
        color: color === 'warning' ? 'text.primary' : 'white'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 'medium',
                color: color === 'warning' ? 'text.secondary' : 'rgba(255,255,255,0.9)'
              }} 
              gutterBottom 
              variant="body2"
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                color: color === 'warning' ? 'text.primary' : 'white'
              }}
            >
              {loading ? <CircularProgress size={32} sx={{ color: 'inherit' }} /> : value}
            </Typography>
          </Box>
          <Box>
            <Icon 
              sx={{ 
                fontSize: 48, 
                opacity: 0.8,
                color: color === 'warning' ? `${color}.main` : 'rgba(255,255,255,0.8)'
              }} 
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ maxWidth: '1400px', mx: 'auto' }}>
      {/* Header personalizado mejorado */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                mr: 3, 
                width: 64, 
                height: 64,
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Bienvenido, {user?.nombre || user?.usuario || 'Usuario'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 'normal' }}>
                {user?.rol === 'Admin' ? 'Administrador del Sistema' : 
                 user?.rol === 'Supervisor' ? 'Supervisor' : 
                 user?.rol === 'Tecnico' ? 'Técnico Forense' : 'Usuario'}
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Estadísticas personalizadas */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary' }}>
        📊 Resumen de Datos
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Solo mostrar usuarios para administradores */}
        {(user?.rol === 'Admin' || user?.rol === 'Supervisor') && hasPermission('usuarios.ver') && (
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <StatCard
              title="Total Usuarios"
              value={stats.usuarios}
              icon={UsersIcon}
              color="primary"
              loading={loading}
            />
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <StatCard
            title={user?.rol === 'Admin' || user?.rol === 'Supervisor' ? 'Total Expedientes' : 'Mis Expedientes'}
            value={stats.expedientes}
            icon={ExpedientesIcon}
            color="secondary"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <StatCard
            title={user?.rol === 'Admin' || user?.rol === 'Supervisor' ? 'Total Evidencias' : 'Mis Evidencias'}
            value={stats.indicios}
            icon={EvidenceIcon}
            color="success"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <StatCard
            title="Expedientes Pendientes"
            value={stats.expedientesPendientes}
            icon={PendingIcon}
            color="warning"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Sección de contenido principal */}
      <Grid container spacing={4}>
        {/* Panel de estado de evidencias */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              height: 'fit-content',
              borderRadius: 2,
              background: 'linear-gradient(145deg, #fafafa, #f5f5f5)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                📈 Estado de Evidencias
              </Typography>
              {(user?.rol !== 'Admin' && user?.rol !== 'Supervisor') && (
                <Chip 
                  label="Solo mis evidencias" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box 
                  textAlign="center" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                    border: '1px solid #ffb74d'
                  }}
                >
                  <Badge badgeContent={stats.indiciosPendientes} color="warning" max={99}>
                    <PendingIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  </Badge>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}>
                    {stats.indiciosPendientes}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                    Pendientes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box 
                  textAlign="center"
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                    border: '1px solid #66bb6a'
                  }}
                >
                  <Badge badgeContent={stats.indiciosAprobados} color="success" max={99}>
                    <ApproveIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  </Badge>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 1 }}>
                    {stats.indiciosAprobados}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                    Aprobadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box 
                  textAlign="center"
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                    border: '1px solid #e57373'
                  }}
                >
                  <Badge badgeContent={stats.indiciosDenegados} color="error" max={99}>
                    <DenyIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                  </Badge>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.dark', mb: 1 }}>
                    {stats.indiciosDenegados}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                    Denegadas
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Panel de acciones rápidas */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              height: 'fit-content',
              borderRadius: 2,
              background: 'linear-gradient(145deg, #fafafa, #f5f5f5)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
              ⚡ Acciones Rápidas
            </Typography>
            <Stack spacing={2}>
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': { 
                      transform: 'translateX(8px)',
                      boxShadow: 3
                    },
                    borderRadius: 2
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box position="relative">
                        <Avatar sx={{ bgcolor: `${action.color}.main`, width: 40, height: 40 }}>
                          <action.icon sx={{ fontSize: 20 }} />
                        </Avatar>
                        {action.badge && (
                          <Badge 
                            badgeContent={action.badge} 
                            color="error" 
                            sx={{ 
                              position: 'absolute', 
                              top: -5, 
                              right: -5 
                            }}
                          />
                        )}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {action.description}
                        </Typography>
                      </Box>
                      <ViewIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            {quickActions.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay acciones disponibles para tu rol actual.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Panel de actividad reciente */}
        {recentActivity.length > 0 && (
          <Grid item xs={12}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #fafafa, #f5f5f5)',
                border: '1px solid #e0e0e0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  📋 Actividad Reciente
                </Typography>
                {(user?.rol !== 'Admin' && user?.rol !== 'Supervisor') && (
                  <Chip 
                    label="Solo mis evidencias" 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                )}
              </Box>
              <Grid container spacing={2}>
                {recentActivity.map((activity, index) => (
                  <Grid item xs={12} sm={6} md={4} key={activity.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        },
                        borderRadius: 2
                      }}
                      onClick={() => navigate(`/expedientes/${activity.expedienteId}`)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                          <Avatar sx={{ bgcolor: `${getEstadoColor(activity.estado)}.main` }}>
                            <EvidenceIcon />
                          </Avatar>
                          <Box flex={1}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {activity.descripcion}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Chip 
                            label={activity.estado || 'Pendiente'} 
                            size="small" 
                            color={getEstadoColor(activity.estado)}
                            variant="outlined"
                          />
                          <Typography variant="body2" color="textSecondary">
                            {activity.fecha ? new Date(activity.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'Sin fecha'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
