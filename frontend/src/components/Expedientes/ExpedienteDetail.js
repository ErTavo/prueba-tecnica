import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Description as EvidenceIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import expedienteService from '../../services/expedienteService';
import IndiciosManager from './IndiciosManager';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`expediente-tabpanel-${index}`}
      aria-labelledby={`expediente-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ExpedienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(1);

  useEffect(() => {
    loadExpediente();
  }, [id]);

  const loadExpediente = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expedienteService.getExpedienteById(id);
      setExpediente(response.data);
    } catch (err) {
      console.error('Error cargando expediente:', err);
      setError('Error al cargar los datos del expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'EnProceso':
        return 'info';
      case 'Completado':
        return 'success';
      case 'Rechazado':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
        >
          Volver a Expedientes
        </Button>
      </Box>
    );
  }

  if (!expediente) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Expediente no encontrado
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/expedientes')}
        >
          Volver a Expedientes
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={() => navigate('/expedientes')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Expediente: {expediente.Codigo}
          </Typography>
          <Chip 
            label={expediente.Estado} 
            color={getEstadoColor(expediente.Estado)}
            sx={{ ml: 2 }}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label="Evidencias" 
              icon={<EvidenceIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Información General" 
              icon={<InfoIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panel 1: Evidencias */}
        <TabPanel value={tabValue} index={0}>
          <IndiciosManager 
            expedienteId={expediente.Id} 
            expedienteCodigo={expediente.Codigo}
          />
        </TabPanel>

        {/* Tab Panel 2: Información General */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Datos del Expediente
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Código:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {expediente.Codigo}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estado:
                      </Typography>
                      <Chip 
                        label={expediente.Estado} 
                        color={getEstadoColor(expediente.Estado)}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Registro:
                      </Typography>
                      <Typography variant="body1">
                        {formatFecha(expediente.FechaRegistro)}
                      </Typography>
                    </Grid>

                    {expediente.JustificacionRechazo && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Justificación de Rechazo:
                        </Typography>
                        <Typography variant="body1" color="error.main">
                          {expediente.JustificacionRechazo}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Técnico Asignado
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Nombre:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {expediente.TecnicoNombre || 'No asignado'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        ID Técnico:
                      </Typography>
                      <Typography variant="body1">
                        {expediente.TecnicoId || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ExpedienteDetail;
