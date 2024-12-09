const express = require('express');
const bcrypt = require('bcrypt'); // To compare hashed passwords
const jwt = require('jsonwebtoken'); // To generate JWT
const signinRouter = express.Router();
const pool = require('../helpers/db.js');

// JWT Secret Key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';

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

    // Remove sensitive data before generating a token
    const { password: _, ...userWithoutPassword } = user;

    // Generate a JWT token
    const token = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        city: user.city,
        isadmin: user.isadmin,
      },
      JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Sign-in successful',
      user: userWithoutPassword, // User data without password
      token, // Token for authenticated access
    });
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = signinRouter;
