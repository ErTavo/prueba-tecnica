const request = require('supertest');
const express = require('express');
const expedienteController = require('../../src/controllers/expedienteController');
const expedienteService = require('../../src/services/expedienteService');

jest.mock('../../src/services/expedienteService');

describe('ExpedienteController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    app.get('/expedientes', (req, res) => expedienteController.getAllExpedientes(req, res));
    app.get('/expedientes/:id', (req, res) => expedienteController.getExpedienteById(req, res));
    app.post('/expedientes', (req, res) => expedienteController.createExpediente(req, res));
    app.put('/expedientes/:id', (req, res) => expedienteController.updateExpediente(req, res));
    app.delete('/expedientes/:id', (req, res) => expedienteController.deleteExpediente(req, res));
    app.put('/expedientes/:id/estado', (req, res) => expedienteController.changeEstado(req, res));
    app.get('/expedientes/tecnico/:tecnicoId', (req, res) => expedienteController.getExpedientesByTecnico(req, res));
    
    jest.clearAllMocks();
  });

  describe('GET /expedientes', () => {
    it('debería retornar todos los expedientes exitosamente', async () => {
      const mockExpedientes = [
        { Id: 1, Codigo: 'EXP001', TecnicoId: 1, Estado: 'Pendiente' },
        { Id: 2, Codigo: 'EXP002', TecnicoId: 2, Estado: 'En proceso' }
      ];
      
      expedienteService.getAllExpedientes.mockResolvedValue(mockExpedientes);

      const response = await request(app).get('/expedientes');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockExpedientes);
      expect(response.body.message).toBe('Expedientes obtenidos exitosamente');
    });

    it('debería manejar errores del servicio', async () => {
      const error = new Error('Database error');
      expedienteService.getAllExpedientes.mockRejectedValue(error);

      const response = await request(app).get('/expedientes');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error al obtener expedientes');
    });
  });

  describe('GET /expedientes/:id', () => {
    it('debería retornar un expediente por ID exitosamente', async () => {
      
      const expedienteId = 1;
      const mockExpediente = { Id: 1, Codigo: 'EXP001', TecnicoId: 1, Estado: 'Pendiente' };
      
      expedienteService.getExpedienteById.mockResolvedValue(mockExpediente);

      const response = await request(app).get(`/expedientes/${expedienteId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockExpediente);
      expect(expedienteService.getExpedienteById).toHaveBeenCalledWith(expedienteId.toString());
    });

    it('debería retornar 404 si el expediente no existe', async () => {
      
      const expedienteId = 999;
      expedienteService.getExpedienteById.mockResolvedValue(null);

      const response = await request(app).get(`/expedientes/${expedienteId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Expediente no encontrado');
    });
  });

  describe('POST /expedientes', () => {
    it('debería crear un expediente exitosamente', async () => {
      
      const expedienteData = {
        codigo: 'EXP003',
        tecnicoId: 1,
        estado: 'Pendiente'
      };
      
      const mockCreatedExpediente = {
        Id: 3,
        Codigo: 'EXP003',
        TecnicoId: 1,
        Estado: 'Pendiente'
      };

      expedienteService.createExpediente.mockResolvedValue(mockCreatedExpediente);

      
      const response = await request(app)
        .post('/expedientes')
        .send(expedienteData);

      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedExpediente);
      expect(response.body.message).toBe('Expediente creado exitosamente');
    });

    it('debería fallar con datos incompletos', async () => {
      
      const incompleteData = {
        codigo: 'EXP003'
      };

      
      const response = await request(app)
        .post('/expedientes')
        .send(incompleteData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Código y tecnicoId son requeridos');
    });

    it('debería manejar error de expediente existente', async () => {
      
      const expedienteData = {
        codigo: 'EXP001',
        tecnicoId: 1
      };

      const error = new Error('Expediente ya existe');
      expedienteService.createExpediente.mockRejectedValue(error);

      
      const response = await request(app)
        .post('/expedientes')
        .send(expedienteData);

      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Expediente ya existe');
    });
  });

  describe('PUT /expedientes/:id', () => {
    it('debería actualizar un expediente exitosamente', async () => {
      
      const expedienteId = 1;
      const updateData = { Estado: 'En proceso' };
      const mockUpdatedExpediente = { Id: 1, Codigo: 'EXP001', TecnicoId: 1, Estado: 'En proceso' };
      
      expedienteService.updateExpediente.mockResolvedValue(mockUpdatedExpediente);

      
      const response = await request(app)
        .put(`/expedientes/${expedienteId}`)
        .send(updateData);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedExpediente);
      expect(response.body.message).toBe('Expediente actualizado exitosamente');
    });

    it('debería retornar 404 si el expediente no existe', async () => {
      
      const expedienteId = 999;
      const updateData = { Estado: 'En proceso' };
      
      expedienteService.updateExpediente.mockResolvedValue(null);

      
      const response = await request(app)
        .put(`/expedientes/${expedienteId}`)
        .send(updateData);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Expediente no encontrado');
    });
  });

  describe('DELETE /expedientes/:id', () => {
    it('debería eliminar un expediente exitosamente', async () => {
      
      const expedienteId = 1;
      expedienteService.deleteExpediente.mockResolvedValue(true);

      
      const response = await request(app).delete(`/expedientes/${expedienteId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Expediente eliminado exitosamente');
    });

    it('debería retornar 404 si el expediente no existe', async () => {
      
      const expedienteId = 999;
      expedienteService.deleteExpediente.mockResolvedValue(false);

      
      const response = await request(app).delete(`/expedientes/${expedienteId}`);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Expediente no encontrado');
    });
  });

  describe('PUT /expedientes/:id/estado', () => {
    it('debería cambiar el estado exitosamente', async () => {
      
      const expedienteId = 1;
      const estadoData = { estado: 'Completado' };
      const mockUpdatedExpediente = { Id: 1, Codigo: 'EXP001', TecnicoId: 1, Estado: 'Completado' };
      
      expedienteService.changeEstado.mockResolvedValue(mockUpdatedExpediente);

      
      const response = await request(app)
        .put(`/expedientes/${expedienteId}/estado`)
        .send(estadoData);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedExpediente);
      expect(response.body.message).toBe('Estado del expediente actualizado exitosamente');
    });

    it('debería requerir justificación para estado Rechazado', async () => {
      
      const expedienteId = 1;
      const estadoData = { estado: 'Rechazado' };

      
      const response = await request(app)
        .put(`/expedientes/${expedienteId}/estado`)
        .send(estadoData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Justificación de rechazo es requerida');
    });

    it('debería fallar sin estado', async () => {
      
      const expedienteId = 1;
      const estadoData = {};

      
      const response = await request(app)
        .put(`/expedientes/${expedienteId}/estado`)
        .send(estadoData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Estado es requerido');
    });
  });

  describe('GET /expedientes/tecnico/:tecnicoId', () => {
    it('debería retornar expedientes del técnico exitosamente', async () => {
      
      const tecnicoId = 1;
      const mockExpedientes = [
        { Id: 1, Codigo: 'EXP001', TecnicoId: 1, Estado: 'Pendiente' },
        { Id: 3, Codigo: 'EXP003', TecnicoId: 1, Estado: 'En proceso' }
      ];
      
      expedienteService.getExpedientesByTecnico.mockResolvedValue(mockExpedientes);

      
      const response = await request(app).get(`/expedientes/tecnico/${tecnicoId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockExpedientes);
      expect(response.body.message).toBe('Expedientes del técnico obtenidos exitosamente');
    });
  });
});
