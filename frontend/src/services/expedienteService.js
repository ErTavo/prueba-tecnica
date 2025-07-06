import apiClient from './apiClient';

class ExpedienteService {

  async getAllExpedientes() {
    try {
      const response = await apiClient.get('/api/expedientes');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo expedientes:', error);
      throw error;
    }
  }

  async getExpedienteById(id) {
    try {
      const response = await apiClient.get(`/api/expedientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo expediente ${id}:`, error);
      throw error;
    }
  }

  async getExpedientesByTecnico(tecnicoId) {
    try {
      const response = await apiClient.get(`/api/expedientes/tecnico/${tecnicoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo expedientes del técnico ${tecnicoId}:`, error);
      throw error;
    }
  }

  async createExpediente(expedienteData) {
    try {
      const response = await apiClient.post('/api/expedientes', expedienteData);
      return response.data;
    } catch (error) {
      console.error('Error creando expediente:', error);
      throw error;
    }
  }

  async updateExpediente(id, expedienteData) {
    try {
      const response = await apiClient.put(`/api/expedientes/${id}`, expedienteData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando expediente ${id}:`, error);
      throw error;
    }
  }

  async changeExpedienteEstado(id, estadoData) {
    try {
      const response = await apiClient.put(`/api/expedientes/${id}/estado`, estadoData);
      return response.data;
    } catch (error) {
      console.error(`Error cambiando estado del expediente ${id}:`, error);
      throw error;
    }
  }

  async deleteExpediente(id) {
    try {
      const response = await apiClient.delete(`/api/expedientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando expediente ${id}:`, error);
      throw error;
    }
  }

  getValidEstados() {
    return ['Pendiente', 'EnProceso', 'Completado', 'Rechazado'];
  }
}

export default new ExpedienteService();
