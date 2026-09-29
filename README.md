# MERN Blog

A full-stack blog application built with the MERN stack:
- MongoDB for data storage
- Express.js for the REST API
- React + Vite for the frontend
- Node.js for the runtime

It allows users to register, log in, create blog posts, edit and delete them, and leave comments.

## Project overview

This project is split into two main parts:

- `client/` - React frontend built with Vite
- `server/` - Express API and MongoDB models

The root folder contains a small runner script that starts both apps together using `concurrently`.

## Tech stack

### Frontend
- React 19
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT for authentication
- Helmet, CORS, rate limiting, and validation middleware

## How it is built

### Client app
The frontend is a Vite React app located in `client/`.

- `client/src/App.jsx` sets up routing and page-level navigation
- `client/src/pages/` contains the screens such as login, register, home, post detail, create, and edit
- `client/src/context/AuthContext.jsx` handles authentication state
- `client/src/components/` contains shared UI elements like navigation and protected routes
- `client/src/api.js` is used to communicate with the backend API

### Server app
The backend is an Express API in `server/`.

- `server/src/app.js` configures the Express app, CORS, security headers, and API routes
- `server/routes/` defines the endpoints for auth, posts, and comments
- `server/controllers/` contains the business logic for each feature
- `server/models/` defines MongoDB schemas for users, posts, and comments
- `server/middleware/` handles auth checks, validation, and error handling

### Database and auth
The app uses MongoDB for persistent storage and JWT-based authentication for protected routes and user sessions.

## Folder structure

```bash
Blog/
├─ client/
│  ├─ src/
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ src/
│  ├─ utils/
│  ├─ .env.example
│  └─ package.json
├─ package.json
├─ README.md
└─ .gitignore
```

## Environment setup

From the project root, install the dependencies:

```powershell
npm install
npm --prefix server install
npm --prefix client install
Copy-Item server/.env.example server/.env
```

Update the values in `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mern_blog
JWT_SECRET=replace_with_a_long_random_secret
```

Make sure MongoDB is running locally before starting the app.

## Run the project

Start both the frontend and backend together from the project root:

```powershell
npm run dev
```

This runs:
- the React client via Vite
- the Express server via Nodemon

## Default URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Build for production

Build the frontend bundle:

```powershell
npm --prefix client run build
```

Start the backend in production mode:

```powershell
npm --prefix server run start
```

## Notes

This project demonstrates a standard full-stack JavaScript app structure where the frontend and backend are separated but work together through REST API calls. The root `npm run dev` script is used to streamline local development.
