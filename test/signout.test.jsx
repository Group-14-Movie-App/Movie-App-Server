import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../index"; // Import your Express app
import bcrypt from "bcrypt";
import pool from "../helpers/db.js"; // Access the database

const TEST_USER = {
  email: "Pabitra@example.com",
  password: "Pabitra@123",
  firstName: "Pabitra",
  lastName: "Jane",
  city: "Helsinki",
};

describe("Sign-Out API Tests", () => {
  let server;
  let token;

  beforeAll(async () => {
    server = app.listen(5002); // Use a unique port for this test suite

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

    // Sign in the test user to get a valid token
    const res = await request(server).post("/signin").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    token = res.body.token;
  });

  afterAll(async () => {
    // Clean up the test user from the database
    await pool.query("DELETE FROM Users WHERE email = $1", [TEST_USER.email]);
    server.close();
  });

  it("should respond with success to POST /signout with valid token", async () => {
    const res = await request(server)
      .post("/signout")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("Sign-out successful."); // Ensure exact match
    console.log("Sign-out successful:", res.body.message);
  });

  it("should respond with an error to POST /signout without a token", async () => {
    const res = await request(server).post("/signout").expect(401);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("Access denied. No token provided.");
    console.log("Sign-out failed (no token):", res.body.message);
  });

  it("should respond with an error to POST /signout with an invalid token", async () => {
    const res = await request(server)
      .post("/signout")
      .set("Authorization", "Bearer invalidtoken")
      .expect(403);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("Invalid or expired token.");
    console.log("Sign-out failed (invalid token):", res.body.message);
  });
});
