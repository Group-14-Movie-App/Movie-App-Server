import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index'; // Import your Express app
import bcrypt from 'bcrypt';
import pool from '../helpers/db.js'; // Access the database

const TEST_USER = {
  email: 'Pabitra@mail.test',
  password: 'Pabitra@123',
  firstName: 'Pabitra',
  lastName: 'Doe',
  city: 'Helsinki',
};

const EXISTING_USER = {
  email: 'existinguser1@mail.test',
  password: 'existingpassword1',
  firstName: 'John',
  lastName: 'Smith',
  city: 'Espoo',
};

describe('Register API Tests', () => {
  let server;
  let baseURL;

  beforeAll(async () => {
    // Start the server on a random available port
    server = app.listen(0);
    const { port } = server.address();
    baseURL = `http://localhost:${port}`;

    // Insert an existing user into the database for negative test cases
    const hashedPassword = await bcrypt.hash(EXISTING_USER.password, 10);
    await pool.query(
      `INSERT INTO Users (email, password, firstName, lastName, city) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
      [
        EXISTING_USER.email,
        hashedPassword,
        EXISTING_USER.firstName,
        EXISTING_USER.lastName,
        EXISTING_USER.city,
      ]
    );
  });

  afterAll(async () => {
    // Clean up the test users from the database
    await pool.query('DELETE FROM Users WHERE email = $1', [TEST_USER.email]);
    await pool.query('DELETE FROM Users WHERE email = $1', [EXISTING_USER.email]);
    server.close();
  });

  it('should register a new user successfully', async () => {
    const res = await request(baseURL)
      .post('/register')
      .send(TEST_USER)
      .expect(201);

    expect(res.body).toBeTypeOf('object');
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user).toBeTypeOf('object');
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body).toHaveProperty('token');
    console.log('User registration successful:', res.body.message);
  });

  it('should fail to register a user with an existing email', async () => {
    const res = await request(baseURL)
      .post('/register')
      .send(EXISTING_USER)
      .expect(400);

    expect(res.body).toBeTypeOf('object');
    expect(res.body.message).toBe('Email already exists');
    console.log('User registration failed (duplicate email):', res.body.message);
  });

  it("should fail to register a user with missing fields", async () => {
    const incompleteUser = { email: "incomplete@mail.test" }; // Only email provided
  
    const res = await request(baseURL).post("/register").send(incompleteUser).expect(400);
  
    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toMatch(/All fields are required/); // Updated to match the server's message
    console.log("User registration failed (missing fields):", res.body.message);
  });
  

  it('should fetch all registered users successfully', async () => {
    const res = await request(baseURL).get('/register').expect(200);

    expect(res.body).toBeTypeOf('object');
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const emails = res.body.map((user) => user.email);
    expect(emails).toContain(EXISTING_USER.email);
    console.log('Fetched registered users:', res.body);
  });
});