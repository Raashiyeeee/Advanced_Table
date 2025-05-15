# Deploying Your Backend to Heroku

This guide will help you deploy your Express.js backend application to Heroku.

## Prerequisites

1. Create a [Heroku account](https://signup.heroku.com/) if you don't have one
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli): `npm install -g heroku`

## Environment Variables Security

Before deploying, ensure you are handling environment variables securely:

1. **NEVER commit `.env` files to your repository**
2. **DO NOT include actual credentials in your code**
3. **Set environment variables through Heroku's secure interface**
4. **Run the security check script before deployment:**

```bash
./check-env-files.sh
```

## Deployment Steps

### 1. Add a Procfile

Create a file named `Procfile` (no extension) in your backend directory:

```
cd backend
echo "web: node server.js" > Procfile
```

### 2. Update CORS settings in your backend

Ensure your backend server.js has proper CORS configuration to allow requests from your frontend domain:

```javascript
// Add this near the top of server.js
const cors = require('cors');

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

If you don't have cors installed, add it:

```
npm install cors --save
```

### 3. Login to Heroku

```
heroku login
```

### 4. Initialize a Git repository (if not already done)

```
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 5. Create a Heroku app

```
heroku create your-app-name
```

Replace `your-app-name` with a unique name for your app.

### 6. Configure MongoDB connection

Make sure your MongoDB connection uses environment variables:

```javascript
// In server.js or wherever your database connection is configured
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';
mongoose.connect(MONGODB_URI);
```

Then set up the MongoDB connection string on Heroku:

```
heroku config:set MONGODB_URI="your-mongodb-connection-string"
```

> ⚠️ **Security Best Practice**: Never hardcode actual connection strings with credentials in your code. Always use environment variables.

You can use MongoDB Atlas for a hosted MongoDB database.

### 7. Deploy your app

```
git push heroku master
```

Or if you're on a different branch:

```
git push heroku your-branch-name:master
```

### 8. Open your app

```
heroku open
```

## Environment Variables

Set any additional environment variables your app needs using Heroku's config:

```
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-netlify-app.netlify.app
```

You can also set these through the Heroku dashboard:
1. Go to your app's dashboard on Heroku
2. Navigate to Settings
3. Click "Reveal Config Vars"
4. Add your environment variables securely

## Checking logs

If you encounter issues, check the logs:

```
heroku logs --tail
```

## Connecting Frontend and Backend

After deploying both your frontend to Netlify and backend to Heroku:

1. Get your Heroku app URL (e.g., `https://your-app-name.herokuapp.com`)
2. Update the `REACT_APP_API_URL` in your Netlify environment variables to point to your Heroku backend 