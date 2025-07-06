const { errorResponse } = require('../utils/responses');
const express = require('express');
const logger = require('../config/logger');


const errorHandler = (err, req, res, next) => {
  logger.error('Error no manejado:', err);

  if (err.number) {
    switch (err.number) {
      case 2627:
        return errorResponse(res, 'Ya existe un registro con esos datos', 409);
      case 547:
        return errorResponse(res, 'Error de integridad referencial', 400);
      case 2:
        return errorResponse(res, 'Error de conexión a la base de datos', 503);
      default:
        return errorResponse(res, 'Error de base de datos', 500, err.message);
    }
  }

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Error de validación', 400, err.message);
  }

  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, 'No autorizado', 401);
  }

  return errorResponse(res, 'Error interno del servidor', 500, 
    process.env.NODE_ENV === 'development' ? err.message : 'Error interno');
};


const notFound = (req, res, next) => {
  return errorResponse(res, `Ruta no encontrada: ${req.originalUrl}`, 404);
};


const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};


const limitBodySize = (limit = '10mb') => {
  return express.json({ limit });
};


const basicSecurity = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};


const corsHandler = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

module.exports = {
  errorHandler,
  notFound,
  requestLogger,
  limitBodySize,
  basicSecurity,
  corsHandler
};
