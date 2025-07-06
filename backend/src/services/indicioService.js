const { getDbConnection } = require('../utils/database');
const sql = require('mssql');
const logger = require('../config/logger');

class IndicioService {

  async getAllIndicios(expedienteId = null) {
    try {
      const pool = await getDbConnection();
      let query = `
        SELECT 
          i.Id, 
          i.ExpedienteId,
          i.Descripcion, 
          i.Color, 
          i.Tamano, 
          i.Peso, 
          i.Ubicacion, 
          i.TecnicoId,
          i.FechaRegistro,
          i.Estado,
          i.JustificacionRechazo,
          e.Codigo AS ExpedienteCodigo,
          u.Nombre AS TecnicoNombre
        FROM Indicios i
        LEFT JOIN Expedientes e ON i.ExpedienteId = e.Id
        LEFT JOIN Usuarios u ON i.TecnicoId = u.Id
      `;
      
      const request = pool.request();
      
      if (expedienteId) {
        query += ` WHERE i.ExpedienteId = @expedienteId`;
        request.input('expedienteId', sql.Int, expedienteId);
      }
      
      query += ` ORDER BY i.FechaRegistro DESC`;
      
      const result = await request.query(query);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error in IndicioService.getAllIndicios:', error);
      throw error;
    }
  }

