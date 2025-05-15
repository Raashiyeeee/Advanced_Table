# Deploying to Netlify

This guide will help you deploy your React frontend application to Netlify.

## Prerequisites

1. Create a [Netlify account](https://app.netlify.com/signup) if you don't have one
2. Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/): `npm install -g netlify-cli`
3. Deploy your backend to a service like Heroku, Render, or any other backend hosting service

## Environment Variables Security

Before deploying, ensure you are handling environment variables securely:

1. **NEVER commit `.env` files to your repository**
2. **DO NOT include actual API keys or secrets in `netlify.toml`**
3. **Set environment variables through Netlify's secure dashboard instead**

## Deployment Steps

### 1. Update the backend URL

Open the `netlify.toml` file and make sure you're using a placeholder value:

```toml
[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.com/api"
```

Do not put your actual backend URL in this file. You'll set it via the Netlify dashboard instead.

### 2. Login to Netlify

```
netlify login
```

### 3. Deploy to Netlify

Navigate to the project root directory and run:

```
cd frontend
netlify deploy
```

When prompted:
- For "Directory to deploy" enter: `build`
- For "Publish directory" enter: `build`

This will create a draft deployment. To create the production deployment, run:

```
netlify deploy --prod
```

### 4. Manual Deployment (Alternative Method)

If you prefer to use the Netlify UI:

1. Go to your Netlify account dashboard
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub, GitLab, or Bitbucket account
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### 5. Environment Variables

In the Netlify Dashboard:
1. Go to Site settings > Build & deploy > Environment
2. Add the environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend-url.herokuapp.com/api`)

> ⚠️ **Security Best Practice**: By setting environment variables through the Netlify dashboard, you keep them out of your codebase where they could be accidentally committed to Git.

## Notes About the Backend

For this application to work, you need to deploy your backend separately. Options include:

- Heroku
- Render
- Vercel
- Railway

Make sure your backend allows CORS requests from your Netlify domain. 