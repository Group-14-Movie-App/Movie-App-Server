const express = require('express');
const bcrypt = require('bcrypt'); // To compare hashed passwords
const signinRouter = express.Router();

const pool = require('../helpers/db.js');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Route to handle user sign-in
signinRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists
    const query = 'SELECT * FROM Users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

      // Generate JWT token
      const token = jwt.sign({ userId: user.userid }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h',
      });

    // Remove sensitive data before sending the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Sign-in successful',
      user: userWithoutPassword,
      token: token, // Include the token in the response
    });
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = signinRouter;


