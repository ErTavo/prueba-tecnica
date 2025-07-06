const { getDbConnection } = require('../utils/database');
const sql = require('mssql');
const logger = require('../config/logger');

class ExpedienteService {

  async getAllExpedientes() {
    try {
      const pool = await getDbConnection();
      const result = await pool.request().query(`
        SELECT 
          e.Id, 
          e.Codigo, 
          e.FechaRegistro, 
          e.Estado, 
          e.JustificacionRechazo,
          e.TecnicoId,
          u.Nombre AS TecnicoNombre
        FROM Expedientes e
        LEFT JOIN Usuarios u ON e.TecnicoId = u.Id
        ORDER BY e.FechaRegistro DESC
      `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error in ExpedienteService.getAllExpedientes:', error);
      throw error;
    }
  }

  async getExpedienteById(id) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            e.Id, 
            e.Codigo, 
            e.FechaRegistro, 
            e.Estado, 
            e.JustificacionRechazo,
            e.TecnicoId,
            u.Nombre AS TecnicoNombre
          FROM Expedientes e
          LEFT JOIN Usuarios u ON e.TecnicoId = u.Id
          WHERE e.Id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }

      const expediente = result.recordset[0];
      
      return expediente;
    } catch (error) {
      logger.error('Error in ExpedienteService.getExpedienteById:', error);
      throw error;
    }
  }

  async createExpediente(expedienteData) {
    try {
      const { codigo, tecnicoId, estado } = expedienteData;
      
      const existingExpediente = await this.getExpedienteByCodigo(codigo);
      if (existingExpediente) {
        throw new Error('El código de expediente ya existe');
      }

      const pool = await getDbConnection();
      const result = await pool.request()
        .input('codigo', sql.NVarChar(50), codigo)
        .input('fechaRegistro', sql.DateTime, new Date())
        .input('tecnicoId', sql.Int, tecnicoId)
        .input('estado', sql.NVarChar(20), estado)
        .query(`
          INSERT INTO Expedientes (Codigo, FechaRegistro, TecnicoId, Estado)
          OUTPUT INSERTED.*
          VALUES (@codigo, @fechaRegistro, @tecnicoId, @estado)
        `);
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error in ExpedienteService.createExpediente:', error);
      throw error;
    }
  }

  async getExpedienteByCodigo(codigo) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('codigo', sql.NVarChar(50), codigo)
        .query(`
          SELECT * FROM Expedientes WHERE Codigo = @codigo
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error in ExpedienteService.getExpedienteByCodigo:', error);
      throw error;
    }
  }

  async updateExpediente(id, updateData) {
    try {
      const existingExpediente = await this.getExpedienteById(id);
      if (!existingExpediente) {
        return null;
      }

      const pool = await getDbConnection();
      
      const updateFields = [];
      const request = pool.request().input('id', sql.Int, id);
      
      if (updateData.codigo) {
        updateFields.push('Codigo = @codigo');
        request.input('codigo', sql.NVarChar(50), updateData.codigo);
      }
      
      if (updateData.tecnicoId) {
        updateFields.push('TecnicoId = @tecnicoId');
        request.input('tecnicoId', sql.Int, updateData.tecnicoId);
      }
      
      if (updateData.estado) {
        updateFields.push('Estado = @estado');
        request.input('estado', sql.NVarChar(20), updateData.estado);
      }
      
      if (updateData.justificacionRechazo !== undefined) {
        updateFields.push('JustificacionRechazo = @justificacionRechazo');
        request.input('justificacionRechazo', sql.NVarChar(sql.MAX), updateData.justificacionRechazo);
      }

      if (updateFields.length === 0) {
        return existingExpediente;
      }

      const result = await request.query(`
        UPDATE Expedientes 
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
      
      const updatedExpediente = result.recordset[0];
      
      return updatedExpediente;
    } catch (error) {
      logger.error('Error in ExpedienteService.updateExpediente:', error);
      throw error;
    }
  }

  async deleteExpediente(id) {
    try {
      const existingExpediente = await this.getExpedienteById(id);
      if (!existingExpediente) {
        return false;
      }

      const pool = await getDbConnection();
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Expedientes WHERE Id = @id');
      
      return true;
    } catch (error) {
      logger.error('Error in ExpedienteService.deleteExpediente:', error);
      throw error;
    }
  }

  async changeEstado(id, estado, justificacionRechazo = null) {
    try {
      const updateData = { estado };
      
      if (justificacionRechazo) {
        updateData.justificacionRechazo = justificacionRechazo;
      }
      
      return await this.updateExpediente(id, updateData);
    } catch (error) {
      logger.error('Error in ExpedienteService.changeEstado:', error);
      throw error;
    }
  }

  async getExpedientesByTecnico(tecnicoId) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('tecnicoId', sql.Int, tecnicoId)
        .query(`
          SELECT 
            e.Id, 
            e.Codigo, 
            e.FechaRegistro, 
            e.Estado, 
            e.JustificacionRechazo,
            e.TecnicoId,
            u.Nombre AS TecnicoNombre
          FROM Expedientes e
          LEFT JOIN Usuarios u ON e.TecnicoId = u.Id
          WHERE e.TecnicoId = @tecnicoId
          ORDER BY e.FechaRegistro DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error in ExpedienteService.getExpedientesByTecnico:', error);
      throw error;
    }
  }

  async getEstadisticas() {
    try {
      const pool = await getDbConnection();
      const result = await pool.request().query(`
        SELECT 
          Estado,
          COUNT(*) as Cantidad
        FROM Expedientes
        GROUP BY Estado
      `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error in ExpedienteService.getEstadisticas:', error);
      throw error;
    }
  }
}

module.exports = new ExpedienteService();
