const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Lead = require('../models/Lead');

let adminToken, memberToken, memberId, leadId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Lead.deleteMany({});
  
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
  const member = await User.create({ name: 'Member', email: 'member1@test.com', password: 'member123', role: 'member' });
  memberId = member._id.toString();

  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' });
  adminToken = adminRes.body.token;
  const memberRes = await request(app).post('/api/auth/login').send({ email: 'member1@test.com', password: 'member123' });
  memberToken = memberRes.body.token;

  // Create a test lead via public endpoint
  const leadRes = await request(app).post('/api/leads/public').send({ name: 'Test Lead', email: 'test@test.com' });
  leadId = leadRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Lead assignment and status flow', () => {
  it('admin assigns lead to member', async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });
    expect(res.statusCode).toBe(200);
    expect(res.body.assignedTo).toBe(memberId);
  });

  it('member updates status', async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'Contacted' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Contacted');
  });
});