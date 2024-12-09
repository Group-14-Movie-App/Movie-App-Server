const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // JWT for token generation
const registerRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// JWT Secret Key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';

// Route to handle user registration
registerRouter.post('/', async (req, res) => {
  const { email, password, firstName, lastName, city } = req.body;

  try {
    // Hash the password before storing it in the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into the Users table
    const query = `
      INSERT INTO Users (email, password, firstName, lastName, city) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING userID, email, firstName, lastName, city
    `;
    const values = [email, hashedPassword, firstName, lastName, city];
    const result = await pool.query(query, values);

    const newUser = result.rows[0];

    // Generate a JWT token for the registered user
    const token = jwt.sign(
      {
        userid: newUser.userid,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        city: newUser.city,
      },
      JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token, // Send the token for immediate user access
    });
  } catch (error) {
    console.error('Error registering user:', error.message);

    // Handle duplicate email error
    if (error.code === '23505') { // Postgres unique violation error code
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Route to get all registered users (excluding passwords for security)
registerRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT userID, email, firstName, lastName, city FROM Users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = registerRouter;
