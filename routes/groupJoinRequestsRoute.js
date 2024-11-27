const express = require('express');
const groupJoinRequestsRouter = express.Router();
const pool = require('../helpers/db.js');

// Route to handle sending a join request
groupJoinRequestsRouter.post('/', async (req, res) => {
    const { userID, groupID } = req.body;

    if (!userID || !groupID) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user is already a member of the group
        const memberCheckQuery = `
            SELECT * FROM GroupMembers
            WHERE userID = $1 AND groupID = $2
        `;
        const memberCheckResult = await pool.query(memberCheckQuery, [userID, groupID]);

        if (memberCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'You are already a member of this group.' });
        }

        // Check if a join request already exists
        const requestCheckQuery = `
            SELECT * FROM GroupJoinRequests
            WHERE userID = $1 AND groupID = $2
        `;
        const requestCheckResult = await pool.query(requestCheckQuery, [userID, groupID]);

        if (requestCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'Join request already sent.' });
        }

        // Insert the join request
        const insertQuery = `
            INSERT INTO GroupJoinRequests (userID, groupID)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [userID, groupID]);

        res.status(201).json({ message: 'Join request sent successfully.', request: result.rows[0] });
    } catch (error) {
        console.error('Error sending join request:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = groupJoinRequestsRouter;
