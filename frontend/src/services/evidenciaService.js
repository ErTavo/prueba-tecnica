import apiClient from './apiClient';


class EvidenciaService {

  async getAllEvidencias(filtros = {}) {
    try {
      let url = '/api/indicios';
      const params = new URLSearchParams();
      
      if (filtros.expedienteId) {
        params.append('expedienteId', filtros.expedienteId);
      }
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      if (filtros.tecnicoId) {
        params.append('tecnicoId', filtros.tecnicoId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo evidencias:', error);
      throw error;
    }
  }

  async getEvidenciaById(id) {
    try {
      const response = await apiClient.get(`/api/indicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo evidencia ${id}:`, error);
      throw error;
    }
  }

  async getEvidenciasByExpediente(expedienteId) {
    try {
      const response = await apiClient.get(`/api/indicios/expediente/${expedienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo evidencias del expediente ${expedienteId}:`, error);
      throw error;
    }
  }

  async getEvidenciasByTecnico(tecnicoId) {
    try {
      const response = await apiClient.get(`/api/indicios/tecnico/${tecnicoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo evidencias del técnico ${tecnicoId}:`, error);
      throw error;
    }
  }

  async getEvidenciasPendientes() {
    try {
      const response = await apiClient.get('/api/indicios?estado=Pendiente');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo evidencias pendientes:', error);
      throw error;
    }
  }

  async createEvidencia(evidenciaData) {
    try {
      const response = await apiClient.post('/api/indicios', evidenciaData);
      return response.data;
    } catch (error) {
      console.error('Error creando evidencia:', error);
      throw error;
    }
  }

  async updateEvidencia(id, evidenciaData) {
    try {
      const response = await apiClient.put(`/api/indicios/${id}`, evidenciaData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando evidencia ${id}:`, error);
      throw error;
    }
  }

  async deleteEvidencia(id) {
    try {
      const response = await apiClient.delete(`/api/indicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando evidencia ${id}:`, error);
      throw error;
    }
  }

  async aprobarEvidencia(id, comentarios = '') {
    try {
      const response = await apiClient.put(`/api/indicios/${id}/aprobar`, {
        comentarios
      });
      return response.data;
    } catch (error) {
      console.error(`Error aprobando evidencia ${id}:`, error);
      throw error;
    }
  }

  async rechazarEvidencia(id, justificacion) {
    try {
      if (!justificacion || justificacion.trim().length === 0) {
        throw new Error('La justificación es requerida para rechazar una evidencia');
      }
      
      const response = await apiClient.put(`/api/indicios/${id}/rechazar`, {
        justificacion
      });
      return response.data;
    } catch (error) {
      console.error(`Error rechazando evidencia ${id}:`, error);
      throw error;
    }
  }

  async marcarEnRevision(id) {
    try {
      const response = await apiClient.put(`/api/indicios/${id}/revision`);
      return response.data;
    } catch (error) {
      console.error(`Error marcando evidencia ${id} como en revisión:`, error);
      throw error;
    }
  }

  async getHistorialEvidencia(id) {
    try {
      const response = await apiClient.get(`/api/indicios/${id}/historial`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo historial de evidencia ${id}:`, error);
      throw error;
    }
  }

  async subirArchivo(id, formData) {
    try {
      const response = await apiClient.post(`/api/indicios/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error subiendo archivo para evidencia ${id}:`, error);
      throw error;
    }
  }

  validateEvidenciaData(evidenciaData) {
    const errors = [];

    if (!evidenciaData.expedienteId || !Number.isInteger(Number(evidenciaData.expedienteId))) {
      errors.push('ID de expediente es requerido y debe ser un número entero');
    }

    if (!evidenciaData.descripcion || evidenciaData.descripcion.trim().length === 0) {
      errors.push('Descripción es requerida');
    }

    if (evidenciaData.descripcion && evidenciaData.descripcion.length > 500) {
      errors.push('Descripción no puede exceder 500 caracteres');
    }

    if (!evidenciaData.tecnicoId || !Number.isInteger(Number(evidenciaData.tecnicoId))) {
      errors.push('ID de técnico es requerido y debe ser un número entero');
    }

    if (evidenciaData.color && evidenciaData.color.length > 50) {
      errors.push('Color no puede exceder 50 caracteres');
    }

    if (evidenciaData.tamano && evidenciaData.tamano.length > 50) {
      errors.push('Tamano no puede exceder 50 caracteres');
    }

    if (evidenciaData.peso && (isNaN(evidenciaData.peso) || Number(evidenciaData.peso) < 0)) {
      errors.push('Peso debe ser un número positivo');
    }

    if (evidenciaData.ubicacion && evidenciaData.ubicacion.length > 200) {
      errors.push('Ubicación no puede exceder 200 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateJustificacion(justificacion) {
    const errors = [];

    if (!justificacion || justificacion.trim().length === 0) {
      errors.push('La justificación es requerida');
    }

    if (justificacion && justificacion.length < 10) {
      errors.push('La justificación debe tener al menos 10 caracteres');
    }

    if (justificacion && justificacion.length > 1000) {
      errors.push('La justificación no puede exceder 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new EvidenciaService();
