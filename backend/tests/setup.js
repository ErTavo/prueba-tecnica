require('dotenv').config({ path: '.env.test' });

jest.mock('../src/utils/database', () => ({
  getDbConnection: jest.fn()
}));

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_SERVER = 'test_server';
process.env.DB_DATABASE = 'test_database';
process.env.BCRYPT_ROUNDS = '4'; 
