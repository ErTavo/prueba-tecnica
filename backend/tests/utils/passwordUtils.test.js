const { processPassword, comparePassword } = require('../../src/utils/passwordUtils');

describe('Password Utils', () => {
  describe('processPassword', () => {
    it('debería procesar una contraseña correctamente', async () => {
      
      const password = 'testpassword123';

      
      const processedPassword = await processPassword(password);

      
      expect(processedPassword).toBeDefined();
      
      if (process.env.NODE_ENV === 'test') {
        expect(processedPassword).not.toBe(password);
        expect(processedPassword.length).toBeGreaterThan(50);
        expect(processedPassword).toMatch(/^\$2b\$/);
      }
    });

    it('debería generar diferentes hashes para la misma contraseña en test', async () => {
      
      const password = 'testpassword123';

      
      const hash1 = await processPassword(password);
      const hash2 = await processPassword(password);

      
      if (process.env.NODE_ENV === 'test') {
        expect(hash1).not.toBe(hash2); 
      }
    });

    it('debería manejar contraseñas vacías', async () => {
      
      const password = '';

      
      const processedPassword = await processPassword(password);

      
      expect(processedPassword).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('debería validar una contraseña correcta', async () => {
      
      const password = 'testpassword123';
      const processedPassword = await processPassword(password);

      
      const isValid = await comparePassword(password, processedPassword);

      
      expect(isValid).toBe(true);
    });

    it('debería rechazar una contraseña incorrecta', async () => {
      
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const processedPassword = await processPassword(password);

      
      const isValid = await comparePassword(wrongPassword, processedPassword);

      
      expect(isValid).toBe(false);
    });

    it('debería manejar hashes inválidos', async () => {
      
      const password = 'testpassword123';
      const invalidHash = 'invalid_hash';


      if (process.env.NODE_ENV === 'test') {
        await expect(comparePassword(password, invalidHash)).rejects.toThrow();
      } else {
        const result = await comparePassword(password, invalidHash);
        expect(result).toBe(false);
      }
    });

    it('debería manejar contraseñas vacías', async () => {
      
      const password = '';
      const processedPassword = await processPassword(password);

      
      const isValid = await comparePassword(password, processedPassword);

      
      expect(isValid).toBe(true);
    });
  });
});
