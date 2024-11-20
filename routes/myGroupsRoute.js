const express = require('express');
const myGroupsRouter = express.Router();
const pool = require('../helpers/db.js'); // Database connection pool

// Route to fetch groups joined by the user
myGroupsRouter.get('/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const query = `
            SELECT g.groupID, g.groupName, g.description, g.ownerID
            FROM Groups g
            INNER JOIN UserGroups ug ON g.groupID = ug.groupID
            WHERE ug.userID = $1
        `;
        const values = [userID];
        const result = await pool.query(query, values);

        res.status(200).json({
            message: "My groups fetched successfully",
            groups: result.rows,
        });
    } catch (error) {
        console.error("Error fetching my groups:", error.message);
        res.status(500).json({ message: "Error fetching my groups" });
    }
});

module.exports = myGroupsRouter;
