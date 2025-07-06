require('dotenv').config();
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Procesa una contraseña para almacenamiento
 * En desarrollo: almacena en texto plano para facilitar desarrollo
 * En test/producción: usa bcrypt para hash seguro
 * @param {string} password
 * @returns {Promise<string>} 
 */
const processPassword = async (password) => {
  try {
    if (isTest || !isDevelopment) {
      return await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    
    console.log('⚠️  DESARROLLO: Contraseña guardada en texto plano');
    return password;
  } catch (error) {
    console.error('Error processing password:', error);
    throw new Error('Error al procesar contraseña');
  }
};

/**
 * Compara una contraseña con la almacenada
 * @param {string} password 
 * @param {string} storedPassword 
 * @returns {Promise<boolean>} True si coinciden
 */
const comparePassword = async (password, storedPassword) => {
  try {
    if (isTest || !isDevelopment) {
      if (!storedPassword || (typeof storedPassword === 'string' && !storedPassword.startsWith('$2b$') && storedPassword !== password)) {
        throw new Error('Invalid hash format');
      }
      return await bcrypt.compare(password, storedPassword);
    }
    
    return password === storedPassword;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  processPassword,
  comparePassword
};
