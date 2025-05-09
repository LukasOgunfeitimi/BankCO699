const request = require('supertest');
const app = require('./server/main.js'); 
const supabase = require('@supabase/supabase-js');

describe('Transfer Funds', () => {
    it('should transfer funds to another account', async () => {
      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
  
      const senderAccount = { id: 1, balance: 1000, account_num: 12345678 };
      const recipientAccount = { id: 2, balance: 500, account_num: 87654321 };
  
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'accounts') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({ data: senderAccount, error: null }) // first call
              .mockResolvedValueOnce({ data: recipientAccount, error: null }), // second call
            update: jest.fn().mockResolvedValue({ error: null }),
          };
        } else if (table === 'transactions') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });
  
      supabase.createClient.mockReturnValue({ from: mockFrom });
  
      const response = await request(app)
        .post('/transfer')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100, recipientAccountNum: 87654321, emailCode: '123456', totpCode: '654321' });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
  