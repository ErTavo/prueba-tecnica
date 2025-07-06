const Joi = require('joi');

const indicioCreateSchema = Joi.object({
  expedienteId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del expediente debe ser un número',
      'number.integer': 'El ID del expediente debe ser un número entero',
      'number.positive': 'El ID del expediente debe ser un número positivo',
      'any.required': 'El ID del expediente es requerido'
    }),
  
  descripcion: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La descripción es requerida',
      'string.min': 'La descripción debe tener al menos 5 caracteres',
      'string.max': 'La descripción no puede tener más de 500 caracteres',
      'any.required': 'La descripción es requerida'
    }),
  
  color: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'El color debe tener al menos 2 caracteres',
      'string.max': 'El color no puede tener más de 50 caracteres'
    }),
  
  tamano: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El tamano debe tener al menos 2 caracteres',
      'string.max': 'El tamano no puede tener más de 100 caracteres'
    }),
  
  peso: Joi.number()
    .positive()
    .precision(3)
    .optional()
    .messages({
      'number.base': 'El peso debe ser un número',
      'number.positive': 'El peso debe ser un número positivo'
    }),
  
  ubicacion: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'La ubicación no puede tener más de 200 caracteres'
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
    })
});

const indicioUpdateSchema = Joi.object({
  descripcion: Joi.string()
    .min(5)
    .max(500)
    .optional(),
  
  color: Joi.string()
    .min(2)
    .max(50)
    .optional(),
  
  tamano: Joi.string()
    .min(2)
    .max(100)
    .optional(),
  
  peso: Joi.number()
    .positive()
    .precision(3)
    .optional(),
  
  ubicacion: Joi.string()
    .max(200)
    .optional()
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
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

const expedienteIdParamSchema = Joi.object({
  expedienteId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del expediente debe ser un número',
      'number.integer': 'El ID del expediente debe ser un número entero',
      'number.positive': 'El ID del expediente debe ser un número positivo',
      'any.required': 'El ID del expediente es requerido'
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

const queryExpedienteSchema = Joi.object({
  expedienteId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'El ID del expediente debe ser un número',
      'number.integer': 'El ID del expediente debe ser un número entero',
      'number.positive': 'El ID del expediente debe ser un número positivo'
    })
});

const updateEstadoSchema = Joi.object({
  estado: Joi.string()
    .valid('Aprobada', 'Denegada', 'Pendiente')
    .required()
    .messages({
      'string.empty': 'El estado es requerido',
      'any.only': 'El estado debe ser: Aprobada, Denegada o Pendiente',
      'any.required': 'El estado es requerido'
    }),
    
  justificacionRechazo: Joi.string()
    .min(10)
    .max(1000)
    .when('estado', {
      is: 'Denegada',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.empty': 'La justificación de rechazo es requerida para denegar una evidencia',
      'string.min': 'La justificación debe tener al menos 10 caracteres',
      'string.max': 'La justificación no puede tener más de 1000 caracteres',
      'any.required': 'La justificación es requerida para denegar una evidencia'
    })
});

module.exports = {
  create: indicioCreateSchema,
  update: indicioUpdateSchema,
  updateEstado: updateEstadoSchema,
  idParam: idParamSchema,
  expedienteIdParam: expedienteIdParamSchema,
  tecnicoIdParam: tecnicoIdParamSchema,
  queryExpediente: queryExpedienteSchema
};
