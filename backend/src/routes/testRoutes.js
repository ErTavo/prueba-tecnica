const express = require('express');
const { getDbConnection } = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responses');

const router = express.Router();

router.get('/health', (req, res) => {
  successResponse(res, {
    timestamp: new Date().toISOString(),
    service: 'MP DICRI API',
    version: '1.0.0'
  }, 'Servicio funcionando correctamente');
});

router.get('/test/connection', async (req, res) => {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query('SELECT GETDATE() AS now, @@VERSION AS version');
    successResponse(res, result.recordset[0], 'Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Database connection error:', error);
    errorResponse(res, 'Error de conexión a la base de datos', 500, error.message);
  }
});

router.get('/test/tables', async (req, res) => {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    successResponse(res, result.recordset.map(row => row.TABLE_NAME), 'Tablas obtenidas exitosamente');
  } catch (error) {
    console.error('Database tables error:', error);
    errorResponse(res, 'Error al obtener tablas', 500, error.message);
  }
});

module.exports = router;
