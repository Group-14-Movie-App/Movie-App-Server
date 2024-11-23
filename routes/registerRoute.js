const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const registerRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// Function to validate password
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // At least one capital letter, one number, and minimum 6 characters
    return regex.test(password);
  }

// Route to handle user registration
registerRouter.post('/', async (req, res) => {
    const { email, password, firstName, lastName, city } = req.body;


    // Validate password
    if (!validatePassword(password)) {
        return res.status(400).json({
          message:
            'Password must contain at least one capital letter, one number, and be at least 6 characters long.',
        });
      }

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

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error registering user:", error.message);

        // Handle duplicate email error
        if (error.code === '23505') { // Postgres unique violation error code
            res.status(400).json({ message: "Email already exists" });
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
        console.error("Error fetching users:", error.message);
        res.status(400).json({ message: error.message });
    }
});

module.exports = registerRouter; 


