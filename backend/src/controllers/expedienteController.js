const expedienteService = require('../services/expedienteService');
const { successResponse, errorResponse } = require('../utils/responses');
const logger = require('../config/logger');

class ExpedienteController {
  async getAllExpedientes(req, res) {
    try {
      logger.info('Fetching all expedientes');
      const expedientes = await expedienteService.getAllExpedientes();
      logger.info(`Successfully retrieved ${expedientes.length} expedientes`);
      return successResponse(res, expedientes, 'Expedientes obtenidos exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.getAllExpedientes:', error);
      return errorResponse(res, 'Error al obtener expedientes', 500, error.message);
    }
  }


  async getExpedienteById(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Fetching expediente with id: ${id}`);
      const expediente = await expedienteService.getExpedienteById(id);
      
      if (!expediente) {
        logger.warn(`Expediente not found with id: ${id}`);
        return errorResponse(res, 'Expediente no encontrado', 404);
      }
      
      logger.info(`Successfully retrieved expediente with id: ${id}`);
      return successResponse(res, expediente, 'Expediente obtenido exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.getExpedienteById:', error);
      return errorResponse(res, 'Error al obtener expediente', 500, error.message);
    }
  }


  async createExpediente(req, res) {
    try {
      const { codigo, tecnicoId, estado = 'Pendiente' } = req.body;
      logger.info(`Creating new expediente with codigo: ${codigo}, tecnicoId: ${tecnicoId}`);
      
      if (!codigo || !tecnicoId) {
        logger.warn('Missing required fields for expediente creation');
        return errorResponse(res, 'Código y tecnicoId son requeridos', 400);
      }

      const newExpediente = await expedienteService.createExpediente({
        codigo,
        tecnicoId,
        estado
      });

      logger.info(`Successfully created expediente with id: ${newExpediente.Id}`);
      return successResponse(res, newExpediente, 'Expediente creado exitosamente', 201);
    } catch (error) {
      logger.error('Error in ExpedienteController.createExpediente:', error);
      
      if (error.message.includes('ya existe')) {
        return errorResponse(res, error.message, 409);
      }
      
      return errorResponse(res, 'Error al crear expediente', 500, error.message);
    }
  }

  async updateExpediente(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      logger.info(`Updating expediente with id: ${id}`, { updateData });
      
      const updatedExpediente = await expedienteService.updateExpediente(id, updateData);
      
      if (!updatedExpediente) {
        logger.warn(`Expediente not found for update with id: ${id}`);
        return errorResponse(res, 'Expediente no encontrado', 404);
      }
      
      logger.info(`Successfully updated expediente with id: ${id}`);
      return successResponse(res, updatedExpediente, 'Expediente actualizado exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.updateExpediente:', error);
      return errorResponse(res, 'Error al actualizar expediente', 500, error.message);
    }
  }

  async deleteExpediente(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Deleting expediente with id: ${id}`);
      
      const deleted = await expedienteService.deleteExpediente(id);
      
      if (!deleted) {
        logger.warn(`Expediente not found for deletion with id: ${id}`);
        return errorResponse(res, 'Expediente no encontrado', 404);
      }
      
      logger.info(`Successfully deleted expediente with id: ${id}`);
      return successResponse(res, null, 'Expediente eliminado exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.deleteExpediente:', error);
      return errorResponse(res, 'Error al eliminar expediente', 500, error.message);
    }
  }

  async changeEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, justificacionRechazo } = req.body;
      logger.info(`Changing estado for expediente id: ${id} to: ${estado}`);
      
      if (!estado) {
        logger.warn('Missing estado field for estado change');
        return errorResponse(res, 'Estado es requerido', 400);
      }

      if (estado === 'Rechazado' && !justificacionRechazo) {
        logger.warn('Missing justificacionRechazo for Rechazado estado');
        return errorResponse(res, 'Justificación de rechazo es requerida', 400);
      }

      const updatedExpediente = await expedienteService.changeEstado(id, estado, justificacionRechazo);
      
      if (!updatedExpediente) {
        logger.warn(`Expediente not found for estado change with id: ${id}`);
        return errorResponse(res, 'Expediente no encontrado', 404);
      }
      
      logger.info(`Successfully changed estado for expediente id: ${id} to: ${estado}`);
      return successResponse(res, updatedExpediente, 'Estado del expediente actualizado exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.changeEstado:', error);
      return errorResponse(res, 'Error al cambiar estado del expediente', 500, error.message);
    }
  }

  async getExpedientesByTecnico(req, res) {
    try {
      const { tecnicoId } = req.params;
      logger.info(`Fetching expedientes for tecnico: ${tecnicoId}`);
      const expedientes = await expedienteService.getExpedientesByTecnico(tecnicoId);
      
      logger.info(`Successfully retrieved ${expedientes.length} expedientes for tecnico: ${tecnicoId}`);
      return successResponse(res, expedientes, 'Expedientes del técnico obtenidos exitosamente');
    } catch (error) {
      logger.error('Error in ExpedienteController.getExpedientesByTecnico:', error);
      return errorResponse(res, 'Error al obtener expedientes del técnico', 500, error.message);
    }
  }
}

module.exports = new ExpedienteController();
