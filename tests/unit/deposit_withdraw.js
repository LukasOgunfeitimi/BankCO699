const request = require('supertest');
const app = require('./server/main.js'); 
const supabase = require('@supabase/supabase-js');

describe('Deposit Funds', () => {
    it('should deposit money into account', async () => {
      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
  
      const mockAccount = { id: 1, balance: 500 };
  
      supabase.createClient.mockReturnValue({
        from: () => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockAccount, error: null }),
          update: jest.fn().mockResolvedValue({ error: null }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
  
      const response = await request(app)
        .post('/deposit')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100, emailCode: '123456', totpCode: '654321' }); 
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.newBalance).toBe(600);
    });
  });
  