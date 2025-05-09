const request = require('supertest');
const app = require('./server/main.js'); 
const supabase = require('@supabase/supabase-js');

jest.mock('@supabase/supabase-js');
jest.mock('../utils/sendEmail.js', () => ({
  sendWelcomeEmail: jest.fn(),
}));

const mockInsertUser = jest.fn();
const mockInsertAccount = jest.fn();


// intercept the supabase client creation
supabase.createClient.mockReturnValue({
  from: () => ({
    insert: mockInsertUser,
    select: () => ({
      single: () => ({ data: { id: 1, email: 'test@example.com', name: 'Test' }, error: null }),
    }),
  }),
});

describe('POST /register', () => {
  beforeEach(() => {
    mockInsertUser.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', name: 'Test' },
      error: null,
    });
    mockInsertAccount.mockResolvedValue({
      data: { id: 1, balance: 0, account_num: 12345678 },
      error: null,
    });
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'securePassword123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.qrcode).toBeDefined();
  });

  it('should return an error if email exists', async () => {
    mockInsertUser.mockResolvedValue({
      data: null,
      error: { message: 'User already exists' },
    });

    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'securePassword123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('User already exists');
  });
});
