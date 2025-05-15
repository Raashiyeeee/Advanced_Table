# Advanced Table with Filtering

A full-stack web application that provides an interactive data table with advanced filtering capabilities.

## Features

- User management with CRUD operations
- Advanced filtering and sorting
- Pagination
- Form validation
- Responsive design

## Tech Stack

- **Frontend**: React, React-Bootstrap, React-Select
- **Backend**: Node.js, Express
- **Database**: MongoDB with in-memory fallback

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB connection (optional, project has in-memory fallback)

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/advanced-table.git
cd advanced-table

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Environment Setup

### Backend (.env file in backend directory)
Create a file named `.env` in the backend directory with the following content:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
CORS_ORIGIN=http://localhost:3000
```

> **⚠️ Security Warning**: Never commit your `.env` files to Git. They contain sensitive information.
> See `env-examples/backend.env.example` for a template.

### Frontend (.env file in frontend directory)
Create a file named `.env` in the frontend directory with the following content:
```
REACT_APP_API_URL=http://localhost:5000/api
```

> **⚠️ Security Warning**: See `env-examples/frontend.env.example` for a template.

## Running the Application

```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend
cd frontend
npm start
```

Your app should now be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

- `GET /api/users` - Get users with filtering
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Security Notes

This project includes several security features and best practices:

1. **Environment Variables**: Sensitive information like database credentials are stored in `.env` files which are not committed to the repository
2. **In-Memory Fallback**: The application can run without MongoDB for development
3. **Input Validation**: All user inputs are validated on both client and server sides

Before pushing to GitHub or any public repository, run the included security check script:

```bash
# Make the script executable
chmod +x check-env-files.sh

# Run the security check
./check-env-files.sh
```

## Deployment

The application supports various deployment options:
- Frontend: Netlify, Vercel, GitHub Pages
- Backend: Render, Heroku, Railway