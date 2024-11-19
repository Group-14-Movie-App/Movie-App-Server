const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());



//Routes Definition do here
const registerRouter = require('./routes/registerRoute.js');
app.use('/register', registerRouter);

const CreateGroupRouter = require('./routes/CreateGroupRoute.js');
app.use('/CreateGroup', CreateGroupRouter);

const reviewRouter = require('./routes/reviewRoute.js')
app.use('/reviews', reviewRouter)



const port = 5000
app.listen(port, ()=>
{
    console.log(`Server Listining to "http://localhost:${port}"`);
})