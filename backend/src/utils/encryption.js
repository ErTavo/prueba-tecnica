require('dotenv').config();
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

/**

 * @param {string} password
 * @returns {Promise<string>} 
 */
const encryptPassword = async (password) => {
  try {
    if (isTest || !isDevelopment) {
      return await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    
    console.log('⚠️  DESARROLLO: Contraseña guardada en texto plano');
    return password;
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw new Error('Error al procesar contraseña');
  }
};

/**
 * @param {string} password 
 * @param {string} storedPassword 
 * @returns {Promise<boolean>} True si coinciden
 */
const comparePassword = async (password, storedPassword) => {
  try {
    if (isTest || !isDevelopment) {
      return await bcrypt.compare(password, storedPassword);
    }
    
    const match = password === storedPassword;
    
    return match;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  encryptPassword,
  comparePassword
};
