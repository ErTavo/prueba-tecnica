const indicioService = require('../../src/services/indicioService');
const { getDbConnection } = require('../../src/utils/database');
const sql = require('mssql');

jest.mock('../../src/utils/database');
jest.mock('mssql');

describe('IndicioService', () => {
  let mockRequest;
  let mockConnection;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
      execute: jest.fn()
    };

    mockConnection = {
      request: jest.fn(() => mockRequest)
    };

    getDbConnection.mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllIndicios', () => {
    it('debería obtener todos los indicios exitosamente', async () => {
      
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 2, Descripcion: 'Cabello', ExpedienteId: 1, TecnicoId: 2 }
      ];

      mockRequest.query.mockResolvedValue({ recordset: mockIndicios });

      
      const result = await indicioService.getAllIndicios();

      
      expect(result).toEqual(mockIndicios);
      expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });

    it('debería obtener indicios filtrados por expediente', async () => {
      
      const expedienteId = 1;
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 }
      ];

      mockRequest.query.mockResolvedValue({ recordset: mockIndicios });

      
      const result = await indicioService.getAllIndicios(expedienteId);

      
      expect(result).toEqual(mockIndicios);
      expect(mockRequest.input).toHaveBeenCalledWith('expedienteId', sql.Int, expedienteId);
    });

    it('debería manejar errores de base de datos', async () => {
      
      const error = new Error('Database connection failed');
      mockRequest.query.mockRejectedValue(error);

      await expect(indicioService.getAllIndicios()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getIndicioById', () => {
    it('debería obtener un indicio por ID exitosamente', async () => {
      
      const indicioId = 1;
      const mockIndicio = { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 };

      mockRequest.query.mockResolvedValue({ recordset: [mockIndicio] });

      
      const result = await indicioService.getIndicioById(indicioId);

      
      expect(result).toEqual(mockIndicio);
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, indicioId);
    });

    it('debería retornar null si no encuentra el indicio', async () => {
      
      const indicioId = 999;
      mockRequest.query.mockResolvedValue({ recordset: [] });

      
      const result = await indicioService.getIndicioById(indicioId);

      
      expect(result).toBeNull();
    });
  });

  describe('createIndicio', () => {
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

      mockRequest.query.mockResolvedValue({ recordset: [mockCreatedIndicio] });

      
      const result = await indicioService.createIndicio(indicioData);

      
      expect(result).toEqual(mockCreatedIndicio);
      expect(mockRequest.input).toHaveBeenCalledWith('expedienteId', sql.Int, indicioData.expedienteId);
      expect(mockRequest.input).toHaveBeenCalledWith('descripcion', sql.NVarChar(sql.MAX), indicioData.descripcion);
      expect(mockRequest.input).toHaveBeenCalledWith('color', sql.NVarChar(50), indicioData.color);
      expect(mockRequest.input).toHaveBeenCalledWith('tamano', sql.NVarChar(50), indicioData.tamano);
      expect(mockRequest.input).toHaveBeenCalledWith('peso', sql.Float, indicioData.peso);
      expect(mockRequest.input).toHaveBeenCalledWith('ubicacion', sql.NVarChar(sql.MAX), indicioData.ubicacion);
      expect(mockRequest.input).toHaveBeenCalledWith('tecnicoId', sql.Int, indicioData.tecnicoId);
    });

    it('debería crear un indicio con datos mínimos', async () => {
      
      const indicioData = {
        expedienteId: 1,
        descripcion: 'Evidencia simple',
        tecnicoId: 1
      };

      const mockCreatedIndicio = {
        Id: 3,
        ExpedienteId: 1,
        Descripcion: 'Evidencia simple',
        TecnicoId: 1
      };

      mockRequest.query.mockResolvedValue({ recordset: [mockCreatedIndicio] });

      
      const result = await indicioService.createIndicio(indicioData);

      
      expect(result).toEqual(mockCreatedIndicio);
      expect(mockRequest.input).toHaveBeenCalledWith('color', sql.NVarChar(50), undefined);
      expect(mockRequest.input).toHaveBeenCalledWith('tamano', sql.NVarChar(50), undefined);
      expect(mockRequest.input).toHaveBeenCalledWith('peso', sql.Float, undefined);
      expect(mockRequest.input).toHaveBeenCalledWith('ubicacion', sql.NVarChar(sql.MAX), undefined);
    });
  });

  describe('updateIndicio', () => {
    it('debería actualizar un indicio exitosamente', async () => {
      
      const indicioId = 1;
      const updateData = { descripcion: 'Descripción actualizada' };
      const mockExistingIndicio = { Id: 1, Descripcion: 'Original', ExpedienteId: 1, TecnicoId: 1 };
      const mockUpdatedIndicio = { Id: 1, Descripcion: 'Descripción actualizada', ExpedienteId: 1, TecnicoId: 1 };

      jest.spyOn(indicioService, 'getIndicioById').mockResolvedValueOnce(mockExistingIndicio);
      mockRequest.query.mockResolvedValue({ recordset: [mockUpdatedIndicio] });

      
      const result = await indicioService.updateIndicio(indicioId, updateData);

      
      expect(result).toEqual(mockUpdatedIndicio);
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, indicioId);
    });

    it('debería retornar null si no encuentra el indicio para actualizar', async () => {
      
      const indicioId = 999;
      const updateData = { descripcion: 'Descripción actualizada' };

      jest.spyOn(indicioService, 'getIndicioById').mockResolvedValueOnce(null);

      
      const result = await indicioService.updateIndicio(indicioId, updateData);

      
      expect(result).toBeNull();
    });
  });

  describe('deleteIndicio', () => {
    it('debería eliminar un indicio exitosamente', async () => {
      
      const indicioId = 1;
      const mockIndicio = { Id: 1, Descripcion: 'Test' };

      jest.spyOn(indicioService, 'getIndicioById').mockResolvedValueOnce(mockIndicio);
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      
      const result = await indicioService.deleteIndicio(indicioId);

      
      expect(result).toBe(true);
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, indicioId);
    });

    it('debería retornar false si no encuentra el indicio para eliminar', async () => {
      
      const indicioId = 999;

      jest.spyOn(indicioService, 'getIndicioById').mockResolvedValueOnce(null);

      
      const result = await indicioService.deleteIndicio(indicioId);

      
      expect(result).toBe(false);
    });
  });

  describe('getIndiciosByExpediente', () => {
    it('debería obtener indicios por expediente exitosamente', async () => {
      
      const expedienteId = 1;
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 2, Descripcion: 'Cabello', ExpedienteId: 1, TecnicoId: 2 }
      ];

      mockRequest.query.mockResolvedValue({ recordset: mockIndicios });

      
      const result = await indicioService.getIndiciosByExpediente(expedienteId);

      
      expect(result).toEqual(mockIndicios);
      expect(mockRequest.input).toHaveBeenCalledWith('expedienteId', sql.Int, expedienteId);
    });
  });

  describe('getIndiciosByTecnico', () => {
    it('debería obtener indicios por técnico exitosamente', async () => {
      
      const tecnicoId = 1;
      const mockIndicios = [
        { Id: 1, Descripcion: 'Huella dactilar', ExpedienteId: 1, TecnicoId: 1 },
        { Id: 3, Descripcion: 'Fibra textil', ExpedienteId: 2, TecnicoId: 1 }
      ];

      mockRequest.query.mockResolvedValue({ recordset: mockIndicios });

      
      const result = await indicioService.getIndiciosByTecnico(tecnicoId);

      
      expect(result).toEqual(mockIndicios);
      expect(mockRequest.input).toHaveBeenCalledWith('tecnicoId', sql.Int, tecnicoId);
    });
  });
});
