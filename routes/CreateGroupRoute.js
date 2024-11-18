const express = require('express');
const createGroupRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// Route to create a new group
createGroupRouter.post('/', async (req, res) => {
    const { groupName, description, ownerID } = req.body;

    try {
        // Insert group into the Groups table
        const query = `
            INSERT INTO Groups (groupName, description, ownerID) 
            VALUES ($1, $2, $3) 
            RETURNING groupID, groupName, description, ownerID
        `;
        const values = [groupName, description, ownerID];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Group created successfully",
            group: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating group:", error.message);
        res.status(400).json({ message: error.message });
    }
});

module.exports = createGroupRouter;