// For backend deployment test
require("dotenv").config();
// For database deployment test
const pool = require("./helpers/db.js");

const express = require("express");
const app = express();

// For backend deployment test
const dbHost = process.env.DB_HOST || "no-database";
if (dbHost === "no-database") {
  console.log("Warning: No database connected, using mock data.");
}

const cors = require("cors");
app.use(cors());

app.use(express.json());

const bodyParser = require("body-parser"); // Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For Backend Deployment test
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend running!",
  });
});

// For database Deployment test
app.get("/api/tasks", async (req, res) => {
  try {
    const query = "SELECT * FROM users";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

//Routes Definition do here
const registerRouter = require("./routes/registerRoute.js");
app.use("/register", registerRouter);

const reviewRouter = require("./routes/reviewRoute.js");
app.use("/reviews", reviewRouter);

const signinRouter = require("./routes/signinRoute.js");
app.use("/signin", signinRouter);

const profileRouter = require("./routes/profileRoute.js");
app.use("/profile", profileRouter);

const favoritesRouter = require("./routes/favoritesRoute.js");
app.use("/favorites", favoritesRouter);

const favoriteMoviesRouter = require("./routes/favoriteMoviesRoute.js");
app.use("/favorite-movies", favoriteMoviesRouter);

const CreateGroupRouter = require("./routes/CreateGroupRoute.js");
app.use("/groups", CreateGroupRouter);

const myGroupsRouter = require("./routes/myGroupsRoute.js");
app.use("/my-groups", myGroupsRouter);

const mygroupDetailsRouter = require("./routes/mygroupDetailsRoute.js");
app.use("/groups", mygroupDetailsRouter);

const allGroupsRouter = require("./routes/allGroupsRoute.js");
app.use("/all-groups", allGroupsRouter);

const groupJoinRequestsRouter = require("./routes/groupJoinRequestsRoute.js");
app.use("/group-join-requests", groupJoinRequestsRouter);

const otherGroupDetailsRouter = require("./routes/otherGroupDetailsRoute.js");
app.use("/other-groups", otherGroupDetailsRouter);

const otherGroupPostsRouter = require("./routes/otherGroupPostsRoute.js");
app.use("/group-posts", otherGroupPostsRouter);

const myGroupPostsRouter = require("./routes/myGroupPostsRoute.js");
app.use("/my-group-posts", myGroupPostsRouter);

const chatbotRouter = require("./routes/chatbot.js");
app.use("/chatbot", chatbotRouter);

const signoutRouter = require("./routes/signoutRoute.js");
app.use("/signout", signoutRouter);


//export app for testing
module.exports = app;

// Deployment Test (start the server only when not in test mode)
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}
