CREATE TABLE Users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    isOwner BOOLEAN DEFAULT FALSE
);

CREATE TABLE Movie (
    movieID SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    releaseDate DATE
);

CREATE TABLE Review (
    reviewID SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewerID INT REFERENCES Users(userID) ON DELETE CASCADE,
    movieID INT REFERENCES Movie(movieID) ON DELETE CASCADE
);

CREATE TABLE Showtime (
    showtimeID SERIAL PRIMARY KEY,
    movieID INT REFERENCES Movie(movieID) ON DELETE CASCADE,
    theatre VARCHAR(255),
    showtimeDateTime TIMESTAMP NOT NULL
);

CREATE TABLE GroupTable (
    groupID SERIAL PRIMARY KEY,
    groupName VARCHAR(255) NOT NULL,
    ownerID INT REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE GroupMember (
    groupMemberID SERIAL PRIMARY KEY,
    groupID INT REFERENCES GroupTable(groupID) ON DELETE CASCADE,
    userID INT REFERENCES Users(userID) ON DELETE CASCADE
);


CREATE TABLE FavoriteList (
    favoriteListID SERIAL PRIMARY KEY,
    userID INT UNIQUE REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE FavoriteMovie (
    favoriteMovieID SERIAL PRIMARY KEY,
    favoriteListID INT REFERENCES FavoriteList(favoriteListID) ON DELETE CASCADE,
    movieID INT REFERENCES Movie(movieID) ON DELETE CASCADE
);

CREATE TABLE GroupMovie (
    groupMovieID SERIAL PRIMARY KEY,
    groupID INT REFERENCES GroupTable(groupID) ON DELETE CASCADE,
    movieID INT REFERENCES Movie(movieID) ON DELETE CASCADE
);

CREATE TABLE GroupShowtime (
    groupShowtimeID SERIAL PRIMARY KEY,
    groupID INT REFERENCES GroupTable(groupID) ON DELETE CASCADE,
    showtimeID INT REFERENCES Showtime(showtimeID) ON DELETE CASCADE
);
