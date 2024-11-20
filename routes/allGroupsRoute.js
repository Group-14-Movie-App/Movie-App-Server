const express = require('express');
const allGroupsRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// Route to fetch all groups
allGroupsRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Groups');
        res.status(200).json({
            message: "All groups fetched successfully",
            groups: result.rows, // Make sure groups are being sent in the response
        });
    } catch (error) {
        console.error("Error fetching all groups:", error.message);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
});

module.exports = allGroupsRouter;