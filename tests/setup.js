jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret-key';

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});