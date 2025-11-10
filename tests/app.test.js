import request from 'supertest';
import app from '#src/app.js';

describe('API ENDPOINT', () => {
  describe('GET /health', () => {
    it('should return status 200 and health info', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
  describe('GET /api', () => {
    it('should return an API message', async () => {
      const response = await request(app).get('/api').expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Welcome to the Acquisitions API'
      );
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent').expect(404);

      expect(response.body).toHaveProperty('error', 'Route/Endpoint not found');
    });
  });
});
