const request = require('supertest');
const express = require('express');

jest.mock('../src/services/userService', () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  validateLogin: jest.fn()
}));

const userService = require('../src/services/userService');
const userRoutes = require('../src/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/usuarios', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/usuarios', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { Id: 1, Nombre: 'Juan Pérez', Usuario: 'jperez', Rol: 'Tecnico' },
        { Id: 2, Nombre: 'María García', Usuario: 'mgarcia', Rol: 'Supervisor' }
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/usuarios')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty users list', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/usuarios')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      userService.getAllUsers.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/usuarios')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    it('should return user by id successfully', async () => {
      const mockUser = { Id: 1, Nombre: 'Juan Pérez', Usuario: 'jperez', Rol: 'Tecnico' };
      userService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/usuarios/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/usuarios/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/usuarios', () => {
    it('should create user successfully', async () => {
      const newUser = {
        Nombre: 'Pedro López',
        Usuario: 'plopez',
        Contraseña: 'password123',
        Rol: 'Tecnico'
      };

      const createdUser = { Id: 3, ...newUser };
      userService.createUser.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/usuarios')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdUser);
    });

    it('should handle duplicate user error', async () => {
      const newUser = {
        Nombre: 'Pedro López',
        Usuario: 'existing_user',
        Contraseña: 'password123',
        Rol: 'Tecnico'
      };

      userService.createUser.mockRejectedValue(new Error('DUPLICATE_USER'));

      const response = await request(app)
        .post('/api/usuarios')
        .send(newUser)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/usuarios/login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        usuario: 'jperez',
        contraseña: 'password123'
      };

      const mockUser = { Id: 1, Nombre: 'Juan Pérez', Usuario: 'jperez', Rol: 'Tecnico' };
      const mockResult = { isValid: true, user: mockUser };
      userService.validateLogin.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/usuarios/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        usuario: 'jperez',
        contraseña: 'wrongpassword'
      };

      const mockResult = { isValid: false };
      userService.validateLogin.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/usuarios/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        Nombre: 'Juan Pérez Updated',
        Rol: 'Supervisor'
      };

      const updatedUser = { Id: 1, Usuario: 'jperez', ...updateData };
      userService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/usuarios/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedUser);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('should delete user successfully', async () => {
      userService.deleteUser.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/usuarios/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should handle user not found during deletion', async () => {
      userService.deleteUser.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/usuarios/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
