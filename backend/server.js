require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./src/config/logger');

const { 
  errorHandler, 
  notFound, 
  requestLogger, 
  basicSecurity, 
  corsHandler 
} = require('./src/middleware/errorHandler');

const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3001;


if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

app.use(basicSecurity);

app.use(corsHandler);

// Middleware de debugging para requests
app.use((req, res, next) => {
  if (req.url.includes('/login')) {
    console.log('🐛 DEBUG Middleware - Login request detected');
    console.log('🐛 Content-Type:', req.get('Content-Type'));
    console.log('🐛 Body before parsing:', req.body);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de debugging DESPUÉS del parsing
app.use((req, res, next) => {
  if (req.url.includes('/login')) {
    console.log('🐛 DEBUG Middleware - After parsing');
    console.log('🐛 Body after parsing:', req.body);
    console.log('🐛 Body type:', typeof req.body);
    console.log('🐛 Body keys:', Object.keys(req.body || {}));
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MP DICRI API Server está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.use('/api', routes);

app.use(notFound);

app.use(errorHandler);


const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor MP DICRI API escuchando en http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado.');
    process.exit(0);
  });
});

module.exports = app;
