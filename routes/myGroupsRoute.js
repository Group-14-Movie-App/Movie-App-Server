const express = require("express");
const myGroupsRouter = express.Router();
const pool = require("../helpers/db");
const authenticateToken = require("../middleware/authenticateToken");

// Route to fetch user's created groups
myGroupsRouter.get("/", authenticateToken, async (req, res) => {
  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const query = `SELECT * FROM Groups WHERE ownerID = $1`;
    const result = await pool.query(query, [userID]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching user's groups:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to delete a user's group
myGroupsRouter.delete("/:groupID", authenticateToken, async (req, res) => {
  const { groupID } = req.params;

  if (!groupID) {
    return res.status(400).json({ message: "Group ID is required." });
  }

  try {
    // Delete all group members first to avoid foreign key constraint errors
    const deleteMembersQuery = `
      DELETE FROM GroupMembers
      WHERE groupID = $1
    `;
    await pool.query(deleteMembersQuery, [groupID]);

    // Delete all join requests for the group
    const deleteJoinRequestsQuery = `
      DELETE FROM GroupJoinRequests
      WHERE groupID = $1
    `;
    await pool.query(deleteJoinRequestsQuery, [groupID]);

    // Delete the group itself
    const deleteGroupQuery = `
      DELETE FROM Groups
      WHERE groupID = $1
    `;
    const result = await pool.query(deleteGroupQuery, [groupID]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Group not found." });
    }

    res.status(200).json({ message: "Group deleted successfully." });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = myGroupsRouter;
