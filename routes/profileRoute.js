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

module.exports = profileRouter;
