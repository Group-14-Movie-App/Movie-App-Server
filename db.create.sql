-- Drop tables if they exist (to refresh the database)
DROP TABLE IF EXISTS GroupJoinRequests;
DROP TABLE IF EXISTS GroupPosts;
DROP TABLE IF EXISTS GroupMembers;
DROP TABLE IF EXISTS Groups;
DROP TABLE IF EXISTS FavoriteMovies;
DROP TABLE IF EXISTS Favorites;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Users;

-- Create Users Table
CREATE TABLE Users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    city VARCHAR(100),
    isAdmin BOOLEAN DEFAULT FALSE
);

-- Create Reviews Table
CREATE TABLE Reviews (
    reviewID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    movieTitle VARCHAR(255) NOT NULL, -- Movie title to uniquely identify
    releaseDate DATE NOT NULL,        -- Release date to distinguish movies with the same title
    description TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Favorites Table
CREATE TABLE Favorites (
    favoriteID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- Create FavoriteMovies Table
CREATE TABLE FavoriteMovies (
    favoriteMovieID SERIAL PRIMARY KEY,
    favoriteID INT REFERENCES Favorites(favoriteID) ON DELETE CASCADE,
    movieTitle VARCHAR(255) NOT NULL, -- Movie title
    releaseYear INT NOT NULL          -- Movie release year
);

-- Create Groups Table
CREATE TABLE Groups (
    groupID SERIAL PRIMARY KEY,
    groupName VARCHAR(255) NOT NULL,
    description TEXT,
    ownerID INT REFERENCES Users(userID) ON DELETE CASCADE
);

-- Create GroupMembers Table
CREATE TABLE GroupMembers (
    groupMemberID SERIAL PRIMARY KEY,
    groupID INT REFERENCES Groups(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    isPending BOOLEAN DEFAULT TRUE
);


-- Create GroupPosts Table
CREATE TABLE GroupPosts (
    postID SERIAL PRIMARY KEY,
    groupID INT REFERENCES Groups(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    movieID INT, -- ID of the movie (from API, not in database)
    showtimeID INT, -- ID of the showtime (from API, not in database)
    content TEXT
);

-- Create GroupJoinRequests Table
CREATE TABLE GroupJoinRequests (
    requestID SERIAL PRIMARY KEY,
    groupID INT REFERENCES Groups(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Add unique constraint to GroupMembers to prevent duplicate memberships
ALTER TABLE GroupMembers ADD CONSTRAINT unique_group_user UNIQUE (groupID, userID);

-- Database structure creation completed successfully
