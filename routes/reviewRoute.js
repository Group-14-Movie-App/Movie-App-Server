const express = require('express');
const reviewRouter = express.Router();
const pool = require('../helpers/db.js');

// Route to handle submitting a review
reviewRouter.post('/', async (req, res) => {
    const { userID, movieTitle, releaseDate, description, rating } = req.body;
  
    // Validate that releaseDate is in the correct format (YYYY-MM-DD)
    const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex to match the format YYYY-MM-DD
    if (!regex.test(releaseDate)) {
      return res.status(400).json({ message: 'Invalid releaseDate format' });
    }
  
    try {
      // Check if the user already reviewed the same movie
      const checkQuery = `
        SELECT * FROM Reviews 
        WHERE userID = $1 AND movieTitle = $2
      `;
      const checkResult = await pool.query(checkQuery, [userID, movieTitle]);
  
      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          message: `You have already reviewed the movie "${movieTitle}".`,
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

// Route to get all reviews
reviewRouter.get('/', async (req, res) => {
    const { title } = req.query; // Get movie title from query
    try {
      let query = 'SELECT * FROM Reviews';
      const values = [];
  
      if (title) {
        query += ' WHERE movietitle = $1';
        values.push(title);
      }
  
      const result = await pool.query(query, values);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = reviewRouter;
