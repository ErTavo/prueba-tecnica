const { 
  validateRequiredFields,
  isValidEmail,
  isValidRole,
  sanitizeInput 
} = require('../../src/utils/validators');

describe('Validators Utils', () => {
  describe('validateRequiredFields', () => {
    it('debería validar campos requeridos correctamente', () => {
      
      const fields = {
        nombre: 'Juan Pérez',
        usuario: 'jperez',
        email: 'juan@example.com'
      };

      
      const result = validateRequiredFields(fields);

      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('debería detectar campos faltantes', () => {
      
      const fields = {
        nombre: 'Juan Pérez',
        usuario: '',
        email: null
      };

      
      const result = validateRequiredFields(fields);

      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['usuario', 'email']);
    });

    it('debería manejar undefined y espacios en blanco', () => {
      
      const fields = {
        nombre: '   ',
        usuario: undefined,
        email: 'test@example.com'
      };

      
      const result = validateRequiredFields(fields);

      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(['nombre', 'usuario']);
    });

    it('debería manejar objeto vacío', () => {
      
      const result = validateRequiredFields({});

      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
  });

  describe('isValidEmail', () => {
    it('debería validar emails correctos', () => {
      
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@domain.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('debería rechazar emails incorrectos', () => {
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        '',
        null,
        undefined
      ];

       
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidRole', () => {
    it('debería validar roles correctos', () => {
      
      const validRoles = ['Admin', 'Tecnico', 'Supervisor'];

       
      validRoles.forEach(role => {
        expect(isValidRole(role)).toBe(true);
      });
    });

    it('debería rechazar roles incorrectos', () => {
      
      const invalidRoles = [
        'admin',
        'ADMIN',
        'Administrador',
        'User',
        '',
        null,
        undefined
      ];

       
      invalidRoles.forEach(role => {
        expect(isValidRole(role)).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('debería sanitizar input básico', () => {
      
      const input = '  Hello World  ';

      
      const result = sanitizeInput(input);

      
      expect(result).toBe('Hello World');
    });

    it('debería manejar caracteres especiales', () => {
      
      const input = '<script>alert("xss")</script>';

      
      const result = sanitizeInput(input);

      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('debería manejar null y undefined', () => {
       
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('debería manejar números', () => {
      
      const input = 123;

      
      const result = sanitizeInput(input);

      
      expect(result).toBe('123');
    });

    it('debería limpiar espacios múltiples', () => {
      
      const input = '  multiple    spaces   here  ';

      
      const result = sanitizeInput(input);

      
      expect(result).toBe('multiple spaces here');
    });
  });
});
