import { describe, it, beforeAll, afterAll, expect } from "vitest";
import request from "supertest";
import app from "../index"; // Your Express app
import pool from "../helpers/db"; // Database connection
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_jwt_secret_key";

describe("Review Routes Tests", () => {
  let server;
  let validToken;
  let validUserID;
  let validReviewID;

  beforeAll(async () => {
    server = app.listen(5004);

    // Create a test user with a unique email to avoid duplicates
    const userEmail = `testuser_${Date.now()}@mail.com`;
    const userRes = await pool.query(
      `INSERT INTO Users (email, password, firstName, lastName, city)
       VALUES ($1, 'testpassword', 'Test', 'User', 'Helsinki')
       RETURNING userID`,
      [userEmail]
    );
    validUserID = userRes.rows[0].userid;

    // Generate a valid token
    validToken = jwt.sign({ userID: validUserID }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Add a test review
    const reviewRes = await pool.query(
      `INSERT INTO Reviews (userID, movieTitle, releaseDate, description, rating)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING reviewID`,
      [validUserID, "Inception", "2010-07-16", "Great movie!", 5]
    );
    validReviewID = reviewRes.rows[0].reviewid;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM Reviews WHERE userID = $1", [validUserID]);
    await pool.query("DELETE FROM Users WHERE userID = $1", [validUserID]);
    server.close();
  });

  // POST /reviews
  it("should successfully submit a new review", async () => {
    const reviewData = {
      userID: validUserID,
      movieTitle: "Avatar",
      releaseDate: "2009-12-18",
      description: "Visually stunning!",
      rating: 4,
    };
  
    const res = await request(server)
      .post("/reviews")
      .set("Authorization", `Bearer ${validToken}`)
      .send(reviewData)
      .expect(201);
  
    console.log("Response body:", res.body); // Debugging
  
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("Review added successfully");
    expect(res.body.review).toBeDefined(); // Check if review is present
    expect(res.body.review.movietitle).toBe("Avatar"); // Updated key to match response
  });
  

  it("should return 400 for invalid releaseDate format", async () => {
    const reviewData = {
      userID: validUserID,
      movieTitle: "Avatar",
      releaseDate: "invalid-date",
      description: "Visually stunning!",
      rating: 4,
    };

    const res = await request(server)
      .post("/reviews")
      .set("Authorization", `Bearer ${validToken}`)
      .send(reviewData)
      .expect(400);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("Invalid releaseDate format");
  });

  it("should return 400 for duplicate review submission", async () => {
    const reviewData = {
      userID: validUserID,
      movieTitle: "Inception",
      releaseDate: "2010-07-16",
      description: "Duplicate review!",
      rating: 5,
    };

    const res = await request(server)
      .post("/reviews")
      .set("Authorization", `Bearer ${validToken}`)
      .send(reviewData)
      .expect(400);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toContain("already reviewed");
  });

  // GET /reviews
  it("should fetch all reviews successfully", async () => {
    const res = await request(server)
      .get("/reviews")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);
  
    console.log("Fetched reviews:", res.body); // Debugging
  
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.some((review) => review.movietitle === "Inception") // Updated key to match response
    ).toBeTruthy();
  });
  

  // PUT /:reviewID
  it("should update a review successfully", async () => {
    const updateData = {
      userID: validUserID,
      description: "Updated description",
      rating: 4,
    };

    const res = await request(server)
      .put(`/reviews/${validReviewID}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("Review updated successfully");
    expect(res.body.review.description).toBe("Updated description");
  });

  it("should return 403 for updating a review that does not belong to the user", async () => {
    const updateData = {
      userID: validUserID + 1, // Invalid user ID
      description: "Should not update",
      rating: 3,
    };

    const res = await request(server)
      .put(`/reviews/${validReviewID}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send(updateData)
      .expect(403);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("You can only edit your own reviews.");
  });

  // DELETE /:reviewID
  it("should delete a review successfully", async () => {
    const res = await request(server)
      .delete(`/reviews/${validReviewID}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userID: validUserID })
      .expect(200);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("Review deleted successfully.");
  });

  it("should return 403 for deleting a review that does not belong to the user", async () => {
    const res = await request(server)
      .delete(`/reviews/${validReviewID}`)
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userID: validUserID + 1 }) // Invalid user ID
      .expect(403);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toBe("You can only delete your own reviews.");
  });
});
