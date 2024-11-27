const express = require("express");
const createGroupRouter = express.Router();
const pool = require("../helpers/db");

// Route to create a new group
createGroupRouter.post("/", async (req, res) => {
  const { groupName, description, ownerID } = req.body;

  if (!groupName || !ownerID) {
    return res.status(400).json({ message: "Group name and owner ID are required." });
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
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = createGroupRouter;
