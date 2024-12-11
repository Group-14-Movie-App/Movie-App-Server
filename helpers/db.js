require('dotenv').config();

const {Pool} = require('pg');



const pool = new Pool(
    {
        database: process.env.DB_NAME,
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,

        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        ssl:process.env.SSL
    }
)

module.exports = pool;