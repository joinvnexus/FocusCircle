const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

let mongoServer;
let user1Token;
let user2Token;
let user1Id;
let task1Id;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create two users
  const user1Res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User 1', email: 'user1@example.com', password: 'password123' });
  user1Token = user1Res.body.token;
  user1Id = user1Res.body._id;

  const user2Res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User 2', email: 'user2@example.com', password: 'password123' });
  user2Token = user2Res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tasks API Authorization', () => {
  it('should create a task for user 1', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task 1', description: 'User 1 task' });

    expect(res.statusCode).toEqual(201);
    task1Id = res.body._id;
  });

  it('should not allow user 2 to delete user 1 task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Not authorized');
  });

  it('should allow user 1 to delete their own task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Task removed');
  });
});
