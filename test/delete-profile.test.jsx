import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../index"; // Import your Express app
import bcrypt from "bcrypt";
import pool from "../helpers/db.js"; // Access the database
import jwt from "jsonwebtoken";

const TEST_USER = {
  email: "testuser@mail.com",
  password: "testpassword1",
  firstName: "John",
  lastName: "Doe",
  city: "Helsinki",
};

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_jwt_secret_key";

describe("Delete Profile API Tests", () => {
  let server;
  let token;
  let userID;

  beforeAll(async () => {
    // Start the server
    server = app.listen(5003);

    // Create test user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    const createUserQuery = `
      INSERT INTO Users (email, password, firstName, lastName, city)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING userID;
    `;
    const result = await pool.query(createUserQuery, [
      TEST_USER.email,
      hashedPassword,
      TEST_USER.firstName,
      TEST_USER.lastName,
      TEST_USER.city,
    ]);
    userID = result.rows[0].userid;

    // Generate token for the test user
    token = jwt.sign(
      {
        userid: userID,
        email: TEST_USER.email,
      },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Clean up test user
    await pool.query("DELETE FROM Users WHERE userID = $1", [userID]);
    server.close();
  });

  it("should delete the user profile successfully", async () => {
    const res = await request(server)
      .delete(`/profile/${userID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("User profile deleted successfully");
    console.log("Profile deleted successfully:", res.body.message);
  });

  it("should return 403 for unauthorized user", async () => {
    const res = await request(server)
      .delete(`/profile/${userID}`)
      .set("Authorization", "Bearer invalidtoken")
      .expect(403);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("Invalid or expired token.");
    console.log("Unauthorized user deletion attempt:", res.body.message);
  });

  it("should return 404 if the user does not exist", async () => {
    const invalidUserID = 99999; // Ensure this ID is unlikely to exist
    
    // Generate a token with the invalidUserID
    const invalidToken = jwt.sign(
      {
        userid: invalidUserID,
        email: "invaliduser@mail.com", // Dummy email
      },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
  
    const res = await request(server)
      .delete(`/profile/${invalidUserID}`)
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(404);
  
    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("User not found");
    console.log("Non-existent user deletion attempt:", res.body.message);
  });
  
  

  it("should return 403 if the userID does not match the token", async () => {
    const anotherUserID = userID + 1; // Simulate a different userID
    const res = await request(server)
      .delete(`/profile/${anotherUserID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).toBeTypeOf("object");
    expect(res.body.message).toBe("Access denied.");
    console.log("Access denied for mismatched userID:", res.body.message);
  });
});
