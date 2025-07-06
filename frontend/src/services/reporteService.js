import apiClient from './apiClient';

class ReporteService {
  async getReporteUsuarios(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.fechaInicio) {
        params.append('fechaInicio', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        params.append('fechaFin', filters.fechaFin);
      }
      if (filters.estado) {
        params.append('estado', filters.estado);
      }
      if (filters.usuario) {
        params.append('usuario', filters.usuario);
      }
      
      const response = await apiClient.get(`/api/reportes/usuarios?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener reporte de usuarios: ${error.response?.data?.error || error.message}`);
    }
  }

  async getEstadisticasUsuario(userId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.fechaInicio) {
        params.append('fechaInicio', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        params.append('fechaFin', filters.fechaFin);
      }
      
      const response = await apiClient.get(`/api/reportes/usuarios/${userId}/estadisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas del usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async getActividadesUsuario(userId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.fechaInicio) {
        params.append('fechaInicio', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        params.append('fechaFin', filters.fechaFin);
      }
      if (filters.tipo) {
        params.append('tipo', filters.tipo);
      }
      if (filters.estado) {
        params.append('estado', filters.estado);
      }
      
      const response = await apiClient.get(`/api/reportes/usuarios/${userId}/actividades?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener actividades del usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async exportarReporte(tipo, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });
      
      const response = await apiClient.get(`/api/reportes/exportar/${tipo}?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipo}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error al exportar reporte: ${error.response?.data?.error || error.message}`);
    }
  }
}

export default new ReporteService();
