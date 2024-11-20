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

const groupDetailsRouter = require('./routes/groupDetailsRoute.js');
app.use('/groupDetails',groupDetailsRouter)

const reviewRouter = require('./routes/reviewRoute.js')
app.use('/reviews', reviewRouter)

const signinRouter = require('./routes/signinRoute.js');
app.use('/signin', signinRouter);

const allGroupsRouter = require('./routes/allGroupsRoute.js');
app.use('/api/all-groups', allGroupsRouter);

const myGroupsRouter = require('./routes/myGroupsRoute.js');
app.use('/api/my-groups', myGroupsRouter);


const port = 5000
app.listen(port, ()=>
{
    console.log(`Server Listining to "http://localhost:${port}"`);
})