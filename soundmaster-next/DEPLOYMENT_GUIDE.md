# Soundmaster Website Deployment Guide

This guide provides step-by-step instructions for deploying the Soundmaster website to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Git repository with your Soundmaster Next.js project
- Node.js and npm installed locally

## Deployment Steps

### 1. Prepare Your Repository

Ensure your project is committed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
# Initialize a Git repository if you haven't already
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit of Soundmaster website"

# Add a remote repository (replace with your own repository URL)
git remote add origin https://github.com/yourusername/soundmaster-website.git

# Push to the repository
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize Cloudflare to access your Git provider (GitHub, GitLab, or Bitbucket)
6. Select your Soundmaster repository

### 3. Configure Build Settings

Enter the following build settings:

- **Project name**: `soundmaster`
- **Production branch**: `main` (or your default branch)
- **Framework preset**: `Next.js`
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (leave as default)

### 4. Environment Variables

Add the following environment variables:

- `NODE_VERSION`: `16.17.0` (or your preferred Node.js version)

### 5. Deploy

Click **Save and Deploy**

Cloudflare Pages will now build and deploy your site. This process may take a few minutes.

### 6. Set Up Custom Domain (Optional)

1. Once deployed, go to the **Custom domains** tab in your Pages project
2. Click **Set up a custom domain**
3. Enter your domain name and follow the instructions to configure DNS

## Accessing Your Site

After deployment, your site will be available at:

- **Production URL**: `https://soundmaster.pages.dev` (or your custom domain)
- **Preview URL** (for non-production branches): `https://branch-name.soundmaster.pages.dev`

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in the Cloudflare Pages dashboard
2. Ensure all dependencies are correctly installed
3. Verify that your `next.config.ts` file is properly configured for Cloudflare Pages
4. Check that your environment variables are set correctly

## Updating Your Site

To update your site, simply push changes to your Git repository. Cloudflare Pages will automatically build and deploy the updated version.

```bash
# Make changes to your code

# Commit changes
git add .
git commit -m "Update website content"

# Push changes
git push origin main
```

## Database Setup

For the database functionality to work properly, you'll need to set up Cloudflare D1:

1. In your Cloudflare dashboard, go to **Workers & Pages** > **D1**
2. Click **Create database**
3. Name it `soundmaster-db`
4. Once created, note the database ID
5. Update your `wrangler.jsonc` file with the database ID:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "soundmaster-db",
      "database_id": "your-database-id"
    }
  ]
}
```

6. Deploy the database schema using the Cloudflare dashboard or Wrangler CLI
