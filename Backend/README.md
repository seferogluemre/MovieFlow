# MovieFlow Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Setup and Installation](#setup-and-installation)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Movies](#movie-endpoints)
   - [Actors](#actor-endpoints)
   - [Genres](#genre-endpoints)
   - [Reviews](#review-endpoints)
   - [Ratings](#rating-endpoints)
   - [Watchlist](#watchlist-endpoints)
   - [Wishlist](#wishlist-endpoints)
   - [Library](#library-endpoints)
   - [Friendships](#friendship-endpoints)
   - [Notifications](#notification-endpoints)
   - [Movie-Genres](#movie-genre-endpoints)
   - [Movie-Actors](#movie-actor-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

## Overview

MovieFlow is a comprehensive movie management platform that allows users to browse, rate, review movies, manage watchlists, connect with friends, and receive notifications. The backend is built with Node.js, Express, TypeScript, and PostgreSQL using Prisma ORM.

**Key Features:**
- User authentication and account management
- Movie browsing and information retrieval
- Actor and genre management
- User movie reviews and ratings
- Watchlist and wishlist functionality
- Movie library management
- Friend system with request handling
- Notification system
- Image upload for user profiles and movie posters

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- pnpm (preferred package manager)

### Installation Steps

1. Clone the repository
2. Install dependencies:
```bash
cd Backend
pnpm install
```

3. Configure environment variables:
Create a `.env` file with the following configurations:
```
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie?schema=public"
JWT_SECRET=my_super_secret_key
JWT_EXPIRES_IN=3d
REFRESH_SECRET=mySuperSecretKey
```

4. Setup the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
pnpm dev
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication through a Bearer token in the request header.

**Token Structure:**
- Access Token: Used for API access (24-hour validity)
- Refresh Token: Used to obtain new access tokens (7-day validity)

**Authentication Header Format:**
```
Authorization: Bearer {your_access_token}
```

## API Endpoints

### Authentication Endpoints

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "message": "Login successful",
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "session": {
      "id": 1,
      "userId": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-02T00:00:00.000Z"
    }
  }
  ```
- **Notes**: Use the returned accessToken for authenticated requests.

#### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **Success Response**:
  ```json
  {
    "message": "Başarıyla çıkış yapıldı"
  }
  ```

### User Endpoints

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**: List of users with basic information

#### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123",
    "name": "Full Name",
    "isAdmin": false
  }
  ```
- **Success Response**: Created user object

#### Get User
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: User details including related entities (friends, library, reviews, etc.)

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Request Body**: Any user fields to update
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```
- **Success Response**: Updated user object

#### Delete User
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Deleted user information

#### Upload Profile Image
- **URL**: `/api/users/upload/:id`
- **Method**: `POST`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Request Body**: Form data with "profileImage" file
- **Success Response**: User with updated profile image URL

### Movie Endpoints

#### Get All Movies
- **URL**: `/api/movies`
- **Method**: `GET`
- **Success Response**: List of movies with genres and actors

#### Create Movie
- **URL**: `/api/movies`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "title": "Movie Title",
    "description": "Movie description",
    "releaseYear": 2023,
    "duration": 120,
    "director": "Director Name",
    "ageRating": "GENERAL",
    "posterImage": "poster.jpg"
  }
  ```
- **Success Response**: Created movie object

#### Get Movie
- **URL**: `/api/movies/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Movie details with genres, actors, and other relationships

#### Get Movie Poster
- **URL**: `/api/movies/posters/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Movie poster image

#### Update Movie
- **URL**: `/api/movies/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Request Body**: Any movie fields to update
- **Success Response**: Updated movie object

#### Delete Movie
- **URL**: `/api/movies/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Success Response**: Deleted movie information

### Actor Endpoints

#### Get All Actors
- **URL**: `/api/actors`
- **Method**: `GET`
- **Success Response**: List of actors

#### Create Actor
- **URL**: `/api/actors`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "Actor Name",
    "biography": "Actor biography",
    "birthYear": 1980,
    "nationality": "Country",
    "photo": "actor.jpg"
  }
  ```
- **Success Response**: Created actor object

#### Get Actor
- **URL**: `/api/actors/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Actor details with related movies

#### Update Actor
- **URL**: `/api/actors/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Request Body**: Any actor fields to update
- **Success Response**: Updated actor object

#### Delete Actor
- **URL**: `/api/actors/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Success Response**: Deleted actor information

### Genre Endpoints

#### Get All Genres
- **URL**: `/api/genres`
- **Method**: `GET`
- **Success Response**: List of genres

#### Create Genre
- **URL**: `/api/genres`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "Genre Name"
  }
  ```
- **Success Response**: Created genre object

#### Get Genre
- **URL**: `/api/genres/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Genre details with related movies

#### Update Genre
- **URL**: `/api/genres/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "name": "Updated Genre Name"
  }
  ```
- **Success Response**: Updated genre object

#### Delete Genre
- **URL**: `/api/genres/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (Admin)
- **Success Response**: Deleted genre information

### Review Endpoints

#### Get All Reviews
- **URL**: `/api/reviews`
- **Method**: `GET`
- **Success Response**: List of reviews

#### Create Review
- **URL**: `/api/reviews`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "movieId": 1,
    "content": "This is my review content"
  }
  ```
- **Success Response**: Created review object

#### Get User's Reviews
- **URL**: `/api/reviews/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Success Response**: List of reviews by the specified user

#### Get Movie's Reviews
- **URL**: `/api/reviews/movie/:movieId`
- **Method**: `GET`
- **URL Params**: `movieId=[integer]`
- **Success Response**: List of reviews for the specified movie

#### Get Review
- **URL**: `/api/reviews/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Review details

#### Update Review
- **URL**: `/api/reviews/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (review owner)
- **Request Body**:
  ```json
  {
    "content": "Updated review content"
  }
  ```
- **Success Response**: Updated review object

#### Delete Review
- **URL**: `/api/reviews/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (review owner or admin)
- **Success Response**: Deleted review information

### Rating Endpoints

#### Get All Ratings
- **URL**: `/api/ratings`
- **Method**: `GET`
- **Success Response**: List of ratings

#### Create Rating
- **URL**: `/api/ratings`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "movieId": 1,
    "score": 5
  }
  ```
- **Success Response**: Created rating object

#### Get User's Ratings
- **URL**: `/api/ratings/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Success Response**: List of ratings by the specified user

#### Get Movie's Ratings
- **URL**: `/api/ratings/movie/:movieId`
- **Method**: `GET`
- **URL Params**: `movieId=[integer]`
- **Success Response**: List of ratings for the specified movie

#### Get Rating
- **URL**: `/api/ratings/:id`
- **Method**: `GET`
- **URL Params**: `id=[integer]`
- **Success Response**: Rating details

#### Update Rating
- **URL**: `/api/ratings/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (rating owner)
- **Request Body**:
  ```json
  {
    "score": 4
  }
  ```
- **Success Response**: Updated rating object

#### Delete Rating
- **URL**: `/api/ratings/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required (rating owner or admin)
- **Success Response**: Deleted rating information

### Watchlist Endpoints

#### Get User's Watchlist
- **URL**: `/api/watchlist/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Authentication**: Required
- **Success Response**: List of movies in the user's watchlist

#### Add Movie to Watchlist
- **URL**: `/api/watchlist`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "movieId": 1
  }
  ```
- **Success Response**: Created watchlist entry

#### Remove Movie from Watchlist
- **URL**: `/api/watchlist/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Removed watchlist entry

### Wishlist Endpoints

#### Get User's Wishlist
- **URL**: `/api/wishlist/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Authentication**: Required
- **Success Response**: List of movies in the user's wishlist

#### Add Movie to Wishlist
- **URL**: `/api/wishlist`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "movieId": 1
  }
  ```
- **Success Response**: Created wishlist entry

#### Remove Movie from Wishlist
- **URL**: `/api/wishlist/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Removed wishlist entry

### Library Endpoints

#### Get User's Library
- **URL**: `/api/library/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Authentication**: Required
- **Success Response**: List of movies in the user's library

#### Add Movie to Library
- **URL**: `/api/library`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "movieId": 1
  }
  ```
- **Success Response**: Created library entry

#### Update Last Watched Time
- **URL**: `/api/library/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "lastWatched": "2023-01-01T00:00:00.000Z"
  }
  ```
- **Success Response**: Updated library entry

#### Remove Movie from Library
- **URL**: `/api/library/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Removed library entry

### Friendship Endpoints

#### Get User's Friends
- **URL**: `/api/friendships/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Authentication**: Required
- **Success Response**: List of user's friends

#### Send Friend Request
- **URL**: `/api/friendships`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 1,
    "friendId": 2
  }
  ```
- **Success Response**: Created friendship request (PENDING status)

#### Accept Friend Request
- **URL**: `/api/friendships/accept/:id`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Updated friendship with ACCEPTED status

#### Reject Friend Request
- **URL**: `/api/friendships/reject/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Deleted friendship request

#### Block User
- **URL**: `/api/friendships/block/:userId/:friendId`
- **Method**: `PATCH`
- **URL Params**: `userId=[integer]`, `friendId=[integer]`
- **Authentication**: Required
- **Success Response**: Updated friendship with BLOCKED status

#### Remove Friend
- **URL**: `/api/friendships/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Removed friendship

### Notification Endpoints

#### Get User's Notifications
- **URL**: `/api/notifications/user/:userId`
- **Method**: `GET`
- **URL Params**: `userId=[integer]`
- **Authentication**: Required
- **Success Response**: List of user's notifications

#### Mark Notification as Read
- **URL**: `/api/notifications/:id/read`
- **Method**: `PATCH`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Updated notification with isRead=true

#### Delete Notification
- **URL**: `/api/notifications/:id`
- **Method**: `DELETE`
- **URL Params**: `id=[integer]`
- **Authentication**: Required
- **Success Response**: Deleted notification

### Movie-Genre Endpoints

#### Associate Genre with Movie
- **URL**: `/api/movie-genres`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "movieId": 1,
    "genreId": 1
  }
  ```
- **Success Response**: Created movie-genre association

#### Get Movie's Genres
- **URL**: `/api/movie-genres/movie/:movieId`
- **Method**: `GET`
- **URL Params**: `movieId=[integer]`
- **Success Response**: List of genres associated with the movie

#### Remove Genre from Movie
- **URL**: `/api/movie-genres/:movieId/:genreId`
- **Method**: `DELETE`
- **URL Params**: `movieId=[integer]`, `genreId=[integer]`
- **Authentication**: Required (Admin)
- **Success Response**: Removed movie-genre association

### Movie-Actor Endpoints

#### Associate Actor with Movie
- **URL**: `/api/movie-actors`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "movieId": 1,
    "actorId": 1,
    "role": "Character Name"
  }
  ```
- **Success Response**: Created movie-actor association

#### Get Movie's Actors
- **URL**: `/api/movie-actors/movie/:movieId`
- **Method**: `GET`
- **URL Params**: `movieId=[integer]`
- **Success Response**: List of actors in the movie with their roles

#### Get Actor's Movies
- **URL**: `/api/movie-actors/actor/:actorId`
- **Method**: `GET`
- **URL Params**: `actorId=[integer]`
- **Success Response**: List of movies the actor has appeared in

#### Update Actor's Role
- **URL**: `/api/movie-actors/:movieId/:actorId`
- **Method**: `PATCH`
- **URL Params**: `movieId=[integer]`, `actorId=[integer]`
- **Authentication**: Required (Admin)
- **Request Body**:
  ```json
  {
    "role": "Updated Character Name"
  }
  ```
- **Success Response**: Updated role information

#### Remove Actor from Movie
- **URL**: `/api/movie-actors/:movieId/:actorId`
- **Method**: `DELETE`
- **URL Params**: `movieId=[integer]`, `actorId=[integer]`
- **Authentication**: Required (Admin)
- **Success Response**: Removed movie-actor association

## Data Models

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `username`: Username (unique)
- `password`: Hashed password
- `name`: Full name (optional)
- `profileImage`: Profile picture URL (optional)
- `isAdmin`: Admin privileges flag
- `createdAt`: Account creation timestamp
- `updatedAt`: Last account update timestamp
- Relationships:
  - `reviews`: Reviews written by the user
  - `ratings`: Ratings given by the user
  - `watchlist`: Movies in the user's watchlist
  - `wishlist`: Movies in the user's wishlist
  - `library`: Movies in the user's library
  - `friends`: User's friends list
  - `friendsOf`: Users who have this user as a friend
  - `notifications`: Notifications received by the user
  - `sentNotifications`: Notifications sent by the user

### Movie Model
- `id`: Unique identifier
- `title`: Movie title
- `description`: Movie description
- `releaseYear`: Year released
- `duration`: Movie length in minutes
- `posterImage`: Movie poster URL
- `director`: Movie director
- `rating`: Average rating (0-5)
- `ageRating`: Age classification (GENERAL, PARENTAL_GUIDANCE, TEEN, MATURE, ADULT)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last record update timestamp
- Relationships:
  - `genres`: Movie genres
  - `actors`: Actors in the movie
  - `reviews`: Reviews for the movie
  - `ratings`: Ratings for the movie
  - `watchlist`: Users who have this movie in their watchlist
  - `wishlist`: Users who have this movie in their wishlist
  - `library`: Users who have this movie in their library

### Actor Model
- `id`: Unique identifier
- `name`: Actor name
- `biography`: Actor biography (optional)
- `birthYear`: Birth year (optional)
- `nationality`: Actor nationality (optional)
- `photo`: Actor photo URL (optional)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last record update timestamp
- Relationships:
  - `movies`: Movies the actor has appeared in

### Genre Model
- `id`: Unique identifier
- `name`: Genre name (unique)
- Relationships:
  - `movies`: Movies in this genre

### Review Model
- `id`: Unique identifier
- `content`: Review text
- `createdAt`: Review creation timestamp
- `updatedAt`: Last review update timestamp
- `userId`: User who wrote the review
- `movieId`: Movie being reviewed
- Constraints:
  - A user can only write one review per movie

### Rating Model
- `id`: Unique identifier
- `score`: Rating score (1-5)
- `createdAt`: Rating creation timestamp
- `userId`: User who gave the rating
- `movieId`: Movie being rated
- Constraints:
  - A user can only rate a movie once

### Watchlist Model
- `id`: Unique identifier
- `addedAt`: Date added to watchlist
- `userId`: User who owns the watchlist
- `movieId`: Movie in the watchlist
- Constraints:
  - A movie can only appear once in a user's watchlist

### Wishlist Model
- `id`: Unique identifier
- `addedAt`: Date added to wishlist
- `userId`: User who owns the wishlist
- `movieId`: Movie in the wishlist
- Constraints:
  - A movie can only appear once in a user's wishlist

### Library Model
- `id`: Unique identifier
- `addedAt`: Date added to library
- `lastWatched`: Last watched date (optional)
- `userId`: User who owns the library
- `movieId`: Movie in the library
- Constraints:
  - A movie can only appear once in a user's library

### Friendship Model
- `id`: Unique identifier
- `userId`: Request sender user ID
- `friendId`: Request recipient user ID
- `status`: Friendship status (PENDING, ACCEPTED, BLOCKED)
- `createdAt`: Friendship creation timestamp
- Constraints:
  - A unique relationship between two users

### MovieGenre Model
- Junction table linking movies and genres
- `movieId`: Movie ID
- `genreId`: Genre ID
- Constraints:
  - Unique combination of movie and genre

### MovieActor Model
- Junction table linking movies and actors
- `movieId`: Movie ID
- `actorId`: Actor ID
- `role`: Character name in the movie
- Constraints:
  - Unique combination of movie and actor

### Session Model
- `id`: Unique identifier
- `userId`: User ID
- `createdAt`: Session creation timestamp
- `updatedAt`: Session update timestamp
- `expiresAt`: Session expiration timestamp
- `revokedAt`: Session revocation timestamp (optional)

### Notification Model
- `id`: Unique identifier
- `type`: Notification type (FRIEND_REQUEST, FRIEND_REQUEST_ACCEPTED, FRIEND_REQUEST_REJECTED)
- `message`: Notification message
- `userId`: Recipient user ID
- `fromUserId`: Sender user ID
- `isRead`: Read status flag
- `createdAt`: Notification creation timestamp

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "message": "Error description"
}
```

For validation errors:
```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Error description"]
  }
}
``` 