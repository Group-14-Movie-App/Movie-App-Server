const express = require("express");
const signoutRouter = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

// In-memory token blacklist (can be replaced with a database for production use)
const tokenBlacklist = new Set();

// Route to handle user sign-out
signoutRouter.post("/", authenticateToken, async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    // Add the token to the blacklist
    tokenBlacklist.add(token);
    console.log(`Token blacklisted: ${token}`);
    res.status(200).json({ message: "Sign-out successful." });
  } catch (error) {
    console.error("Error during sign-out:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Middleware to check if a token is blacklisted (for protecting other routes)
const checkBlacklist = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token && tokenBlacklist.has(token)) {
    return res.status(403).json({ message: "Token has been invalidated." });
  }

  next();
};

module.exports = signoutRouter;
