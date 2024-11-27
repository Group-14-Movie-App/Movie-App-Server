const express = require("express");
const myGroupPostsRouter = express.Router();
const pool = require("../helpers/db.js");

// Fetch all posts for a group
myGroupPostsRouter.get("/:groupID", async (req, res) => {
    const { groupID } = req.params;
  
    try {
      const ownerQuery = `SELECT ownerID FROM Groups WHERE groupID = $1`;
      const ownerResult = await pool.query(ownerQuery, [groupID]);
      if (ownerResult.rows.length === 0) {
        return res.status(404).json({ message: "Group not found." });
      }
  
      const postsQuery = `
        SELECT p.postID, p.content, p.userID, u.firstName, u.lastName
        FROM GroupPosts p
        JOIN Users u ON p.userID = u.userID
        WHERE p.groupID = $1
        ORDER BY p.postID DESC
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
  

// Add a new post
myGroupPostsRouter.post("/:groupID/add-post", async (req, res) => {
    const { groupID } = req.params;
    const { userID, content } = req.body;
  
    if (!content.trim()) {
      return res.status(400).json({ message: "Content cannot be empty." });
    }
  
    if (!userID) {
      return res.status(400).json({ message: "User ID is required." });
    }
  
    try {
      // Check if the user is the admin or a member
      const adminQuery = `
        SELECT * FROM Groups WHERE groupID = $1 AND ownerID = $2
      `;
      const adminResult = await pool.query(adminQuery, [groupID, userID]);
  
      if (adminResult.rows.length === 0) {
        const memberQuery = `
          SELECT * FROM GroupMembers
          WHERE groupID = $1 AND userID = $2 AND isPending = FALSE
        `;
        const memberResult = await pool.query(memberQuery, [groupID, userID]);
  
        if (memberResult.rows.length === 0) {
          return res.status(403).json({ message: "You are not a member of this group." });
        }
      }
  
      // Insert the post
      const insertQuery = `
        INSERT INTO GroupPosts (groupID, userID, content)
        VALUES ($1, $2, $3)
        RETURNING postID, content, groupID, userID
      `;
      const postResult = await pool.query(insertQuery, [groupID, userID, content]);
  
      // Fetch the user's name
      const userQuery = `
        SELECT firstName, lastName FROM Users WHERE userID = $1
      `;
      const userResult = await pool.query(userQuery, [userID]);
  
      if (userResult.rows.length === 0) {
        return res.status(500).json({ message: "Failed to fetch user details." });
      }
  
      const newPost = {
        ...postResult.rows[0],
        firstName: userResult.rows[0].firstname,
        lastName: userResult.rows[0].lastname,
      };
  
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error adding post:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  
  
  

// Delete a post
myGroupPostsRouter.delete("/:groupID/delete-post", async (req, res) => {
  const { groupID } = req.params;
  const { postID } = req.body;

  try {
    const query = `
      DELETE FROM GroupPosts
      WHERE groupID = $1 AND postID = $2
    `;
    const result = await pool.query(query, [groupID, postID]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Edit a post
myGroupPostsRouter.put("/:groupID/edit-post", async (req, res) => {
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
  



module.exports = myGroupPostsRouter;
