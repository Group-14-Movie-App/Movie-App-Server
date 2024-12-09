const express = require('express');
const favoriteMoviesRouter = express.Router();
const pool = require('../helpers/db.js');
const authenticateToken = require('../middleware/authenticateToken');

// Route to add a movie to a favorite group
favoriteMoviesRouter.post('/', authenticateToken, async (req, res) => {
  const { favoriteID, movieTitle, releaseDate } = req.body;

  console.log("Received payload:", { favoriteID, movieTitle, releaseDate }); // Debugging log

  if (!favoriteID || !movieTitle || !releaseDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Extract the release year
  const releaseYear = new Date(releaseDate).getFullYear();

  try {
    // Check if the movie already exists in the favorite group
    const checkQuery = `
      SELECT * FROM FavoriteMovies 
      WHERE favoriteID = $1 AND movieTitle = $2 AND releaseYear = $3
    `;
    const checkResult = await pool.query(checkQuery, [favoriteID, movieTitle, releaseYear]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        message: `The movie "${movieTitle}" (released in ${releaseYear}) is already in this favorite group.` 
      });
    }

    // Insert the movie into the favorite group
    const insertQuery = `
      INSERT INTO FavoriteMovies (favoriteID, movieTitle, releaseYear)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [favoriteID, movieTitle, releaseYear]);

    res.status(201).json({ 
      message: 'Movie added to favorite group successfully.',
      favoriteMovie: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding movie to favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Route to fetch movies from a favorite group
favoriteMoviesRouter.get('/:favoriteID', authenticateToken, async (req, res) => {
  const { favoriteID } = req.params;

  try {
    const query = `
      SELECT movieTitle, releaseYear 
      FROM FavoriteMovies 
      WHERE favoriteID = $1
    `;
    const result = await pool.query(query, [favoriteID]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite movies:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to remove a movie from a favorite group
favoriteMoviesRouter.delete('/:favoriteID', authenticateToken, async (req, res) => {
  const { favoriteID } = req.params;
  const { movieTitle, releaseYear } = req.query;

  if (!favoriteID || !movieTitle) {
    return res.status(400).json({ message: 'FavoriteID and movieTitle are required.' });
  }

  try {
    console.log("Received payload:", { favoriteID, movieTitle, releaseYear });

    // Query to match only on favoriteID and movieTitle if releaseYear mismatch occurs
    const deleteQuery = `
      DELETE FROM FavoriteMovies
      WHERE favoriteID = $1 
        AND TRIM(LOWER(movieTitle)) = TRIM(LOWER($2))
        AND (releaseYear = $3 OR releaseYear IS NULL OR releaseYear = 1970)
      RETURNING *;
    `;
    const queryParams = [favoriteID, movieTitle, releaseYear];

    const result = await pool.query(deleteQuery, queryParams);

    if (result.rowCount === 0) {
      console.error("Movie not found for deletion.");
      return res.status(404).json({ message: 'Movie not found in the favorite group.' });
    }

    res.status(200).json({
      message: 'Movie removed successfully.',
      deletedMovie: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting movie from favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});






module.exports = favoriteMoviesRouter;
