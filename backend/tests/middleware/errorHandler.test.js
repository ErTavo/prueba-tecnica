const { errorHandler, notFound } = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('errorHandler', () => {
    it('debería manejar errores genéricos', () => {
      
      const error = new Error('Generic error');

      
      errorHandler(error, req, res, next);

      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor'
      });
    });

    it('debería manejar errores de SQL Server - Unique constraint', () => {
      
      const error = new Error('Unique constraint violation');
      error.number = 2627;

      
      errorHandler(error, req, res, next);

      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Ya existe un registro con esos datos'
      });
    });

    it('debería manejar errores de validación', () => {
      
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      
      errorHandler(error, req, res, next);

      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error de validación'
      });
    });

    it('debería manejar errores de autorización', () => {
      
      const error = new Error('Unauthorized');
      error.name = 'UnauthorizedError';

      
      errorHandler(error, req, res, next);

      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No autorizado'
      });
    });

    it('debería usar mensaje de desarrollo cuando NODE_ENV es development', () => {
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error message');

      
      errorHandler(error, req, res, next);

      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor',
        details: 'Dev error message'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFound', () => {
    it('debería retornar error 404 para rutas no encontradas', () => {
      
      notFound(req, res, next);

      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Ruta no encontrada: /test'
      });
    });

    it('debería incluir la URL original en el mensaje', () => {
      
      req.originalUrl = '/api/nonexistent';

      
      notFound(req, res, next);

      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Ruta no encontrada: /api/nonexistent'
      });
    });
  });
});
