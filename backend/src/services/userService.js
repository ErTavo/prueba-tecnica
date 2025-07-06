const { getDbConnection } = require('../utils/database');
const sql = require('mssql');

class UserService {
  async getAllUsers() {
    try {
      const pool = await getDbConnection();
      const result = await pool.request().query(`
        SELECT Id, Nombre, Usuario, Rol 
        FROM Usuarios
        ORDER BY Nombre
      `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT Id, Nombre, Usuario, Rol 
          FROM Usuarios 
          WHERE Id = @id
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error in UserService.getUserById:', error);
      throw error;
    }
  }

  async getUserByUsername(usuario) {
    try {
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('usuario', sql.NVarChar(50), usuario)
        .query(`
          SELECT Id, Nombre, Usuario, Contraseña, Rol 
          FROM Usuarios 
          WHERE Usuario = @usuario
        `);
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error in UserService.getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const { nombre, usuario, contraseña, rol } = userData;
      
      const existingUser = await this.getUserByUsername(usuario);
      if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
      }

      const pool = await getDbConnection();
      const result = await pool.request()
        .input('nombre', sql.NVarChar(100), nombre)
        .input('usuario', sql.NVarChar(50), usuario)
        .input('contraseña', sql.NVarChar(255), contraseña)
        .input('rol', sql.NVarChar(20), rol)
        .query(`
          INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol)
          OUTPUT INSERTED.Id, INSERTED.Nombre, INSERTED.Usuario, INSERTED.Rol
          VALUES (@nombre, @usuario, @contraseña, @rol)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error in UserService.createUser:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        return null;
      }

      if (updateData.contraseña) {
        // Guardar contraseña en texto plano
      }

      const pool = await getDbConnection();
      
      const updateFields = [];
      const request = pool.request().input('id', sql.Int, id);
      
      if (updateData.nombre) {
        updateFields.push('Nombre = @nombre');
        request.input('nombre', sql.NVarChar(100), updateData.nombre);
      }
      
      if (updateData.usuario) {
        updateFields.push('Usuario = @usuario');
        request.input('usuario', sql.NVarChar(50), updateData.usuario);
      }
      
      if (updateData.contraseña) {
        updateFields.push('Contraseña = @contraseña');
        request.input('contraseña', sql.NVarChar(255), updateData.contraseña);
      }
      
      if (updateData.rol) {
        updateFields.push('Rol = @rol');
        request.input('rol', sql.NVarChar(20), updateData.rol);
      }

      if (updateFields.length === 0) {
        return existingUser;
      }

      const result = await request.query(`
        UPDATE Usuarios 
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.Id, INSERTED.Nombre, INSERTED.Usuario, INSERTED.Rol
        WHERE Id = @id
      `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error in UserService.updateUser:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        return false;
      }

      const pool = await getDbConnection();
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Usuarios WHERE Id = @id');
      
      return true;
    } catch (error) {
      console.error('Error in UserService.deleteUser:', error);
      throw error;
    }
  }

  async validateLogin(usuario, contraseña) {
    try {
      console.log('🔍 UserService.validateLogin iniciado');
      console.log('📧 Usuario recibido:', usuario);
      console.log('🔑 Contraseña recibida:', contraseña ? '***' : 'undefined');
      
      const user = await this.getUserByUsername(usuario);
      console.log('👤 Usuario encontrado en DB:', user ? 'SÍ' : 'NO');
      
      if (!user) {
        console.log('❌ Usuario no encontrado en la base de datos');
        return { valid: false, user: null };
      }

      console.log('💾 Contraseña en DB:', user.Contraseña);
      const isValidPassword = contraseña === user.Contraseña; // Comparación directa sin encriptación
      console.log('🔐 Resultado validación contraseña:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Contraseña incorrecta');
        return { valid: false, user: null };
      }

      const { Contraseña, ...userWithoutPassword } = user;
      
      console.log('✅ Login exitoso para usuario:', usuario);
      return { 
        valid: true, 
        user: userWithoutPassword,
        token: null 
      };
    } catch (error) {
      console.error('❌ Error in UserService.validateLogin:', error);
      throw error;
    }
  }

  async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await this.getUserByUsername((await this.getUserById(id)).Usuario);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const isValidCurrentPassword = currentPassword === user.Contraseña; // Comparación directa
      if (!isValidCurrentPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      const pool = await getDbConnection();
      await pool.request()
        .input('id', sql.Int, id)
        .input('contraseña', sql.NVarChar(255), newPassword) // Guardar nueva contraseña sin encriptar
        .query('UPDATE Usuarios SET Contraseña = @contraseña WHERE Id = @id');
      
      return true;
    } catch (error) {
      console.error('Error in UserService.changePassword:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
