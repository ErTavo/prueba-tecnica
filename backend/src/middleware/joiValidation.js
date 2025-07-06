const log = require('../config/logger');
const { errorResponse } = require('../utils/responses');

/**
 * @param {Object} schema
 * @param {string} source 
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      log.warn('Validation error:', {
        source,
        errors: errorMessages,
        data
      });
      
      return errorResponse(res, errorMessages.join(', '), 400);
    }

    req[source] = value;
    next();
  };
};


const validators = {
  validateUser: (schema) => validate(schema, 'body'),
  validateUserId: (schema) => validate(schema, 'params'),
  validateUserQuery: (schema) => validate(schema, 'query'),
  validateExpediente: (schema) => validate(schema, 'body'),
  validateExpedienteId: (schema) => validate(schema, 'params'),
  validateExpedienteQuery: (schema) => validate(schema, 'query'),
  validateIndicio: (schema) => validate(schema, 'body'),
  validateIndicioId: (schema) => validate(schema, 'params'),
  validateIndicioQuery: (schema) => validate(schema, 'query')
};

module.exports = {
  validate,
  validateRequest: validate,
  ...validators
};
