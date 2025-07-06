const request = require('supertest');
const express = require('express');
const userController = require('../../src/controllers/userController');
const userService = require('../../src/services/userService');


jest.mock('../../src/services/userService');

const app = express();
app.use(express.json());


app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users', userController.createUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
app.post('/users/login', userController.loginUser);

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('debería retornar todos los usuarios exitosamente', async () => {
      
      const mockUsers = [
        { Id: 1, Nombre: 'Juan Pérez', Usuario: 'jperez', Rol: 'Tecnico' },
        { Id: 2, Nombre: 'María García', Usuario: 'mgarcia', Rol: 'Admin' }
      ];
      userService.getAllUsers.mockResolvedValue(mockUsers);

      
      const response = await request(app).get('/users');

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(response.body.message).toBe('Usuarios obtenidos exitosamente');
    });

    it('debería retornar lista vacía cuando no hay usuarios', async () => {
      
      userService.getAllUsers.mockResolvedValue([]);

      
      const response = await request(app).get('/users');

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.message).toBe('No se encontraron usuarios');
    });

    it('debería manejar errores del servicio', async () => {
      
      userService.getAllUsers.mockRejectedValue(new Error('Database error'));

      
      const response = await request(app).get('/users');

      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error al procesar la solicitud');
    });
  });

  describe('GET /users/:id', () => {
    it('debería retornar un usuario por ID exitosamente', async () => {
      
      const userId = 1;
      const mockUser = { Id: 1, Nombre: 'Juan Pérez', Usuario: 'jperez', Rol: 'Tecnico' };
      userService.getUserById.mockResolvedValue(mockUser);

      
      const response = await request(app).get(`/users/${userId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId.toString());
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      
      const userId = 999;
      userService.getUserById.mockResolvedValue(null);

      
      const response = await request(app).get(`/users/${userId}`);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario no encontrado');
    });

    it('debería retornar 400 para ID inválido', async () => {
      
      const response = await request(app).get('/users/abc');

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ID de usuario inválido');
    });
  });

  describe('POST /users', () => {
    it('debería crear un usuario exitosamente', async () => {
      
      const userData = {
        nombre: 'Nuevo Usuario',
        usuario: 'nusuario',
        contrasenia: 'password123',
        rol: 'admin'
      };
      
      const mockCreatedUser = {
        Id: 3,
        Nombre: 'Nuevo Usuario',
        Usuario: 'nusuario',
        Rol: 'admin'
      };

      userService.createUser.mockResolvedValue(mockCreatedUser);

      
      const response = await request(app)
        .post('/users')
        .send(userData);

      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedUser);
      expect(response.body.message).toBe('Usuario creado exitosamente');
    });

    it('debería fallar con datos incompletos', async () => {
      
      const incompleteData = {
        nombre: 'Usuario Test'
      };

      
      const response = await request(app)
        .post('/users')
        .send(incompleteData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
    });

    it('debería fallar con contraseña muy corta', async () => {
      
      const userData = {
        nombre: 'Usuario Test',
        usuario: 'utest',
        contrasenia: '123', 
        rol: 'admin'
      };

      
      const response = await request(app)
        .post('/users')
        .send(userData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('La contraseña debe tener al menos 6 caracteres');
    });
  });
});
