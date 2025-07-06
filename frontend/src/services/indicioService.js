import apiClient from './apiClient';


class IndicioService {

  async getAllIndicios(expedienteId = null) {
    try {
      let url = '/api/indicios';
      if (expedienteId) {
        url += `?expedienteId=${expedienteId}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo indicios:', error);
      throw error;
    }
  }

  async getIndicioById(id) {
    try {
      const response = await apiClient.get(`/api/indicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo indicio ${id}:`, error);
      throw error;
    }
  }

  async getIndiciosByExpediente(expedienteId) {
    try {
      const response = await apiClient.get(`/api/indicios/expediente/${expedienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo indicios del expediente ${expedienteId}:`, error);
      throw error;
    }
  }

  async getIndiciosByTecnico(tecnicoId) {
    try {
      const response = await apiClient.get(`/api/indicios/tecnico/${tecnicoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo indicios del técnico ${tecnicoId}:`, error);
      throw error;
    }
  }

  async createIndicio(indicioData) {
    try {
      const response = await apiClient.post('/api/indicios', indicioData);
      return response.data;
    } catch (error) {
      console.error('Error creando indicio:', error);
      throw error;
    }
  }

  async updateIndicio(id, indicioData) {
    try {
      const response = await apiClient.put(`/api/indicios/${id}`, indicioData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando indicio ${id}:`, error);
      throw error;
    }
  }

  async deleteIndicio(id) {
    try {
      const response = await apiClient.delete(`/api/indicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando indicio ${id}:`, error);
      throw error;
    }
  }

  validateIndicioData(indicioData) {
    const errors = [];

    if (!indicioData.expedienteId || !Number.isInteger(Number(indicioData.expedienteId))) {
      errors.push('ID de expediente es requerido y debe ser un número entero');
    }

    if (!indicioData.descripcion || indicioData.descripcion.trim().length === 0) {
      errors.push('Descripción es requerida');
    }

    if (indicioData.descripcion && indicioData.descripcion.length > 500) {
      errors.push('Descripción no puede exceder 500 caracteres');
    }

    if (!indicioData.tecnicoId || !Number.isInteger(Number(indicioData.tecnicoId))) {
      errors.push('ID de técnico es requerido y debe ser un número entero');
    }

    if (indicioData.color && indicioData.color.length > 50) {
      errors.push('Color no puede exceder 50 caracteres');
    }

    if (indicioData.tamano && indicioData.tamano.length > 50) {
      errors.push('Tamano no puede exceder 50 caracteres');
    }

    if (indicioData.peso && (isNaN(indicioData.peso) || Number(indicioData.peso) < 0)) {
      errors.push('Peso debe ser un número positivo');
    }

    if (indicioData.ubicacion && indicioData.ubicacion.length > 200) {
      errors.push('Ubicación no puede exceder 200 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async updateIndicioEstado(id, estadoData) {
    try {
      const response = await apiClient.put(`/api/indicios/${id}/estado`, estadoData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando estado del indicio ${id}:`, error);
      throw error;
    }
  }
}

export default new IndicioService();
