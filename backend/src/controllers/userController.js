const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responses');
const { isValidId } = require('../utils/validators');
const log = require('../config/logger');

class UserController {
  
  async getAllUsers(req, res) {
    try {
      log.info('Fetching all users');
      const users = await userService.getAllUsers();
      
      if (!users || users.length === 0) {
        log.info('No users found');
        return successResponse(res, [], 'No se encontraron usuarios');
      }
      
      log.info(`Found ${users.length} users`);
      return successResponse(res, users, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      log.error('Error in UserController.getAllUsers:', error);
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      if (!isValidId(id)) {
        log.warn(`Invalid user ID format: ${id}`);
        return errorResponse(res, 'ID de usuario inválido', 400);
      }

      log.info(`Fetching user with ID: ${id}`);
      const user = await userService.getUserById(id);
      
      if (!user) {
        log.warn(`User not found with ID: ${id}`);
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      log.info(`User found: ${user.Usuario}`);
      return successResponse(res, user, 'Usuario obtenido exitosamente');
    } catch (error) {
      log.error('Error in UserController.getUserById:', error);
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      
      log.info('Creating new user:', JSON.stringify(userData, null, 2));
      
      const user = userData.usuario || userData.user || userData.Usuario;
      const pass = userData.contraseña || userData.pass || userData.Contraseña || userData.contrasenia;
      const name = userData.nombre || userData.name || userData.Nombre;
      const role = userData.rol || userData.role || userData.Rol;
      
      if (!user || !pass) {
        log.warn('Missing required fields for user creation');
        return errorResponse(res, 'Usuario y contraseña son requeridos', 400);
      }

      if (pass.length < 6) {
        log.warn('Password too short for user creation');
        return errorResponse(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      const validRoles = ['Admin', 'Tecnico', 'Supervisor'];
      let normalizedRole = role;
      
      if (role) {
        const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        if (roleCapitalized === 'Admin' || roleCapitalized === 'Tecnico' || roleCapitalized === 'Supervisor') {
          normalizedRole = roleCapitalized;
        } else {
          log.warn(`Invalid role provided: ${role}`);
          return errorResponse(res, 'Rol inválido. Debe ser: Admin, Tecnico o Supervisor', 400);
        }
      }

      const normalizedData = {
        usuario: user,
        contraseña: pass,
        nombre: name,
        rol: normalizedRole || 'Tecnico'
      };

      const newUser = await userService.createUser(normalizedData);
      log.info(`User created successfully: ${newUser.Usuario}`);
      return successResponse(res, newUser, 'Usuario creado exitosamente', 201);
    } catch (error) {
      log.error('Error in UserController.createUser:', error);
      
      if (error.message === 'El nombre de usuario ya existe' || error.message === 'DUPLICATE_USER') {
        return errorResponse(res, 'El nombre de usuario ya existe', 409);
      }
      
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      if (!isValidId(id)) {
        log.warn(`Invalid user ID format for update: ${id}`);
        return errorResponse(res, 'ID de usuario inválido', 400);
      }

      const normalizedData = {};
      if (userData.usuario || userData.user || userData.Usuario) normalizedData.usuario = userData.usuario || userData.user || userData.Usuario;
      if (userData.contraseña || userData.pass || userData.Contraseña || userData.contrasenia) normalizedData.contraseña = userData.contraseña || userData.pass || userData.Contraseña || userData.contrasenia;
      if (userData.nombre || userData.name || userData.Nombre) normalizedData.nombre = userData.nombre || userData.name || userData.Nombre;
      if (userData.rol || userData.role || userData.Rol) normalizedData.rol = userData.rol || userData.role || userData.Rol;

      log.info(`Updating user with ID: ${id}`);
      const updatedUser = await userService.updateUser(id, normalizedData);
      
      if (!updatedUser) {
        log.warn(`User not found for update with ID: ${id}`);
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      log.info(`User updated successfully: ${updatedUser.Usuario}`);
      return successResponse(res, updatedUser, 'Usuario actualizado exitosamente');
    } catch (error) {
      log.error('Error in UserController.updateUser:', error);
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      if (!isValidId(id)) {
        return errorResponse(res, 'ID de usuario inválido', 400);
      }

      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      return successResponse(res, null, 'Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error in UserController.deleteUser:', error);
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }

  async loginUser(req, res) {
    try {
      console.log('🚀 UserController.loginUser iniciado');
      console.log('📨 Request headers:', JSON.stringify(req.headers, null, 2));
      console.log('📨 Request method:', req.method);
      console.log('📨 Request URL:', req.url);
      console.log('📨 Request body type:', typeof req.body);
      console.log('📨 Request body keys:', Object.keys(req.body || {}));
      
      const requestData = req.body;
      console.log('📨 Request body recibido:', JSON.stringify(requestData, null, 2));
      
      // Intentar múltiples formas de extraer usuario y contraseña
      const user = requestData.usuario || requestData.user || requestData.Usuario;
      const pass = requestData.contraseña || requestData.pass || requestData.Contraseña || requestData.contrasenia || requestData.password;
      
      console.log('📧 Usuario extraído:', user);
      console.log('🔑 Contraseña extraída:', pass ? `[LONGITUD: ${pass.length}]` : 'undefined');
      console.log('🔑 Contraseña tipo:', typeof pass);
      
      // Validate required fields
      if (!user || !pass) {
        console.log('❌ Faltan campos requeridos: user y pass');
        console.log('❌ User exists:', !!user, 'Pass exists:', !!pass);
        return errorResponse(res, 'Usuario y contraseña son requeridos', 400);
      }

      if (typeof user !== 'string' || typeof pass !== 'string') {
        console.log('❌ Tipos de datos incorrectos');
        return errorResponse(res, 'Usuario y contraseña deben ser strings', 400);
      }

      if (user.trim() === '' || pass.trim() === '') {
        console.log('❌ Campos vacíos después de trim');
        return errorResponse(res, 'Usuario y contraseña no pueden estar vacíos', 400);
      }

      console.log('🔍 Llamando a userService.validateLogin...');
      const result = await userService.validateLogin(user.trim(), pass.trim());
      console.log('📤 Resultado del servicio valid:', result && result.valid);
      
      if (!result || !result.valid) {
        console.log('❌ Credenciales inválidas');
        return errorResponse(res, 'Credenciales inválidas', 401);
      }

      console.log('✅ Login exitoso');
      return successResponse(res, result, 'Login exitoso');
    } catch (error) {
      console.error('❌ Error in UserController.loginUser:', error);
      return errorResponse(res, 'Error al procesar la solicitud', 500);
    }
  }
}

module.exports = new UserController();
