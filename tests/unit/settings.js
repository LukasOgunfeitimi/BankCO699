const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');

const testUser = {
  id: 'user-id-123',
  email: 'testuser@example.com',
  name: 'Old Name',
};
const token = jwt.sign(testUser, process.env.JWT_SECRET);

jest.mock('@supabase/supabase-js', () => {
  const original = jest.requireActual('@supabase/supabase-js');
  return {
    ...original,
    createClient: () => ({
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { name: 'New Name' }, error: null }),
            }),
          }),
        }),
      }),
    }),
  };
});

describe('PUT /settings', () => {
  it('should update the username', async () => {
    const res = await request(app)
      .put('/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'New Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(res.body.user.name).toBe('New Name');
  });

  it('should return error if no username is provided', async () => {
    const res = await request(app)
      .put('/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Username is required');
  });
});

describe('PUT /settings/password', () => {
  it('should update the password successfully', async () => {
    const newPassword = 'NewSecurePassword123';

    const res = await request(app)
      .put('/settings/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');
  });

  it('should return error if newPassword is missing', async () => {
    const res = await request(app)
      .put('/settings/password')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('New password is required');
  });
});
