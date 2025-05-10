const request = require('supertest');
const app = require('./server/main.js'); 
const supabase = require('@supabase/supabase-js');

describe('Account Balance', () => {
    it('should return account balance', async () => {
      const token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET);
  
      supabase.createClient.mockReturnValue({
        from: () => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { balance: 1000 }, error: null }),
        }),
      });
  
      const response = await request(app)
        .get('/balance')
        .set('Authorization', `Bearer ${token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('balance', 1000);
    });
  });
  