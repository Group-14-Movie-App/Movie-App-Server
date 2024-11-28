const express = require('express');
const favoritesRouter = express.Router();
const pool = require('../helpers/db.js');

// Route to get favorite groups for a user
favoritesRouter.get('/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const query = `
      SELECT favoriteID, name
      FROM Favorites
      WHERE userID = $1
    `;
    const result = await pool.query(query, [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No favorite groups found for this user.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite groups:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add a new favorite group
favoritesRouter.post('/', async (req, res) => {
  const { userID, name } = req.body;

  try {
    const query = `
      INSERT INTO Favorites (userID, name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [userID, name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding favorite group:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Route to fetch favorite groups for a specific user
favoritesRouter.get('/', async (req, res) => {
  const { userID } = req.query; // Extract userID from query parameters

  if (!userID) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const query = `
      SELECT favoriteID, name
      FROM Favorites
      WHERE userID = $1
    `;
    const result = await pool.query(query, [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No favorite groups found.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite groups:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to fetch movies in a specific favorite group
favoritesRouter.get('/movies/:favoriteID', async (req, res) => {
  const { favoriteID } = req.params;

  try {
    const query = `
      SELECT 
        fm.movieTitle AS movietitle,
        fm.releaseYear AS releaseyear
      FROM FavoriteMovies fm
      WHERE fm.favoriteID = $1
    `;
    const result = await pool.query(query, [favoriteID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No movies found in this group.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching movies in favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to fetch favorite groups with movie counts for a user
favoritesRouter.get('/with-movie-count/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const query = `
      SELECT 
        f.favoriteID, 
        f.name, 
        COUNT(fm.favoriteMovieID) AS movie_count
      FROM Favorites f
      LEFT JOIN FavoriteMovies fm ON f.favoriteID = fm.favoriteID
      WHERE f.userID = $1
      GROUP BY f.favoriteID
    `;
    const result = await pool.query(query, [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No favorite groups found.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite groups with movie counts:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = favoritesRouter;
