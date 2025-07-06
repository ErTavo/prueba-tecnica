// Script para generar hashes de contraseñas para usuarios de prueba
const { hashPassword } = require('./src/utils/passwordUtils');

async function generateHashes() {
  try {
    const password = 'password123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    const hash3 = await hashPassword(password);
    
    console.log('=== HASHES PARA USUARIOS DE PRUEBA ===');
    console.log(`Contraseña original: ${password}`);
    console.log('');
    console.log(`Hash para tecnico1: ${hash1}`);
    console.log(`Hash para supervisor1: ${hash2}`);
    console.log(`Hash para admin1: ${hash3}`);
    console.log('');
    console.log('=== SQL STATEMENTS ===');
    console.log(`UPDATE Usuarios SET Contraseña = '${hash1}' WHERE Usuario = 'tecnico1';`);
    console.log(`UPDATE Usuarios SET Contraseña = '${hash2}' WHERE Usuario = 'supervisor1';`);
    console.log(`UPDATE Usuarios SET Contraseña = '${hash3}' WHERE Usuario = 'admin1';`);
    
  } catch (error) {
    console.error('Error generando hashes:', error);
  }
}

generateHashes();
