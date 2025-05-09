const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/sendEmail.js');
const Email = require('../../utils/sendEmail.js');

const testUser = {
    id: 'test-user-id',
    email: 'testuser@example.com',
    name: 'Test User',
};
const token = jwt.sign(testUser, process.env.JWT_SECRET);

jest.mock('@supabase/supabase-js', () => {
    const originalModule = jest.requireActual('@supabase/supabase-js');
    return {
        ...originalModule,
        createClient: () => ({
            from: () => ({
                upsert: jest.fn().mockResolvedValue({ error: null }),
            }),
        }),
    };
});

describe('POST /sendemailcode', () => {
    it('should send email code if user is authenticated', async () => {
        Email.sendEmailAuthCode.mockResolvedValue(true);

        const res = await request(app)
            .post('/sendemailcode')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Authentication code sent successfully');
        expect(Email.sendEmailAuthCode).toHaveBeenCalledWith(testUser.email, expect.any(String));
    });

    it('should fail without auth token', async () => {
        const res = await request(app).post('/sendemailcode').send();
        expect(res.statusCode).toBe(401);
    });
});
