const express = require("express");
const allGroupsRouter = express.Router();
const pool = require("../helpers/db.js");

// Route to fetch all groups, excluding the user's own group
allGroupsRouter.get("/", async (req, res) => {
  try {
    const query = `
      SELECT groupID, groupName, description, ownerID
      FROM Groups
      ORDER BY groupName ASC
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching all groups:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle sending a join request
allGroupsRouter.post("/group-join-requests", async (req, res) => {
  const { groupID, userID } = req.body;

  if (!groupID || !userID) {
    return res.status(400).json({ message: "Group ID and User ID are required." });
  }

  try {
    // Check if the user is already a member of the group
    const membershipCheckQuery = `
      SELECT * FROM GroupMembers
      WHERE groupID = $1 AND userID = $2
    `;
    const membershipCheckResult = await pool.query(membershipCheckQuery, [groupID, userID]);

    if (membershipCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "You are already a member of this group." });
    }

    // Check if a request has already been sent
    const requestCheckQuery = `
      SELECT * FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    const requestCheckResult = await pool.query(requestCheckQuery, [groupID, userID]);

    if (requestCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "A join request has already been sent to this group." });
    }

    // Insert the join request into the GroupJoinRequests table
    const insertQuery = `
      INSERT INTO GroupJoinRequests (groupID, userID)
      VALUES ($1, $2)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [groupID, userID]);

    res.status(201).json({ message: "Join request sent successfully.", request: insertResult.rows[0] });
  } catch (error) {
    console.error("Error sending join request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Route to fetch user group statuses
allGroupsRouter.get("/user-status/:userID", async (req, res) => {
    const { userID } = req.params;
  
    if (!userID) {
      return res.status(400).json({ message: "User ID is required." });
    }
  
    try {
      const query = `
        SELECT 
          g.groupID,
          CASE 
            WHEN gm.userID IS NOT NULL THEN 'member'
            WHEN gjr.userID IS NOT NULL THEN 'pending'
            ELSE 'none'
          END AS status
        FROM Groups g
        LEFT JOIN GroupMembers gm ON g.groupID = gm.groupID AND gm.userID = $1
        LEFT JOIN GroupJoinRequests gjr ON g.groupID = gjr.groupID AND gjr.userID = $1
      `;
      const result = await pool.query(query, [userID]);
  
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching user group statuses:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Cancel a join request
allGroupsRouter.delete("/:groupID/cancel-request", async (req, res) => {
    const { groupID } = req.params;
    const { userID } = req.body; // Expect the userID in the request body
  
    if (!groupID || !userID) {
      return res.status(400).json({ message: "Group ID and User ID are required." });
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
      console.error("Error canceling join request:", error.message);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  
  





module.exports = allGroupsRouter;
