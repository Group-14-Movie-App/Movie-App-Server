const express = require('express');
const profileRouter = express.Router();
const pool = require('../helpers/db.js');

// Route to get user profile details
profileRouter.get('/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Fetch user details
    const userDetailsQuery = `
      SELECT userID, email, firstName, lastName, city, isAdmin
      FROM Users
      WHERE userID = $1;
    `;
    const userDetailsResult = await pool.query(userDetailsQuery, [userID]);

    if (userDetailsResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDetails = userDetailsResult.rows[0];

    // Fetch user reviews
    const userReviewsQuery = `
      SELECT reviewID, movieTitle, releaseDate, description, rating, timestamp
      FROM Reviews
      WHERE userID = $1
      ORDER BY timestamp DESC;
    `;
    const userReviewsResult = await pool.query(userReviewsQuery, [userID]);

    // Fetch user favorites
    const userFavoritesQuery = `
      SELECT f.name AS favoriteName, fm.movieID
      FROM Favorites f
      JOIN FavoriteMovies fm ON f.favoriteID = fm.favoriteID
      WHERE f.userID = $1;
    `;
    const userFavoritesResult = await pool.query(userFavoritesQuery, [userID]);

    res.status(200).json({
      userDetails,
      userReviews: userReviewsResult.rows,
      userFavorites: userFavoritesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to update user profile details
profileRouter.put('/:userID', async (req, res) => {
  const { userID } = req.params;
  const { email, firstName, lastName, city } = req.body;

  if (!userID) {
    console.error("User ID is missing in the request.");
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const updateUserQuery = `
      UPDATE Users
      SET email = $1, firstName = $2, lastName = $3, city = $4
      WHERE userID = $5
      RETURNING userID, email, firstName, lastName, city;
    `;
    const result = await pool.query(updateUserQuery, [email, firstName, lastName, city, userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Route to delete user profile
profileRouter.delete('/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    // Start a transaction to safely delete user and their related data
    await pool.query('BEGIN');

    // Delete related data (e.g., reviews, favorites, group memberships, etc.)
    const deleteReviewsQuery = `DELETE FROM Reviews WHERE userID = $1`;
    await pool.query(deleteReviewsQuery, [userID]);

    const deleteFavoritesQuery = `DELETE FROM Favorites WHERE userID = $1`;
    await pool.query(deleteFavoritesQuery, [userID]);

    const deleteGroupMembersQuery = `
      DELETE FROM GroupMembers WHERE userID = $1
    `;
    await pool.query(deleteGroupMembersQuery, [userID]);

    const deleteGroupJoinRequestsQuery = `
      DELETE FROM GroupJoinRequests WHERE userID = $1
    `;
    await pool.query(deleteGroupJoinRequestsQuery, [userID]);

    const deleteGroupPostsQuery = `
      DELETE FROM GroupPosts WHERE userID = $1
    `;
    await pool.query(deleteGroupPostsQuery, [userID]);

    // Delete the user profile
    const deleteUserQuery = `DELETE FROM Users WHERE userID = $1`;
    const deleteResult = await pool.query(deleteUserQuery, [userID]);

    if (deleteResult.rowCount === 0) {
      // If no rows were deleted, the user doesn't exist
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    // Commit the transaction
    await pool.query('COMMIT');
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error.message);
    // Rollback the transaction in case of an error
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = profileRouter;
