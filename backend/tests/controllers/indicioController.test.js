const request = require('supertest');
const express = require('express');
const indicioController = require('../../src/controllers/indicioController');
const indicioService = require('../../src/services/indicioService');


jest.mock('../../src/services/indicioService');

describe('IndicioController', () => {
  let app;

  beforeEach(() => {

    app = express();
    app.use(express.json());
    
    
    app.get('/indicios', (req, res) => indicioController.getAllIndicios(req, res));
    app.get('/indicios/:id', (req, res) => indicioController.getIndicioById(req, res));
    app.post('/indicios', (req, res) => indicioController.createIndicio(req, res));
    app.put('/indicios/:id', (req, res) => indicioController.updateIndicio(req, res));
    app.delete('/indicios/:id', (req, res) => indicioController.deleteIndicio(req, res));
    app.get('/indicios/expediente/:expedienteId', (req, res) => indicioController.getIndiciosByExpediente(req, res));
    app.get('/indicios/tecnico/:tecnicoId', (req, res) => indicioController.getIndiciosByTecnico(req, res));
    
    jest.clearAllMocks();
  });

  describe('GET /indicios', () => {
    it('debería retornar todos los indicios exitosamente', async () => {
      
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 2, Descripcion: 'Cabello', ExpedienteId: 1, TecnicoId: 2 }
      ];
      
      indicioService.getAllIndicios.mockResolvedValue(mockIndicios);

      
      const response = await request(app).get('/indicios');

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIndicios);
      expect(response.body.message).toBe('Indicios obtenidos exitosamente');
    });

    it('debería manejar errores del servicio', async () => {
      
      const error = new Error('Database error');
      indicioService.getAllIndicios.mockRejectedValue(error);

      
      const response = await request(app).get('/indicios');

      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error al obtener indicios');
    });
  });

  describe('GET /indicios/:id', () => {
    it('debería retornar un indicio por ID exitosamente', async () => {
      
      const indicioId = 1;
      const mockIndicio = { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 };
      
      indicioService.getIndicioById.mockResolvedValue(mockIndicio);

      
      const response = await request(app).get(`/indicios/${indicioId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIndicio);
      expect(indicioService.getIndicioById).toHaveBeenCalledWith(indicioId.toString());
    });

    it('debería retornar 404 si el indicio no existe', async () => {
      
      const indicioId = 999;
      indicioService.getIndicioById.mockResolvedValue(null);

      
      const response = await request(app).get(`/indicios/${indicioId}`);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Indicio no encontrado');
    });
  });

  describe('POST /indicios', () => {
    it('debería crear un indicio exitosamente', async () => {
      
      const indicioData = {
        expedienteId: 1,
        descripcion: 'Nueva evidencia',
        color: 'Negro',
        tamano: 'Pequeño',
        peso: 15.5,
        ubicacion: 'Mesa',
        tecnicoId: 1
      };
      
      const mockCreatedIndicio = {
        Id: 3,
        ExpedienteId: 1,
        Descripcion: 'Nueva evidencia',
        Color: 'Negro',
        Tamano: 'Pequeño',
        Peso: 15.5,
        Ubicacion: 'Mesa',
        TecnicoId: 1
      };

      indicioService.createIndicio.mockResolvedValue(mockCreatedIndicio);

      
      const response = await request(app)
        .post('/indicios')
        .send(indicioData);

      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedIndicio);
      expect(response.body.message).toBe('Indicio creado exitosamente');
    });

    it('debería fallar con datos incompletos - sin expedienteId', async () => {
      
      const incompleteData = {
        descripcion: 'Nueva evidencia',
        tecnicoId: 1
      };

      
      const response = await request(app)
        .post('/indicios')
        .send(incompleteData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ExpedienteId, descripción y tecnicoId son requeridos');
    });

    it('debería fallar con datos incompletos - sin descripción', async () => {
      
      const incompleteData = {
        expedienteId: 1,
        tecnicoId: 1
      };

      
      const response = await request(app)
        .post('/indicios')
        .send(incompleteData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ExpedienteId, descripción y tecnicoId son requeridos');
    });

    it('debería fallar con datos incompletos - sin tecnicoId', async () => {
      
      const incompleteData = {
        expedienteId: 1,
        descripcion: 'Nueva evidencia'
      };

      
      const response = await request(app)
        .post('/indicios')
        .send(incompleteData);

      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ExpedienteId, descripción y tecnicoId son requeridos');
    });
  });

  describe('PUT /indicios/:id', () => {
    it('debería actualizar un indicio exitosamente', async () => {
      
      const indicioId = 1;
      const updateData = { Descripcion: 'Descripción actualizada' };
      const mockUpdatedIndicio = { Id: 1, Descripcion: 'Descripción actualizada', ExpedienteId: 1, TecnicoId: 1 };
      
      indicioService.updateIndicio.mockResolvedValue(mockUpdatedIndicio);

      
      const response = await request(app)
        .put(`/indicios/${indicioId}`)
        .send(updateData);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedIndicio);
      expect(response.body.message).toBe('Indicio actualizado exitosamente');
    });

    it('debería retornar 404 si el indicio no existe', async () => {
      
      const indicioId = 999;
      const updateData = { Descripcion: 'Descripción actualizada' };
      
      indicioService.updateIndicio.mockResolvedValue(null);

      
      const response = await request(app)
        .put(`/indicios/${indicioId}`)
        .send(updateData);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Indicio no encontrado');
    });
  });

  describe('DELETE /indicios/:id', () => {
    it('debería eliminar un indicio exitosamente', async () => {
      
      const indicioId = 1;
      indicioService.deleteIndicio.mockResolvedValue(true);

      
      const response = await request(app).delete(`/indicios/${indicioId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Indicio eliminado exitosamente');
    });

    it('debería retornar 404 si el indicio no existe', async () => {
      
      const indicioId = 999;
      indicioService.deleteIndicio.mockResolvedValue(false);

      
      const response = await request(app).delete(`/indicios/${indicioId}`);

      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Indicio no encontrado');
    });
  });

  describe('GET /indicios/expediente/:expedienteId', () => {
    it('debería retornar indicios del expediente exitosamente', async () => {
      
      const expedienteId = 1;
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 2, Descripcion: 'Cabello', ExpedienteId: 1, TecnicoId: 2 }
      ];
      
      indicioService.getIndiciosByExpediente.mockResolvedValue(mockIndicios);

      
      const response = await request(app).get(`/indicios/expediente/${expedienteId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIndicios);
      expect(response.body.message).toBe('Indicios del expediente obtenidos exitosamente');
    });
  });

  describe('GET /indicios/tecnico/:tecnicoId', () => {
    it('debería retornar indicios del técnico exitosamente', async () => {
      
      const tecnicoId = 1;
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 3, Descripcion: 'Fibra textil', ExpedienteId: 2, TecnicoId: 1 }
      ];
      
      indicioService.getIndiciosByTecnico.mockResolvedValue(mockIndicios);

      
      const response = await request(app).get(`/indicios/tecnico/${tecnicoId}`);

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockIndicios);
      expect(response.body.message).toBe('Indicios del técnico obtenidos exitosamente');
    });
  });
});
