require('dotenv').config();

const {Pool} = require('pg');



const pool = new Pool(
    {
        database: process.env.DB_NAME,
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,

        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        ssl: process.env.BACKEND_DEPLOYMENT === 'true'
        ? { rejectUnauthorized: false } // For Backend deployment
        : process.env.SSL // Use `SSL` environment variable for other cases
    }
)

module.exports = pool;