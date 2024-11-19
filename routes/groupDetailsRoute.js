const express = require('express')
const groupDetailsRouter = express.Router();
const pool = require('../helpers/db.js'); //Database connection pool


groupDetailsRouter.get('/', async(req,res) =>
{
    const queryResult = await pool.query('SELECT * FROM USERS')

    res.status(200).json(queryResult)

})

module.exports = groupDetailsRouter;