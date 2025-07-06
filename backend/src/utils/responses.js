/**
 * Respuesta exitosa estándar
 * @param {Object} res 
 * @param {*} data
 * @param {string} message 
 * @param {number} statusCode 
 */
const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar
 * @param {Object} res 
 * @param {string} error 
 * @param {number} statusCode 
 * @param {string} details 
 */
const errorResponse = (res, error, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Respuesta de validación fallida
 * @param {Object} res 
 * @param {Array|string} errors - Errores de validación
 */
const validationErrorResponse = (res, errors) => {
  errorResponse(res, 'Validation failed', 400, errors);
};

/**
 * Respuesta de no encontrado
 * @param {Object} res 
 * @param {string} resource 
 */
const notFoundResponse = (res, resource = 'Resource') => {
  errorResponse(res, `${resource} not found`, 404);
};

/**
 * Respuesta de conflicto (duplicado)
 * @param {Object} res 
 * @param {string} message 
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  errorResponse(res, message, 409);
};

/**
 * Respuesta de no autorizado
 * @param {Object} res 
 * @param {string} message
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  errorResponse(res, message, 401);
};

/**
 * Respuesta de prohibido
 * @param {Object} res 
 * @param {string} message
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  errorResponse(res, message, 403);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  conflictResponse,
  unauthorizedResponse,
  forbiddenResponse
};
