const express = require('express');
const favoritesRouter = express.Router();
const pool = require('../helpers/db.js');
const authenticateToken = require('../middleware/authenticateToken');

// Route to get favorite groups for a user
favoritesRouter.get('/', authenticateToken, async (req, res) => {
  const { userID } = req.query;

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

// Route to add a new favorite group
favoritesRouter.post('/', authenticateToken, async (req, res) => {
  const { userID, name } = req.body;

  if (!name.trim()) {
    return res.status(400).json({ message: 'Group name cannot be empty.' });
  }

  try {
    const query = `
      INSERT INTO Favorites (userID, name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [userID, name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation code for Postgres
      return res.status(400).json({ message: 'A group with this name already exists.' });
    }
    console.error('Error adding favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch movies in a specific favorite group
favoritesRouter.get('/movies/:favoriteID', authenticateToken, async (req, res) => {
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
favoritesRouter.get('/with-movie-count/:userID', authenticateToken, async (req, res) => {
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

// Route to update a favorite group name
favoritesRouter.put('/:favoriteID', authenticateToken, async (req, res) => {
  const { favoriteID } = req.params;
  const { name } = req.body;

  if (!name.trim()) {
    return res.status(400).json({ message: 'Group name cannot be empty.' });
  }

  try {
    const query = `
      UPDATE Favorites
      SET name = $1
      WHERE favoriteID = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [name, favoriteID]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Favorite group not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a favorite group
favoritesRouter.delete('/:favoriteID', authenticateToken, async (req, res) => {
  const { favoriteID } = req.params;

  try {
    const query = `
      DELETE FROM Favorites
      WHERE favoriteID = $1
    `;
    const result = await pool.query(query, [favoriteID]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Favorite group not found.' });
    }

    res.status(200).json({ message: 'Favorite group deleted successfully.' });
  } catch (error) {
    console.error('Error deleting favorite group:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Route to fetch favorite group details without authentication
favoritesRouter.get('/public/:favoriteID', async (req, res) => {
  const { favoriteID } = req.params;

  try {
    const query = `
      SELECT 
        f.name AS groupName, 
        fm.movieTitle AS movietitle,
        fm.releaseYear AS releaseyear
      FROM Favorites f
      LEFT JOIN FavoriteMovies fm ON f.favoriteID = fm.favoriteID
      WHERE f.favoriteID = $1
    `;
    const result = await pool.query(query, [favoriteID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No data found for this favorite group.' });
    }

    const groupName = result.rows[0].groupname; // Extract the group name
    const movies = result.rows.map((row) => ({
      movietitle: row.movietitle,
      releaseyear: row.releaseyear,
    }));

    res.status(200).json({ groupName, movies });
  } catch (error) {
    console.error('Error fetching public favorite group data:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



module.exports = favoritesRouter;
