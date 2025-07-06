const Joi = require('joi');

const expedienteCreateSchema = Joi.object({
  codigo: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'El código es requerido',
      'string.min': 'El código debe tener al menos 3 caracteres',
      'string.max': 'El código no puede tener más de 50 caracteres',
      'any.required': 'El código es requerido'
    }),
  
  tecnicoId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del técnico debe ser un número',
      'number.integer': 'El ID del técnico debe ser un número entero',
      'number.positive': 'El ID del técnico debe ser un número positivo',
      'any.required': 'El ID del técnico es requerido'
    }),
  
  estado: Joi.string()
    .valid('Pendiente', 'EnProceso', 'Completado', 'Rechazado')
    .default('Pendiente')
    .messages({
      'any.only': 'El estado debe ser: Pendiente, EnProceso, Completado o Rechazado'
    })
});

const expedienteUpdateSchema = Joi.object({
  codigo: Joi.string()
    .min(3)
    .max(50)
    .optional(),
  
  tecnicoId: Joi.number()
    .integer()
    .positive()
    .optional(),
  
  estado: Joi.string()
    .valid('Pendiente', 'EnProceso', 'Completado', 'Rechazado')
    .optional(),
    
  justificacionRechazo: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.min': 'La justificación debe tener al menos 10 caracteres',
      'string.max': 'La justificación no puede tener más de 500 caracteres'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

const expedienteChangeEstadoSchema = Joi.object({
  estado: Joi.string()
    .valid('Pendiente', 'EnProceso', 'Completado', 'Rechazado')
    .required()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, EnProceso, Completado o Rechazado',
      'any.required': 'El estado es requerido'
    }),
    
  justificacionRechazo: Joi.string().allow('', null).when('estado', {
    is: 'Rechazado',
    then: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La justificación debe tener al menos 10 caracteres',
      'string.max': 'La justificación no puede tener más de 500 caracteres',
      'any.required': 'La justificación de rechazo es requerida cuando el estado es Rechazado'
    }),
    otherwise: Joi.string().allow('', null).optional()
  })
});

const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID debe ser un número',
      'number.integer': 'El ID debe ser un número entero',
      'number.positive': 'El ID debe ser un número positivo',
      'any.required': 'El ID es requerido'
    })
});

const tecnicoIdParamSchema = Joi.object({
  tecnicoId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del técnico debe ser un número',
      'number.integer': 'El ID del técnico debe ser un número entero',
      'number.positive': 'El ID del técnico debe ser un número positivo',
      'any.required': 'El ID del técnico es requerido'
    })
});

module.exports = {
  create: expedienteCreateSchema,
  update: expedienteUpdateSchema,
  changeEstado: expedienteChangeEstadoSchema,
  idParam: idParamSchema,
  tecnicoIdParam: tecnicoIdParamSchema
};
