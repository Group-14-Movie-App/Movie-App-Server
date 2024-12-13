# Movie App Backend 🎥

The backend for the Movie App provides APIs to manage users, groups, reviews, favorites, and chatbot interactions. The database structure facilitates user engagement with the app by enabling review creation, group interactions, and more.

---

## Table of Contents

- 🔧 [Installation Process](#installation-process)
- 🔑 [Environment Variables](#environment-variables)
- 🔨 [Database Setup](#database-setup)
- 📊 [Database Structure](#database-structure)
- ⚙️ [Running the Development Server](#running-the-development-server)
- 🔧 [Testing](#testing)
- 🔍 [REST API Documentation](#rest-api-documentation)
- 🔬 [Diagrams](#diagrams)
- 📚 [Class Diagram Explanation](#class-diagram-explanation)

---

## Installation Process

### Prerequisites

Ensure the following are installed on your system:
- Node.js (≮14.x) 🌐
- npm (≮6.x) 🌐

### Steps

1. Clone the repository: 🔧
   ```bash
   git clone https://github.com/Group-14-Movie-App/Movie-App-Server.git
   ```

2. Navigate to the project directory: 🔎
   ```bash
   cd Movie-App-Server
   ```

3. Install dependencies: 🔧
   ```bash
   npm install
   ```

4. Copy the `.env.example` file to create your own `.env` file: 🔑
   ```bash
   cp .env.example .env
   ```

---

## Environment Variables 🔑

In the `.env` file, configure the following fields:

```env
# Database Details
DB_NAME=movie
DB_TEST_NAME=movie_test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT Secret Key
JWT_SECRET_KEY=anything

# API Keys
TMDB_API_KEY=your_tmdb_api_key
OPENAI_API_KEY=your_open_ai_api_key
```

### Instructions:
- Replace `your_db_password` with your database password.
- Replace `your_tmdb_api_key` with your TMDB API key.
- Replace `your_open_ai_api_key` with your OpenAI API key.

---

## Database Setup 🔨

1. Execute the SQL commands in the `db.create.sql` file to create the required tables.
2. Create a test database with the same structure by executing the same SQL commands. This is essential for running tests.

---

## Database Structure 📊

The database is structured as follows:

### Users Table
- **Columns:**
  - `userID` (Primary Key, Auto Increment)
  - `email` (Unique, Not Null)
  - `password` (Not Null)
  - `firstName`
  - `lastName`
  - `city`
  - `isAdmin` (Default: `FALSE`)

### Reviews Table
- **Columns:**
  - `reviewID` (Primary Key, Auto Increment)
  - `userID` (Foreign Key -> `Users.userID`, Cascade Delete)
  - `movieTitle` (Not Null)
  - `releaseDate` (Not Null)
  - `description`
  - `rating` (Between 1 and 5)
  - `timestamp` (Default: Current Timestamp)

### Favorites Table
- **Columns:**
  - `favoriteID` (Primary Key, Auto Increment)
  - `userID` (Foreign Key -> `Users.userID`, Cascade Delete)
  - `name` (Not Null)

### FavoriteMovies Table
- **Columns:**
  - `favoriteMovieID` (Primary Key, Auto Increment)
  - `favoriteID` (Foreign Key -> `Favorites.favoriteID`, Cascade Delete)
  - `movieTitle` (Not Null)
  - `releaseYear` (Not Null)

### Groups Table
- **Columns:**
  - `groupID` (Primary Key, Auto Increment)
  - `groupName` (Not Null)
  - `description`
  - `ownerID` (Foreign Key -> `Users.userID`, Cascade Delete)

### GroupMembers Table
- **Columns:**
  - `groupMemberID` (Primary Key, Auto Increment)
  - `groupID` (Foreign Key -> `Groups.groupID`, Cascade Delete)
  - `userID` (Foreign Key -> `Users.userID`, Cascade Delete)
  - `isPending` (Default: `TRUE`)

### GroupPosts Table
- **Columns:**
  - `postID` (Primary Key, Auto Increment)
  - `groupID` (Foreign Key -> `Groups.groupID`, Cascade Delete)
  - `userID` (Foreign Key -> `Users.userID`, Cascade Delete)
  - `movieID` (From API, not in database)
  - `showtimeID` (From API, not in database)
  - `content`

### GroupJoinRequests Table
- **Columns:**
  - `requestID` (Primary Key, Auto Increment)
  - `groupID` (Foreign Key -> `Groups.groupID`, Cascade Delete)
  - `userID` (Foreign Key -> `Users.userID`, Cascade Delete)
  - `timestamp` (Default: Current Timestamp)

### Constraints
- Unique Constraint on `GroupMembers` to prevent duplicate memberships: `unique_group_user (groupID, userID)`

---

## Running the Development Server ⚙️

To start the server in development mode, run:

```bash
npm run devStart
```

The server will be accessible at `http://localhost:5000`.

---

## Testing 🔧

1. Stop the server if it is running.
2. To run the test cases, execute:

   ```bash
   npm run test
   ```

Alternatively, use the following command for detailed test reports:

```bash
npx vitest --run --reporter=verbose
```
---

## REST API Documentation 🔍

Below are examples of REST API requests for common operations. For more details, refer to the `.rest` files in the `requests` directory.

### User Authentication

**Sign In a User** 🔒
- **Method**: `POST`
- **Endpoint**: `/signin`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "developer@example.com",
    "password": "DevPassword456"
  }
  ```

**Register a New User**
- **Method**: `POST`
- **Endpoint**: `/register`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "testuser@example.com",
    "password": "Password123",
    "firstName": "Ryan",
    "lastName": "Wick",
    "city": "Helsinki"
  }
  ```

**Fetch All Registered Users**
- **Method**: `GET`
- **Endpoint**: `/register`
- **Headers**:
  - `Content-Type: application/json`

---

### Groups

**Fetch All Groups**
- **Method**: `GET`
- **Endpoint**: `/all-groups`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`

**Send Join Request to a Group**
- **Method**: `POST`
- **Endpoint**: `/all-groups/group-join-requests`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "groupID": 1
  }
  ```

**Fetch Group Details**
- **Method**: `GET`
- **Endpoint**: `/groups/1`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Fetch User's Created Groups**
- **Method**: `GET`
- **Endpoint**: `/my-groups`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Delete a User's Group**
- **Method**: `DELETE`
- **Endpoint**: `/my-groups/1`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

---

### Chatbot

**Chatbot Query Example** 🤖
- **Method**: `POST`
- **Endpoint**: `/chatbot`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "message": "Is Venom a good movie?"
  }
  ```

---

### Reviews

**Submit a Review** ⭐
- **Method**: `POST`
- **Endpoint**: `/reviews`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "userID": 7,
    "movieTitle": "Inception",
    "releaseDate": "2010-07-16",
    "description": "An amazing movie with a great concept.",
    "rating": 5
  }
  ```

**Fetch All Reviews**
- **Method**: `GET`
- **Endpoint**: `/reviews`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Fetch Reviews for Nearest Years**
- **Method**: `GET`
- **Endpoint**: `/reviews/nearest?title=Inception&releaseDate=2010`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Update a Review**
- **Method**: `PUT`
- **Endpoint**: `/reviews/1`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "userID": 7,
    "description": "Updated review description.",
    "rating": 4
  }
  ```

**Delete a Review**
- **Method**: `DELETE`
- **Endpoint**: `/reviews/1`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
  - **Request Body**:
    ```json
    {
      "userID": 7
    }
    ```

---

### Favorite Groups

**Add a New Favorite Group**
- **Method**: `POST`
- **Endpoint**: `/favorites`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "userID": 1,
    "name": "My Favorite Movies"
  }
  ```

**Fetch Favorite Groups**
- **Method**: `GET`
- **Endpoint**: `/favorites?userID=<replace_with_user_id>`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Update Favorite Group Name**
- **Method**: `PUT`
- **Endpoint**: `/favorites/1`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "name": "Updated Group Name"
  }
  ```

**Delete a Favorite Group**
- **Method**: `DELETE`
- **Endpoint**: `/favorites/1`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

---

### Posts

**Fetch All Posts for a Group**
- **Method**: `GET`
- **Endpoint**: `/my-group-posts/1`
- **Headers**:
  - `Authorization: Bearer <replace_with_auth_token>`

**Add a New Post to a Group**
- **Method**: `POST`
- **Endpoint**: `/my-group-posts/1/add-post`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "userID": 7,
    "content": "This is a new post for the group."
  }
  ```

**Edit a Post**
- **Method**: `PUT`
- **Endpoint**: `/my-group-posts/1/edit-post`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
- **Request Body**:
  ```json
  {
    "postID": 3,
    "content": "This is the updated content for the post."
  }
  ```

**Delete a Post in a Group**
- **Method**: `DELETE`
- **Endpoint**: `/my-group-posts/1/delete-post`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <replace_with_auth_token>`
  - **Request Body**:
    ```json
    {
      "postID": 3
    }
    ```

---

## Diagrams 🏛️

For better understanding, refer to the following diagrams:

- **Database Diagram**: [Database Diagram](https://lucid.app/lucidchart/7f68d074-315e-445d-bf61-f620f06f2bb2/edit?viewport_loc=-892%2C-834%2C3461%2C2162%2C0_0&invitationId=inv_33414b18-a92e-415b-ae38-9849861a0d58)
- **Class Diagram**: [Class Diagram](https://lucid.app/lucidchart/800b45f2-0726-4129-9ba7-e4450143994f/edit?viewport_loc=-261%2C-386%2C3870%2C2418%2C0_0&invitationId=inv_72f589c6-6e87-4f30-a8ff-26f286282d1c)
- **ERD Diagram**: [ERD Diagram](https://lucid.app/lucidchart/5702ae09-34a6-462e-a537-0b966b53215d/edit?viewport_loc=-42%2C-100%2C2293%2C1256%2C0_0&invitationId=inv_156754b4-078d-4ff6-a828-7eb5d56e2d10)

---

## Class Diagram Explanation

The class diagram represents the logical structure of the application based on its database schema and functionalities. Here's a breakdown:

### Users
- **Attributes:**
  - userID
  - email
  - password
  - firstName
  - lastName
  - city
  - isAdmin
- **Relationships:**
  - `Users` is related to `Reviews` (1:N)
  - `Users` is related to `Favorites` (1:N)
  - `Users` is related to `Groups` (1:N, as an owner)
  - `Users` is related to `GroupMembers` (N:N via `GroupMembers`)

### Reviews
- **Attributes:**
  - reviewID
  - userID (FK to `Users`)
  - movieTitle
  - releaseDate
  - description
  - rating
  - timestamp
- **Relationships:**
  - Belongs to a single `User`

### Favorites
- **Attributes:**
  - favoriteID
  - userID (FK to `Users`)
  - name
- **Relationships:**
  - Contains multiple `FavoriteMovies`
  - Belongs to a single `User`

### FavoriteMovies
- **Attributes:**
  - favoriteMovieID
  - favoriteID (FK to `Favorites`)
  - movieTitle
  - releaseYear
- **Relationships:**
  - Belongs to a single `Favorite`

### Groups
- **Attributes:**
  - groupID
  - groupName
  - description
  - ownerID (FK to `Users`)
- **Relationships:**
  - `Groups` is related to `GroupMembers` (1:N)
  - `Groups` is related to `GroupPosts` (1:N)
  - Owned by a single `User`

### GroupMembers
- **Attributes:**
  - groupMemberID
  - groupID (FK to `Groups`)
  - userID (FK to `Users`)
  - isPending
- **Relationships:**
  - Connects `Groups` and `Users` in an N:N relationship

### GroupPosts
- **Attributes:**
  - postID
  - groupID (FK to `Groups`)
  - userID (FK to `Users`)
  - movieID (From external API)
  - showtimeID (From external API)
  - content
- **Relationships:**
  - Belongs to a single `Group`
  - Authored by a single `User`

### GroupJoinRequests
- **Attributes:**
  - requestID
  - groupID (FK to `Groups`)
  - userID (FK to `Users`)
  - timestamp
- **Relationships:**
  - Links `Users` and `Groups` for membership requests

---


