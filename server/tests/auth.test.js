const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await User.create([
    { name: 'Test Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { name: 'Test Member', email: 'member1@test.com', password: 'member123', role: 'member' }
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
});