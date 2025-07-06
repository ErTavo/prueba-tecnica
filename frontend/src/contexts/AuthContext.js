import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mp-dicri-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('mp-dicri-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendCredentials = {
        user: credentials.usuario,
        pass: credentials.contraseña
      };
      
      console.log('🔄 Transformando credenciales para backend:', {
        frontend: credentials,
        backend: { user: backendCredentials.user, pass: '***' }
      });
      
      const response = await userService.login(backendCredentials);
      
      if (response.success && response.data) {
        const userData = {
          id: response.data.user.Id,
          nombre: response.data.user.Nombre,
          usuario: response.data.user.Usuario,
          rol: response.data.user.Rol,
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('mp-dicri-user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        throw new Error(response.error || 'Credenciales inválidas');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error en el login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('mp-dicri-user');
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.rol);
    }
    return user.rol === requiredRole;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = {
      'evidencias.crear': ['Tecnico', 'Supervisor', 'Admin'],
      'evidencias.ver': ['Tecnico', 'Supervisor', 'Admin'],
      'evidencias.editar': ['Tecnico', 'Supervisor', 'Admin'],
      
      'evidencias.aprobar': ['Supervisor', 'Admin'],
      'evidencias.rechazar': ['Supervisor', 'Admin'],
      'evidencias.revisar': ['Supervisor', 'Admin'],
      
      'expedientes.crear': ['Tecnico', 'Supervisor', 'Admin'],
      'expedientes.ver': ['Tecnico', 'Supervisor', 'Admin'],
      'expedientes.editar': ['Supervisor', 'Admin'],
      'expedientes.eliminar': ['Admin'],
      
      'usuarios.ver': ['Supervisor', 'Admin'],
      'usuarios.crear': ['Admin'],
      'usuarios.editar': ['Admin'],
      'usuarios.eliminar': ['Admin'],
      
      'dashboard.estadisticas': ['Supervisor', 'Admin'],
      'dashboard.reportes': ['Supervisor', 'Admin']
    };
    
    const allowedRoles = permissions[permission] || [];
    return allowedRoles.includes(user.rol);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
