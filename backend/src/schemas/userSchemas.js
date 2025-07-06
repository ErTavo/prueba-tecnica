const Joi = require('joi');

const userSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  usuario: Joi.string()
    .min(3)
    .max(50)
    .alphanum()
    .required()
    .messages({
      'string.empty': 'El usuario es requerido',
      'string.min': 'El usuario debe tener al menos 3 caracteres',
      'string.max': 'El usuario no puede tener más de 50 caracteres',
      'string.alphanum': 'El usuario solo puede contener letras y números',
      'any.required': 'El usuario es requerido'
    }),
  
  contrasenia: Joi.string()
    .min(6)
    .max(255)
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede tener más de 255 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  
  rol: Joi.string()
    .valid('admin', 'user', 'Tecnico', 'Admin')
    .default('user')
    .messages({
      'any.only': 'El rol debe ser admin, user, Tecnico o Admin'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'El email debe tener un formato válido'
    })
});

const userUpdateSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .optional(),
  
  usuario: Joi.string()
    .min(3)
    .max(50)
    .alphanum()
    .optional(),
  
  contrasenia: Joi.string()
    .min(6)
    .max(255)
    .optional(),
  
  rol: Joi.string()
    .valid('admin', 'user', 'Tecnico', 'Admin')
    .optional(),
  
  email: Joi.string()
    .email()
    .optional()
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

const loginSchema = Joi.object({
  usuario: Joi.string()
    .required()
    .messages({
      'string.empty': 'El usuario es requerido',
      'any.required': 'El usuario es requerido'
    }),
  
  contrasenia: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida'
    })
});

const idSchema = Joi.object({
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

module.exports = {
  userSchema,
  userUpdateSchema,
  loginSchema,
  idSchema
};
