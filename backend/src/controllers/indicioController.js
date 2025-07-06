const indicioService = require('../services/indicioService');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../config/logger');

class IndicioController {

  async getAllIndicios(req, res) {
    try {
      const { expedienteId } = req.query;
      logger.info(`Fetching all indicios${expedienteId ? ` for expediente: ${expedienteId}` : ''}`);
      const indicios = await indicioService.getAllIndicios(expedienteId);
      logger.info(`Successfully retrieved ${indicios.length} indicios`);
      return successResponse(res, indicios, 'Indicios obtenidos exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.getAllIndicios:', error);
      return errorResponse(res, 'Error al obtener indicios', 500, error.message);
    }
  }

  async getIndicioById(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Fetching indicio with id: ${id}`);
      const indicio = await indicioService.getIndicioById(id);
      
      if (!indicio) {
        logger.warn(`Indicio not found with id: ${id}`);
        return errorResponse(res, 'Indicio no encontrado', 404);
      }
      
      logger.info(`Successfully retrieved indicio with id: ${id}`);
      return successResponse(res, indicio, 'Indicio obtenido exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.getIndicioById:', error);
      return errorResponse(res, 'Error al obtener indicio', 500, error.message);
    }
  }


  async createIndicio(req, res) {
    try {
      const { expedienteId, descripcion, color, tamano, peso, ubicacion, tecnicoId } = req.body;
      logger.info(`Creating new indicio for expediente: ${expedienteId}, tecnico: ${tecnicoId}`);
      
      if (!expedienteId || !descripcion || !tecnicoId) {
        logger.warn('Missing required fields for indicio creation');
        return errorResponse(res, 'ExpedienteId, descripción y tecnicoId son requeridos', 400);
      }

      const newIndicio = await indicioService.createIndicio({
        expedienteId,
        descripcion,
        color,
        tamano,
        peso,
        ubicacion,
        tecnicoId
      });

      logger.info(`Successfully created indicio with id: ${newIndicio.Id}`);
      return successResponse(res, newIndicio, 'Indicio creado exitosamente', 201);
    } catch (error) {
      logger.error('Error in IndicioController.createIndicio:', error);
      return errorResponse(res, 'Error al crear indicio', 500, error.message);
    }
  }

  async updateIndicio(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      logger.info(`Updating indicio with id: ${id}`, { updateData });
      
      const updatedIndicio = await indicioService.updateIndicio(id, updateData);
      
      if (!updatedIndicio) {
        logger.warn(`Indicio not found for update with id: ${id}`);
        return errorResponse(res, 'Indicio no encontrado', 404);
      }
      
      logger.info(`Successfully updated indicio with id: ${id}`);
      return successResponse(res, updatedIndicio, 'Indicio actualizado exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.updateIndicio:', error);
      return errorResponse(res, 'Error al actualizar indicio', 500, error.message);
    }
  }

  async deleteIndicio(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Deleting indicio with id: ${id}`);
      
      const deleted = await indicioService.deleteIndicio(id);
      
      if (!deleted) {
        logger.warn(`Indicio not found for deletion with id: ${id}`);
        return errorResponse(res, 'Indicio no encontrado', 404);
      }
      
      logger.info(`Successfully deleted indicio with id: ${id}`);
      return successResponse(res, null, 'Indicio eliminado exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.deleteIndicio:', error);
      return errorResponse(res, 'Error al eliminar indicio', 500, error.message);
    }
  }


  async getIndiciosByExpediente(req, res) {
    try {
      const { expedienteId } = req.params;
      logger.info(`Fetching indicios for expediente: ${expedienteId}`);
      const indicios = await indicioService.getIndiciosByExpediente(expedienteId);
      
      logger.info(`Successfully retrieved ${indicios.length} indicios for expediente: ${expedienteId}`);
      return successResponse(res, indicios, 'Indicios del expediente obtenidos exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.getIndiciosByExpediente:', error);
      return errorResponse(res, 'Error al obtener indicios del expediente', 500, error.message);
    }
  }


  async getIndiciosByTecnico(req, res) {
    try {
      const { tecnicoId } = req.params;
      logger.info(`Fetching indicios for tecnico: ${tecnicoId}`);
      const indicios = await indicioService.getIndiciosByTecnico(tecnicoId);
      
      logger.info(`Successfully retrieved ${indicios.length} indicios for tecnico: ${tecnicoId}`);
      return successResponse(res, indicios, 'Indicios del técnico obtenidos exitosamente');
    } catch (error) {
      logger.error('Error in IndicioController.getIndiciosByTecnico:', error);
      return errorResponse(res, 'Error al obtener indicios del técnico', 500, error.message);
    }
  }


  async updateIndicioEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, justificacionRechazo } = req.body;
      
      logger.info(`Updating estado for indicio: ${id} to: ${estado}`);
      
      if (!['Aprobada', 'Denegada', 'Pendiente'].includes(estado)) {
        return errorResponse(res, 'Estado inválido. Debe ser: Aprobada, Denegada o Pendiente', 400);
      }
      
      if (estado === 'Denegada' && !justificacionRechazo?.trim()) {
        return errorResponse(res, 'La justificación es obligatoria para denegar una evidencia', 400);
      }
      
      const estadoData = { estado };
      if (estado === 'Denegada' && justificacionRechazo) {
        estadoData.justificacionRechazo = justificacionRechazo.trim();
      }
      
      const updatedIndicio = await indicioService.updateIndicioEstado(id, estadoData);
      
      logger.info(`Successfully updated estado for indicio: ${id}`);
      return successResponse(res, updatedIndicio, `Evidencia ${estado.toLowerCase()} exitosamente`);
    } catch (error) {
      logger.error('Error in IndicioController.updateIndicioEstado:', error);
      return errorResponse(res, 'Error al actualizar estado de la evidencia', 500, error.message);
    }
  }
}

module.exports = new IndicioController();
