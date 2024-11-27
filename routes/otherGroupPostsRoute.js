const express = require("express");
const otherGroupPostsRouter = express.Router();
const pool = require("../helpers/db.js");

// Get all posts for a group
otherGroupPostsRouter.get("/:groupID", async (req, res) => {
    const { groupID } = req.params;
  
    try {
      const ownerQuery = `SELECT ownerID FROM Groups WHERE groupID = $1`;
      const ownerResult = await pool.query(ownerQuery, [groupID]);
  
      if (ownerResult.rows.length === 0) {
        return res.status(404).json({ message: "Group not found." });
      }
  
      const postsQuery = `
        SELECT gp.postID, gp.content, gp.userID, u.firstName, u.lastName
        FROM GroupPosts gp
        JOIN Users u ON gp.userID = u.userID
        WHERE gp.groupID = $1
        ORDER BY gp.postID DESC
      `;
      const postsResult = await pool.query(postsQuery, [groupID]);
  
      res.status(200).json({
        posts: postsResult.rows,
        ownerID: ownerResult.rows[0].ownerid,
      });
    } catch (error) {
      console.error("Error fetching group posts:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  

// Add a new post to a group
otherGroupPostsRouter.post("/:groupID/add-post", async (req, res) => {
    const { groupID } = req.params;
    const { userID, content } = req.body;

    console.log("Add Post Request:", { groupID, userID, content });

    if (!userID || !content) {
        return res.status(400).json({ message: "User ID and content are required." });
    }

    try {
        const membershipQuery = `
            SELECT * FROM GroupMembers
            WHERE groupID = $1 AND userID = $2 AND isPending = FALSE
        `;
        const membershipResult = await pool.query(membershipQuery, [groupID, userID]);

        console.log("Membership Check:", membershipResult.rows);

        if (membershipResult.rows.length === 0) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        const insertQuery = `
            INSERT INTO GroupPosts (groupID, userID, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [groupID, userID, content]);

        console.log("Post Added:", result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error Adding Post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



// Delete a user's own post
otherGroupPostsRouter.delete("/:groupID/:postID", async (req, res) => {
  const { groupID, postID } = req.params;
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Check if the post belongs to the user
    const ownershipQuery = `
      SELECT * FROM GroupPosts
      WHERE postID = $1 AND userID = $2 AND groupID = $3
    `;
    const ownershipResult = await pool.query(ownershipQuery, [postID, userID, groupID]);

    if (ownershipResult.rows.length === 0) {
      return res.status(403).json({ message: "You are not authorized to delete this post." });
    }

    // Delete the post
    const deleteQuery = `
      DELETE FROM GroupPosts
      WHERE postID = $1
    `;
    await pool.query(deleteQuery, [postID]);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting group post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Edit a user's own post
otherGroupPostsRouter.put("/:groupID/edit-post", async (req, res) => {
    const { groupID } = req.params;
    const { postID, content } = req.body;
  
    if (!postID || !content) {
      return res.status(400).json({ message: "Post ID and content are required." });
    }
  
    try {
      const query = `
        UPDATE GroupPosts
        SET content = $1
        WHERE postID = $2 AND groupID = $3
        RETURNING *
      `;
      const result = await pool.query(query, [content, postID, groupID]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Post not found or not editable." });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error editing post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  






module.exports = otherGroupPostsRouter;
