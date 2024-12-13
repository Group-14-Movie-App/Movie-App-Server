# Movie App Backend

## Description
The Movie App backend provides APIs to manage users, groups, reviews, favorites, and chatbot interactions. The database structure and relationships facilitate user engagement with the app, such as reviewing movies, creating/joining groups, and managing favorites.

---

## Database Structure

### Entities and Relationships

#### **Users**
- **Attributes**: 
  - `userID`, `email`, `password`, `firstName`, `lastName`, `city`, `isAdmin`
- **Relationships**: 
  - Has many: Reviews, Favorites, Groups (Owner), GroupPosts (Creator), GroupMembers (Member).

#### **Reviews**
- **Attributes**: 
  - `reviewID`, `userID`, `movieTitle`, `releaseDate`, `description`, `rating`, `timestamp`
- **Relationships**: 
  - Belongs to: User (each review is written by one user).

#### **Favorites**
- **Attributes**: 
  - `favoriteID`, `userID`, `name`
- **Relationships**: 
  - Belongs to: User (each favorite belongs to a user).
  - Has many: FavoriteMovies (movies in the favorite collection).

#### **FavoriteMovies**
- **Attributes**: 
  - `favoriteMovieID`, `favoriteID`, `movieID`
- **Relationships**: 
  - Belongs to: Favorite (each movie is part of a specific favorite collection).

#### **Groups**
- **Attributes**: 
  - `groupID`, `groupName`, `description`, `ownerID`
- **Relationships**: 
  - Has many: GroupMembers, GroupPosts.
  - Belongs to: User (owner of the group).

#### **GroupMembers**
- **Attributes**: 
  - `groupMemberID`, `groupID`, `userID`
- **Relationships**: 
  - Belongs to: Group, User.

#### **GroupPosts**
- **Attributes**: 
  - `postID`, `groupID`, `userID`, `movieID`, `showtimeID`, `content`
- **Relationships**: 
  - Belongs to: Group, User.

  ## Class Diagram
The class diagram describes the database structure, entities, and relationships used in the Movie App.

- [View the Class Diagram on Lucidchart](https://lucid.app/lucidchart/7efead80-93dc-429b-aba3-3c036ca35720/edit?viewport_loc=-331%2C-8205%2C7151%2C2715%2C0_0&invitationId=inv_47ca03f0-9df1-4515-9efa-7102eef575ef)


---

## UI Design
The application has the following key sections:
1. **Home Page**: Navigation and popular movies.
2. **Authentication**: Sign-Up and Log-In pages.
3. **Search**: Movie filtering and details.
4. **Showtimes**: Finnkino theater schedules.
5. **Profile**: User account management.
6. **Groups**: Create, join, and customize groups.
7. **Reviews**: Add and browse movie reviews.
8. **Favorites**: Manage and share favorite movie lists.

- **UI Wireframe**: [View Figma Design](https://www.figma.com/design/Um23jxZOoDbHIjjAZuTNMW/Movie-App-Group-14?node-id=5-1281&t=zMdASt7FiUUvEGga-1)

---

## REST API Documentation

### User Management
1. **Register**
   - **Path**: `/register`
   - **Method**: `POST`
   - **Description**: Handles user registration.

2. **Sign-In**
   - **Path**: `/signin`
   - **Method**: `POST`
   - **Description**: User authentication and token generation.

3. **Profile**
   - **Path**: `/profile`
   - **Methods**: 
     - `GET`: Retrieves user profile information.
     - `PUT`: Updates profile information.

---

### Reviews
1. **Reviews**
   - **Path**: `/reviews`
   - **Methods**: 
     - `GET`: Fetches reviews (optionally filtered by movie).
     - `POST`: Adds a new movie review.

---

### Favorites
1. **Favorites**
   - **Path**: `/favorites`
   - **Methods**: 
     - `GET`: Retrieves user's favorites.
     - `POST`: Adds a favorite.
     - `DELETE`: Removes a favorite.

2. **Favorite Movies**
   - **Path**: `/favorite-movies`
   - **Methods**: 
     - `GET`: Retrieves favorite movies.
     - `POST`: Adds a movie to favorites.

---

### Groups
1. **Create Group**
   - **Path**: `/groups`
   - **Method**: `POST`

2. **My Groups**
   - **Path**: `/my-groups`
   - **Method**: `GET`

3. **Group Details**
   - **Path**: `/groups`
   - **Method**: `GET`

4. **All Groups**
   - **Path**: `/all-groups`
   - **Method**: `GET`

5. **Join Requests**
   - **Path**: `/group-join-requests`
   - **Method**: `POST`

6. **Other Group Details**
   - **Path**: `/other-groups`
   - **Method**: `GET`

7. **Group Posts**
   - **Path**: `/group-posts`
   - **Method**: `GET`

8. **My Group Posts**
   - **Path**: `/my-group-posts`
   - **Method**: `GET`

---

### Chatbot
1. **Chatbot**
   - **Path**: `/chatbot`
   - **Method**: `POST`

---

## Server Setup
- **Port**: `5000`
- **Base URL**: `http://localhost:5000`

## Conclusion

This project focused on teamwork, integration of modern technologies, and full-stack development practices. Through this process, we gained practical experience in API integration, database design, and deploying scalable applications.



