const request = require('supertest');
const express = require('express');
const healthRoutes = require('../../../src/routes/health.routes');

describe('Health Routes', () => {
  let app;
  let originalEnv;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', healthRoutes);
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('GET /health', () => {
    test('deve retornar status 200', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });

    test('deve retornar objeto com status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('status', 'ok');
    });

    test('deve retornar timestamp válido', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('deve retornar uptime do processo', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('deve retornar environment corretamente', async () => {
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('environment', 'production');
    });

    test('deve retornar development quando NODE_ENV não está definido', async () => {
      delete process.env.NODE_ENV;

      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('environment', 'development');
    });

    test('deve retornar version 1.0.0', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    test('deve retornar estrutura completa do objeto', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toEqual({
        status: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        version: expect.any(String),
      });
    });

    test('deve retornar Content-Type application/json', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('deve funcionar apenas com método GET', async () => {
      const getResponse = await request(app).get('/health');
      expect(getResponse.status).toBe(200);

      const postResponse = await request(app).post('/health');
      expect(postResponse.status).toBe(404);

      const putResponse = await request(app).put('/health');
      expect(putResponse.status).toBe(404);

      const deleteResponse = await request(app).delete('/health');
      expect(deleteResponse.status).toBe(404);
    });

    test('deve retornar timestamp próximo ao momento atual', async () => {
      const beforeRequest = new Date();
      const response = await request(app).get('/health');
      const afterRequest = new Date();

      const responseTimestamp = new Date(response.body.timestamp);
      
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    test('deve funcionar com diferentes valores de NODE_ENV', async () => {
      const environments = ['development', 'production', 'test', 'staging'];

      for (const env of environments) {
        process.env.NODE_ENV = env;
        const response = await request(app).get('/health');
        
        expect(response.status).toBe(200);
        expect(response.body.environment).toBe(env);
      }
    });

    test('deve retornar uptime crescente em múltiplas chamadas', async () => {
      const response1 = await request(app).get('/health');
      const uptime1 = response1.body.uptime;

      // Aguarda um pequeno intervalo
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(app).get('/health');
      const uptime2 = response2.body.uptime;

      expect(uptime2).toBeGreaterThanOrEqual(uptime1);
    });

    test('deve retornar 404 para rotas não definidas', async () => {
      const response = await request(app).get('/health/invalid');

      expect(response.status).toBe(404);
    });

    test('não deve exigir autenticação', async () => {
      // Health check não deve ter middleware de auth
      const response = await request(app)
        .get('/health')
        .set('Authorization', ''); // Sem token

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    test('deve ignorar query parameters', async () => {
      const response = await request(app).get('/health?test=123&foo=bar');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    test('deve manter estrutura consistente em múltiplas chamadas', async () => {
      const response1 = await request(app).get('/health');
      const response2 = await request(app).get('/health');

      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort());
    });
  });
}); 