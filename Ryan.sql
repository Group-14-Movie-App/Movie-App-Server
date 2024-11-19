-- Users Table
CREATE TABLE Users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    city VARCHAR(100),
    isAdmin BOOLEAN DEFAULT FALSE
);

SELECT * FROM Users;

INSERT INTO Users (email, password, firstName, lastName, city) 
VALUES ('testuser@example.com', 'Password123', 'John', 'Doe', 'Helsinki');

INSERT INTO Users (email, password, firstName, lastName)
VALUES ('anotheruser@example.com', '$2b$10$HASHED_PASSWORD_HERE', 'Another', 'User');


-- Reviews Table (Updated Version)
CREATE TABLE Reviews (
    reviewID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    movieTitle VARCHAR(255) NOT NULL, -- Movie title to uniquely identify
    releaseDate DATE NOT NULL, -- Release date to distinguish movies with the same title
    description TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
CREATE TABLE Favorites (
    favoriteID SERIAL PRIMARY KEY,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- FavoriteMovies Table (Associative Table for User Favorites)
CREATE TABLE FavoriteMovies (
    favoriteMovieID SERIAL PRIMARY KEY,
    favoriteID INT REFERENCES Favorites(favoriteID) ON DELETE CASCADE,
    movieID INT NOT NULL -- ID of the movie (from API, not in database)
);

-- Groups Table
CREATE TABLE Groups (
    groupID SERIAL PRIMARY KEY,
    groupName VARCHAR(255) NOT NULL,
    description TEXT,
    ownerID INT REFERENCES Users(userID) ON DELETE CASCADE
);

-- GroupMembers Table (Associative Table for Group Membership)
CREATE TABLE GroupMembers (
    groupMemberID SERIAL PRIMARY KEY,
    groupID INT REFERENCES Groups(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE
);

-- GroupPosts Table
CREATE TABLE GroupPosts (
    postID SERIAL PRIMARY KEY,
    groupID INT REFERENCES Groups(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    movieID INT, -- ID of the movie (from API, not in database)
    showtimeID INT, -- ID of the showtime (from API, not in database)
    content TEXT
);
