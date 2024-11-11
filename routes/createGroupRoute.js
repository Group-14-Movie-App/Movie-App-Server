const express = require('express');
const createGroupRouter = express.Router();

const pool = require('../helpers/db.js');


//This Part Should Be Moved To Group List Page Related Code
createGroupRouter.get('/', async(req,res)=>
{
    try
    {
        console.log("Ok")
        const queryResult = await pool.query("SELECT * FROM GroupTable")

        res.status(200).json(queryResult.rows);

    }

    catch(error)
    {
        res.status(400).json({message: error.message})
    }

    
})



// This is the Related Code Part
createGroupRouter.post('/', async(req,res)=>
    {
        try
        {
            console.log(req.body.group_name);
            
            const queryResult = await pool.query("INSERT INTO GroupTable (groupName, ownerID) VALUES ($1,$2)", [req.body.group_name, req.body.owner_id])
    
            res.status(200).json(queryResult);
    
        }
    
        catch(error)
        {
            res.status(400).json({message: error.message})
        }
    
        
    })


module.exports = createGroupRouter;