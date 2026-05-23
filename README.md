# TeamTrack

## Live URL

- https://team-track-two.vercel.app/

## Overview

TeamTrack is a simple issue-tracking backend built with Express and TypeScript. It supports user registration, authentication, issue creation, retrieval, updating, and deletion with role-based access control.

## Features

- User signup and login
- Password hashing with bcrypt
- JWT-based authentication and refresh tokens
- Create, read, update, and delete issues
- Role-based authorization for issue operations
- PostgreSQL database support with automatic table creation

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL (`pg`)
- bcrypt
- JSON Web Tokens (`jsonwebtoken`)
- dotenv
- cookie-parser
- tsx for development

## Setup

1. Clone the repository

```bash
git clone <repo-url>
cd TeamTrack
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file with the required environment variables:

```env
PORT=4000
DATABASE_URL=postgres://user:password@host:port/database
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRITY=1h
```

4. Start the development server

```bash
npm run dev
```

5. Open the API at:

```
http://localhost:<PORT>
```

## API Endpoints

### Auth

- `POST /api/auth/signup`
  - Registers a new user
  - Request body: `{ name, email, password, role? }`

- `POST /api/auth/login`
  - Logs in an existing user
  - Request body: `{ email, password }`
  - Returns an access token and sets a refresh token cookie

### Issues

- `POST /api/issues/`
  - Create a new issue
  - Requires authenticated user with role `contributor` or `maintainer`
  - Request body: `{ title, description, type }`

- `GET /api/issues/`
  - Retrieve all issues

- `GET /api/issues/:id`
  - Retrieve a single issue by ID

- `PUT /api/issues/:id`
  - Update an existing issue
  - Requires authenticated user with role `contributor` or `maintainer`
  - Request body may include `{ title?, description?, type? }`

- `DELETE /api/issues/:id`
  - Delete an issue
  - Requires authenticated user with role `maintainer`

## Database Schema Summary

### `users`

- `id` — serial primary key
- `name` — varchar(75), required
- `email` — varchar(255), unique, required
- `passwordHash` — text, required
- `role` — varchar(30), default `contributor`
- `created_at` — timestamp, default `NOW()`
- `updated_at` — timestamp, default `NOW()`

### `issues`

- `id` — serial primary key
- `title` — varchar(150), required
- `description` — text, required
- `type` — varchar(20), required
- `status` — varchar(20), default `open`
- `reporter_id` — int, foreign key to `users(id)`
- `created_at` — timestamp, default `NOW()`
- `updated_at` — timestamp, default `NOW()`

## Notes

- The server initializes the database tables automatically on startup.

