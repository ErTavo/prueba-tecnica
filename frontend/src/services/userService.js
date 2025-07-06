import apiClient from './apiClient';

class UserService {
  async getAllUsers() {
    try {
      const response = await apiClient.get('/api/usuarios');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.response?.data?.error || error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const response = await apiClient.get(`/api/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const response = await apiClient.post('/api/usuarios', userData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/api/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/api/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.response?.data?.error || error.message}`);
    }
  }

  async login(credentials) {
    try {
      const response = await apiClient.post('/api/usuarios/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(`Error en login: ${error.response?.data?.error || error.message}`);
    }
  }
}

export default new UserService();
