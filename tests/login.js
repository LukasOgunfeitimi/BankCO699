const request = require('supertest');
const app = require('./server/main.js'); 
const supabase = require('@supabase/supabase-js');

describe('User Login', () => {
    it('should log in with correct credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };
  
      supabase.createClient.mockReturnValue({
        from: () => ({
          select: () => ({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });
  
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });
  
      expect(response.statusCode).toBe(400);
    });
  });
  