  async getIndicioById(id) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            i.Id, 
            i.ExpedienteId,
            i.Descripcion, 
            i.Color, 
            i.Tamano, 
            i.Peso, 
            i.Ubicacion, 
            i.TecnicoId,
            i.FechaRegistro,
            i.Estado,
            i.JustificacionRechazo,
            e.Codigo AS ExpedienteCodigo,
            u.Nombre AS TecnicoNombre
          FROM Indicios i
          LEFT JOIN Expedientes e ON i.ExpedienteId = e.Id
          LEFT JOIN Usuarios u ON i.TecnicoId = u.Id
          WHERE i.Id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }

      const indicio = result.recordset[0];
      
      return indicio;
    } catch (error) {
      logger.error('Error in IndicioService.getIndicioById:', error);
      throw error;
    }
  }

  async createIndicio(indicioData) {
    try {
      const { expedienteId, descripcion, color, tamano, peso, ubicacion, tecnicoId } = indicioData;

      const pool = await getDbConnection();
      const result = await pool.request()
        .input('expedienteId', sql.Int, expedienteId)
        .input('descripcion', sql.NVarChar(sql.MAX), descripcion)
        .input('color', sql.NVarChar(50), color)
        .input('tamano', sql.NVarChar(50), tamano)
        .input('peso', sql.Float, peso)
        .input('ubicacion', sql.NVarChar(sql.MAX), ubicacion)
        .input('tecnicoId', sql.Int, tecnicoId)
        .input('fechaRegistro', sql.DateTime, new Date())
        .query(`
          INSERT INTO Indicios (ExpedienteId, Descripcion, Color, Tamano, Peso, Ubicacion, TecnicoId, FechaRegistro)
          OUTPUT INSERTED.*
          VALUES (@expedienteId, @descripcion, @color, @tamano, @peso, @ubicacion, @tecnicoId, @fechaRegistro)
        `);
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error in IndicioService.createIndicio:', error);
      throw error;
    }
  }

  async updateIndicio(id, updateData) {
    try {
      const existingIndicio = await this.getIndicioById(id);
      if (!existingIndicio) {
        return null;
      }

      const pool = await getDbConnection();
      
      const updateFields = [];
      const request = pool.request().input('id', sql.Int, id);
      
      if (updateData.expedienteId) {
        updateFields.push('ExpedienteId = @expedienteId');
        request.input('expedienteId', sql.Int, updateData.expedienteId);
      }
      
      if (updateData.descripcion !== undefined) {
        updateFields.push('Descripcion = @descripcion');
        request.input('descripcion', sql.NVarChar(sql.MAX), updateData.descripcion);
      }
      
      if (updateData.color !== undefined) {
        updateFields.push('Color = @color');
        request.input('color', sql.NVarChar(50), updateData.color);
      }
      
      if (updateData.tamano !== undefined) {
        updateFields.push('Tamano = @tamano');
        request.input('tamano', sql.NVarChar(50), updateData.tamano);
      }
      
      if (updateData.peso !== undefined) {
        updateFields.push('Peso = @peso');
        request.input('peso', sql.Float, updateData.peso);
      }
      
      if (updateData.ubicacion !== undefined) {
        updateFields.push('Ubicacion = @ubicacion');
        request.input('ubicacion', sql.NVarChar(sql.MAX), updateData.ubicacion);
      }
      
      if (updateData.tecnicoId) {
        updateFields.push('TecnicoId = @tecnicoId');
        request.input('tecnicoId', sql.Int, updateData.tecnicoId);
      }

      if (updateData.estado !== undefined) {
        updateFields.push('Estado = @estado');
        request.input('estado', sql.NVarChar(50), updateData.estado);
      }
      
      if (updateData.justificacionRechazo !== undefined) {
        updateFields.push('JustificacionRechazo = @justificacionRechazo');
        request.input('justificacionRechazo', sql.NVarChar(sql.MAX), updateData.justificacionRechazo);
      }

      if (updateFields.length === 0) {
        return existingIndicio;
      }

      const result = await request.query(`
        UPDATE Indicios 
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
      
      const updatedIndicio = result.recordset[0];
      
      return updatedIndicio;
    } catch (error) {
      logger.error('Error in IndicioService.updateIndicio:', error);
      throw error;
    }
  }

  async deleteIndicio(id) {
    try {
      const existingIndicio = await this.getIndicioById(id);
      if (!existingIndicio) {
        return false;
      }

      const pool = await getDbConnection();
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Indicios WHERE Id = @id');
      
      return true;
    } catch (error) {
      logger.error('Error in IndicioService.deleteIndicio:', error);
      throw error;
    }
  }

  async getIndiciosByExpediente(expedienteId) {
    try {
      return await this.getAllIndicios(expedienteId);
    } catch (error) {
      logger.error('Error in IndicioService.getIndiciosByExpediente:', error);
      throw error;
    }
  }

  async getIndiciosByTecnico(tecnicoId) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('tecnicoId', sql.Int, tecnicoId)
        .query(`
          SELECT 
            i.Id, 
            i.ExpedienteId,
            i.Descripcion, 
            i.Color, 
            i.Tamano, 
            i.Peso, 
            i.Ubicacion, 
            i.TecnicoId,
            i.FechaRegistro,
            i.Estado,
            i.JustificacionRechazo,
            e.Codigo AS ExpedienteCodigo,
            u.Nombre AS TecnicoNombre
          FROM Indicios i
          LEFT JOIN Expedientes e ON i.ExpedienteId = e.Id
          LEFT JOIN Usuarios u ON i.TecnicoId = u.Id
          WHERE i.TecnicoId = @tecnicoId
          ORDER BY i.FechaRegistro DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error in IndicioService.getIndiciosByTecnico:', error);
      throw error;
    }
  }

  async updateIndicioEstado(id, estadoData) {
    try {
      const existingIndicio = await this.getIndicioById(id);
      if (!existingIndicio) {
        throw new Error('Evidencia no encontrada');
      }

      const pool = await getDbConnection();
      const request = pool.request().input('id', sql.Int, id);
      
      let query = `UPDATE Indicios SET Estado = @estado`;
      request.input('estado', sql.NVarChar(50), estadoData.estado);
      
      if (estadoData.estado === 'Denegada' && estadoData.justificacionRechazo) {
        query += `, JustificacionRechazo = @justificacionRechazo`;
        request.input('justificacionRechazo', sql.NVarChar(sql.MAX), estadoData.justificacionRechazo);
      }
      
      if (estadoData.estado === 'Aprobada') {
        query += `, JustificacionRechazo = NULL`;
      }
      
      query += ` OUTPUT INSERTED.* WHERE Id = @id`;
      
      const result = await request.query(query);
      
      if (result.recordset.length === 0) {
        throw new Error('No se pudo actualizar el estado de la evidencia');
      }
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error in IndicioService.updateIndicioEstado:', error);
      throw error;
    }
  }
}

module.exports = new IndicioService();
