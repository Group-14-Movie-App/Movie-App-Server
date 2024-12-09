const express = require("express");
const otherGroupDetailsRouter = express.Router();
const pool = require("../helpers/db.js");
const authenticateToken = require("../middleware/authenticateToken");

// Get group details
otherGroupDetailsRouter.get("/:groupID", authenticateToken, async (req, res) => {
  const { groupID } = req.params;

  try {
    const query = `
      SELECT groupID, groupName, description
      FROM Groups
      WHERE groupID = $1
    `;
    const result = await pool.query(query, [groupID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Group not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get user's relationship with a group (member or pending request)
otherGroupDetailsRouter.get("/:groupID/status", authenticateToken, async (req, res) => {
  const { groupID } = req.params;
  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Check if the user is a member
    const memberQuery = `
      SELECT * FROM GroupMembers
      WHERE groupID = $1 AND userID = $2 AND isPending = FALSE
    `;
    const memberResult = await pool.query(memberQuery, [groupID, userID]);

    if (memberResult.rows.length > 0) {
      return res.status(200).json({ status: "member" });
    }

    // Check if the user has a pending request
    const pendingQuery = `
      SELECT * FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    const pendingResult = await pool.query(pendingQuery, [groupID, userID]);

    if (pendingResult.rows.length > 0) {
      return res.status(200).json({ status: "pending" });
    }

    res.status(200).json({ status: null }); // No association
  } catch (error) {
    console.error("Error fetching relationship status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Cancel a pending join request
otherGroupDetailsRouter.delete("/:groupID/cancel-request", authenticateToken, async (req, res) => {
  const { groupID } = req.params;
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const query = `
      DELETE FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    const result = await pool.query(query, [groupID, userID]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Join request not found." });
    }

    res.status(200).json({ message: "Join request canceled successfully." });
  } catch (error) {
    console.error("Error canceling join request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = otherGroupDetailsRouter;
