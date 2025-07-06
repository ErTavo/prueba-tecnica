// Script temporal para verificar contraseñas en la DB
const { getDbConnection } = require('./src/utils/database');
const sql = require('mssql');

async function verificarUsuarios() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(`
      SELECT Id, Nombre, Usuario, Contraseña, Rol 
      FROM Usuarios 
      WHERE Usuario IN ('admin1', 'jperez')
    `);
    
    console.log('=== USUARIOS EN BASE DE DATOS ===');
    result.recordset.forEach(user => {
      console.log(`Usuario: ${user.Usuario}`);
      console.log(`Nombre: ${user.Nombre}`);
      console.log(`Contraseña: "${user.Contraseña}"`);
      console.log(`Tipo: ${typeof user.Contraseña}`);
      console.log(`Longitud: ${user.Contraseña ? user.Contraseña.length : 'N/A'}`);
      console.log(`Rol: ${user.Rol}`);
      console.log('---');
    });
    
    // Prueba de comparación
    const admin = result.recordset.find(u => u.Usuario === 'admin1');
    if (admin) {
      console.log('=== PRUEBA DE COMPARACIÓN ===');
      console.log(`Contraseña DB: "${admin.Contraseña}"`);
      console.log(`Contraseña test: "password123"`);
      console.log(`¿Son iguales?: ${admin.Contraseña === 'password123'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarUsuarios();
