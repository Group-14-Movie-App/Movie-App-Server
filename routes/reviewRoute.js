const express = require('express');
const reviewRouter = express.Router();
const pool = require('../helpers/db.js');
const authenticateToken = require('../middleware/authenticateToken');

// Route to handle submitting a review
reviewRouter.post('/', authenticateToken, async (req, res) => {
  const { userID, movieTitle, releaseDate, description, rating } = req.body;

  // Validate that releaseDate is in the correct format (YYYY-MM-DD)
  const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex to match the format YYYY-MM-DD
  if (!regex.test(releaseDate)) {
    return res.status(400).json({ message: 'Invalid releaseDate format' });
  }

  // Extract release year from the releaseDate
  const releaseYear = new Date(releaseDate).getFullYear();

  try {
    // Check if the user already reviewed the same movie and release year
    const checkQuery = `
      SELECT * FROM Reviews 
      WHERE userID = $1 AND movieTitle = $2 AND EXTRACT(YEAR FROM releaseDate) = $3
    `;
    const checkResult = await pool.query(checkQuery, [userID, movieTitle, releaseYear]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: `You have already reviewed the movie "${movieTitle}" released in ${releaseYear}.`,
      });
    }

    // Insert the new review
    const query = `
      INSERT INTO Reviews (userID, movieTitle, releaseDate, description, rating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userID, movieTitle, releaseDate, description, rating];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Review added successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding review:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});






// Route to get all reviews (with optional filtering by movie title)
reviewRouter.get('/', authenticateToken, async (req, res) => {
  const { title, releaseDate } = req.query; // Get movie title and release year from query

  try {
    // Base query
    let query = `
      SELECT 
        r.reviewID, 
        r.userID, 
        r.movieTitle, 
        r.releaseDate, 
        r.description, 
        r.rating, 
        r.timestamp,
        u.firstName, 
        u.lastName 
      FROM Reviews r
      JOIN Users u ON r.userID = u.userID
    `;
    const values = [];

    // Add conditions based on provided filters
    if (title && releaseDate) {
      query += ` WHERE r.movieTitle = $1 AND EXTRACT(YEAR FROM r.releaseDate) = $2`;
      values.push(title, releaseDate);
    } else if (title) {
      query += ` WHERE r.movieTitle = $1`;
      values.push(title);
    }

    query += ' ORDER BY r.timestamp DESC'; // Order reviews by most recent

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});







// Route to update a review
reviewRouter.put('/:reviewID', authenticateToken, async (req, res) => {
  const { reviewID } = req.params;
  const { userID, description, rating } = req.body;

  try {
    // Ensure the review belongs to the logged-in user
    const checkQuery = 'SELECT * FROM Reviews WHERE reviewID = $1 AND userID = $2';
    const checkResult = await pool.query(checkQuery, [reviewID, userID]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }

    // Update the review
    const updateQuery = `
      UPDATE Reviews
      SET description = $1, rating = $2, timestamp = CURRENT_TIMESTAMP
      WHERE reviewID = $3
      RETURNING *;
    `;
    const values = [description, rating, reviewID];
    const updateResult = await pool.query(updateQuery, values);

    res.status(200).json({
      message: 'Review updated successfully',
      review: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating review:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a review
reviewRouter.delete('/:reviewID', authenticateToken, async (req, res) => {
  const { reviewID } = req.params;
  const { userID } = req.body;

  try {
    // Ensure the review belongs to the logged-in user
    const checkQuery = 'SELECT * FROM Reviews WHERE reviewID = $1 AND userID = $2';
    const checkResult = await pool.query(checkQuery, [reviewID, userID]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }

    // Delete the review
    const deleteQuery = 'DELETE FROM Reviews WHERE reviewID = $1';
    await pool.query(deleteQuery, [reviewID]);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Route to get reviews for the nearest production years or by movie name
reviewRouter.get('/nearest', authenticateToken, async (req, res) => {
  const { title, releaseDate } = req.query;

  if (!title) {
    return res.status(400).json({ message: "Missing movie title." });
  }

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  try {
    let result;

    if (releaseYear) {
      // Fetch reviews for the nearest years (±1 year)
      const nearestYearQuery = `
        SELECT 
          r.reviewID, 
          r.userID, 
          r.movieTitle, 
          r.releaseDate, 
          r.description, 
          r.rating, 
          r.timestamp,
          u.firstName, 
          u.lastName 
        FROM Reviews r
        JOIN Users u ON r.userID = u.userID
        WHERE r.movieTitle = $1 AND EXTRACT(YEAR FROM r.releaseDate) BETWEEN $2 AND $3
        ORDER BY ABS(EXTRACT(YEAR FROM r.releaseDate) - $4), r.timestamp DESC
      `;
      const nearestYearValues = [title, releaseYear - 1, releaseYear + 1, releaseYear];
      result = await pool.query(nearestYearQuery, nearestYearValues);
    }

    if (!result || result.rows.length === 0) {
      console.warn(`No reviews found for nearest years. Attempting to fetch reviews by movie name: ${title}`);

      // Fallback: Fetch reviews for the same movie name (ignoring year)
      const nameQuery = `
        SELECT 
          r.reviewID, 
          r.userID, 
          r.movieTitle, 
          r.releaseDate, 
          r.description, 
          r.rating, 
          r.timestamp,
          u.firstName, 
          u.lastName 
        FROM Reviews r
        JOIN Users u ON r.userID = u.userID
        WHERE TRIM(LOWER(r.movieTitle)) = TRIM(LOWER($1))
        ORDER BY r.timestamp DESC
      `;
      const nameValues = [title];
      result = await pool.query(nameQuery, nameValues);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No reviews found for the given title or nearest years." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});




// Route to get all public reviews (accessible without authentication)
reviewRouter.get('/public', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.reviewID, 
        r.userID, 
        r.movieTitle, 
        r.releaseDate, 
        r.description, 
        r.rating, 
        r.timestamp,
        u.firstName, 
        u.lastName 
      FROM Reviews r
      JOIN Users u ON r.userID = u.userID
    `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No reviews found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching public reviews:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = reviewRouter;
