import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index'; // Import your Express app
import bcrypt from 'bcrypt';
import pool from '../helpers/db.js'; // Access the database
import jwt from 'jsonwebtoken';

const TEST_USER = {
  email: 'testuser@mail.test',
  password: 'testpassword1',
  firstName: 'Jane',
  lastName: 'Doe',
  city: 'Helsinki',
};

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';

describe('Sign-In API Tests', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(5001);

    // Hash password and seed test user into the database
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    const query = `
      INSERT INTO Users (email, password, firstName, lastName, city)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(query, [
      TEST_USER.email,
      hashedPassword,
      TEST_USER.firstName,
      TEST_USER.lastName,
      TEST_USER.city,
    ]);
  });

  afterAll(async () => {
    // Clean up the test user from the database
    await pool.query('DELETE FROM Users WHERE email = $1', [TEST_USER.email]);
    server.close();
  });

  it('should respond Sign-in successful to POST /signin', async () => {
    const res = await request(server)
      .post('/signin')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      })
      .expect(200);

    expect(res.body).toBeTypeOf('object');
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Sign-in successful');

    // Verify JWT Token
    const decodedToken = jwt.verify(res.body.token, JWT_SECRET_KEY);
    expect(decodedToken.email).toBe(TEST_USER.email);
    expect(decodedToken.firstname).toBe(TEST_USER.firstName);

    console.log('Sign-in successful:', res.body.message);
  });

  it('should respond Invalid email or password to POST /signin with wrong password', async () => {
    const res = await request(server)
      .post('/signin')
      .send({
        email: TEST_USER.email,
        password: 'wrongpassword',
      })
      .expect(401);

    expect(res.body).toBeTypeOf('object');
    expect(res.body.message).toBe('Invalid email or password');
    console.log('Sign-in failed:', res.body.message);
  });

  it('should respond Invalid email or password to POST /signin with non-existent email', async () => {
    const res = await request(server)
      .post('/signin')
      .send({
        email: 'nonexistent@mail.test',
        password: 'somepassword',
      })
      .expect(401);

    expect(res.body).toBeTypeOf('object');
    expect(res.body.message).toBe('Invalid email or password');
    console.log('Sign-in failed for non-existent user:', res.body.message);
  });

  it('should respond Unauthorized to POST /signin with empty body', async () => {
    const res = await request(server)
      .post('/signin')
      .send({})
      .expect(401); // Adjusted to match the current route behavior
  
    expect(res.body).toBeTypeOf('object');
    expect(res.body.message).toBe('Invalid email or password');
    console.log('Sign-in failed due to empty body:', res.body.message);
  });
  
});
