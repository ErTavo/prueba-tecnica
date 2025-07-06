const { successResponse, errorResponse } = require('../../src/utils/responses');

describe('Response Utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('successResponse', () => {
    it('debería generar una respuesta de éxito con código 200 por defecto', () => {
      
      const data = { id: 1, name: 'Test' };
      const message = 'Operación exitosa';

      
      successResponse(mockRes, data, message);

      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operación exitosa',
        data: { id: 1, name: 'Test' }
      });
    });

    it('debería generar una respuesta de éxito con código personalizado', () => {
      
      const data = { id: 1 };
      const message = 'Creado exitosamente';
      const statusCode = 201;

      
      successResponse(mockRes, data, message, statusCode);

      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Creado exitosamente',
        data: { id: 1 }
      });
    });

    it('debería manejar datos null', () => {
      
      const data = null;
      const message = 'Eliminado exitosamente';

      
      successResponse(mockRes, data, message);

      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Eliminado exitosamente',
        data: null
      });
    });

    it('debería omitir el mensaje si no se proporciona', () => {
      
      const data = { id: 1 };

      
      successResponse(mockRes, data);

      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 }
      });
    });
  });

  describe('errorResponse', () => {
    it('debería generar una respuesta de error con código 500 por defecto', () => {
      
      const error = 'Error interno';

      
      errorResponse(mockRes, error);

      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno'
      });
    });

    it('debería generar una respuesta de error con código personalizado', () => {
      
      const error = 'No encontrado';
      const statusCode = 404;

      
      errorResponse(mockRes, error, statusCode);

      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'No encontrado'
      });
    });

    it('debería incluir detalles del error en development', () => {
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = 'Error de validación';
      const statusCode = 400;
      const details = 'Campo requerido faltante';

      
      errorResponse(mockRes, error, statusCode, details);

      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error de validación',
        details: 'Campo requerido faltante'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('debería omitir detalles del error en production', () => {
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = 'Error de validación';
      const statusCode = 400;
      const details = 'Campo requerido faltante';

      
      errorResponse(mockRes, error, statusCode, details);

      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error de validación'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
