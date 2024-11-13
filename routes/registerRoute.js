const express = require('express');
const registerRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// Route to handle user registration
registerRouter.post('/', async (req, res) => {
    const { email, password, firstName, lastName, city } = req.body;

    try {
        // Insert user into the Users table
        const query = `
            INSERT INTO Users (email, password, firstName, lastName, city) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING userID, email, firstName, lastName, city
        `;
        const values = [email, password, firstName, lastName, city];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(400).json({ message: error.message });
    }
});

// Route to get all registered users
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
