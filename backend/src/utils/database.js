const sql = require('mssql');
const logger = require('../config/logger');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'huk3ym65ac8%P',
  server: process.env.DB_HOST || process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'MP_DICRI',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: { 
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false,
    connectTimeout: 60000,
    requestTimeout: 60000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

logger.info('Database configuration:', {
  server: dbConfig.server,
  database: dbConfig.database,
  port: dbConfig.port,
  user: dbConfig.user
});

let poolPromise = sql.connect(dbConfig);

/**
 * @returns {Promise<sql.ConnectionPool>}
 */
const getDbConnection = async () => {
  try {
    return await poolPromise;
  } catch (err) {
    logger.error('Database connection failed:', err);
    poolPromise = sql.connect(dbConfig);
    return await poolPromise;
  }
};

/**
 * @param {string} query 
 * @param {Object} params 
 * @returns {Promise<sql.IResult>}
 */
const executeQuery = async (query, params = {}) => {
  try {
    const pool = await getDbConnection();
    const request = pool.request();
    
    Object.keys(params).forEach(key => {
      const { type, value } = params[key];
      request.input(key, type, value);
    });
    
    return await request.query(query);
  } catch (err) {
    logger.error('Query execution failed:', err);
    throw err;
  }
};


const closeConnection = async () => {
  try {
    const pool = await poolPromise;
    await pool.close();
  } catch (err) {
    logger.error('Error closing connection pool:', err);
  }
};

module.exports = {
  sql,
  getDbConnection,
  executeQuery,
  closeConnection,
  dbConfig
};
