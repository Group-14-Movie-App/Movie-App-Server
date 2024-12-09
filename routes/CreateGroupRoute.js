const express = require("express");
const createGroupRouter = express.Router();
const pool = require("../helpers/db");
const authenticateToken = require("../middleware/authenticateToken");

// Route to create a new group
createGroupRouter.post("/", authenticateToken, async (req, res) => {
  const { groupName, description } = req.body;
  const ownerID = req.user.userid; // Extract ownerID from the token payload

  if (!groupName) {
    return res.status(400).json({ message: "Group name is required." });
  }

  try {
    // Check if the user already owns a group
    const checkQuery = `SELECT * FROM Groups WHERE ownerID = $1`;
    const checkResult = await pool.query(checkQuery, [ownerID]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "You can only create one group." });
    }

    // Create a new group
    const insertQuery = `
      INSERT INTO Groups (groupName, description, ownerID)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [groupName, description || null, ownerID];
    const result = await pool.query(insertQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating group:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = createGroupRouter;
