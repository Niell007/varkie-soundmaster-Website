# Deployment Guide

This guide provides instructions for deploying the Soundmaster website to Cloudflare, including both the admin dashboard and the public website.

## Prerequisites

Before deploying, ensure you have the following:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (v4 or later)
- Cloudflare account with Workers and Pages access
- Cloudflare API token with appropriate permissions

## Configuration

### Wrangler Configuration

The admin dashboard uses a `wrangler.jsonc` file for configuration. This file should be located in the `admin` directory.

```jsonc
{
  "name": "varkie-soundmaster-admin",
  "main": "src/index.ts",
  "compatibility_date": "2023-05-18",
  "compatibility_flags": ["nodejs_compat"],
  "usage_model": "bundled",
  "site": {
    "bucket": "src/client"
  },
  "d1_databases": [
    {
      "binding": "SITE_DB",
      "database_name": "soundmaster-db",
      "database_id": "1e77877a-f902-4fc1-bd62-d2605c5e9df2"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "soundmaster-media"
    }
  ],
  "analytics_engine_datasets": [
    {
      "binding": "ANALYTICS",
      "dataset": "soundmaster_admin_analytics"
    }
  ],
  "vars": {
    "ADMIN_USERNAME": "admin",
    "API_BASE_URL": "/api",
    "PUBLIC_SITE_URL": "https://varkie-soundmaster-public.pages.dev",
    "CORS_ALLOWED_ORIGINS": "https://varkie-soundmaster-public.pages.dev"
  },
  "triggers": {
    "crons": ["0 0 * * *"]
  }
}
```

### Environment Variables

The following environment variables are used in the deployment:

- `ADMIN_USERNAME`: Username for admin login
- `API_BASE_URL`: Base URL for API requests
- `PUBLIC_SITE_URL`: URL of the public website
- `CORS_ALLOWED_ORIGINS`: Allowed origins for CORS requests

## Deployment Process

### Using the Deployment Script

The easiest way to deploy is using the provided deployment script:

```bash
# Deploy to production
./deploy.ps1 -Environment production

# Deploy to staging
./deploy.ps1 -Environment staging
```

The deployment script performs the following steps:

1. Installs dependencies for both the admin dashboard and public website
2. Builds the admin dashboard
3. Deploys the admin dashboard to Cloudflare Workers
4. Builds the public website
5. Deploys the public website to Cloudflare Pages

### Manual Deployment

If you prefer to deploy manually, follow these steps:

#### Admin Dashboard

1. Navigate to the admin directory:
   ```bash
   cd cloudflare/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   npx wrangler deploy
   ```

#### Public Website

1. Navigate to the public directory:
   ```bash
   cd cloudflare/public
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist
   ```

## Database Initialization

The database is automatically initialized when the admin dashboard is first accessed. However, you can manually initialize the database using the following command:

```bash
cd cloudflare/admin
node deploy-db.js
```

This script will:

1. Create the necessary database tables
2. Insert a default admin user
3. Insert default settings
4. Insert sample content

## Custom Domains

To configure custom domains for your deployment:

### Admin Dashboard

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your admin dashboard worker
4. Click on "Triggers"
5. Add a custom domain (e.g., admin.yourdomain.com)

### Public Website

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your public website
4. Click on "Custom domains"
5. Add a custom domain (e.g., www.yourdomain.com)

## Troubleshooting

### Common Issues

#### Deployment Fails with Authentication Error

Ensure your Cloudflare API token has the necessary permissions:

- Workers: Edit permission
- D1: Edit permission
- R2: Edit permission
- Pages: Edit permission

#### Database Initialization Fails

If database initialization fails, try the following:

1. Check the Cloudflare dashboard for any D1 database errors
2. Ensure your D1 database ID is correctly configured in `wrangler.jsonc`
3. Run the database initialization script manually:
   ```bash
   cd cloudflare/admin
   node deploy-db.js
   ```

#### CORS Errors

If you encounter CORS errors when accessing the API from the public website:

1. Ensure the `CORS_ALLOWED_ORIGINS` environment variable includes your public website URL
2. Check that the CORS headers are being correctly set in the API responses

## Monitoring

After deployment, you can monitor your application using Cloudflare's built-in tools:

### Workers Analytics

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your admin dashboard worker
4. Click on "Analytics"

### Pages Analytics

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your public website
4. Click on "Analytics"

## Rollback

If you need to rollback to a previous version:

### Admin Dashboard

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your admin dashboard worker
4. Click on "Deployments"
5. Select the version you want to rollback to
6. Click "Rollback to this version"

### Public Website

1. Log in to the Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your public website
4. Click on "Deployments"
5. Select the version you want to rollback to
6. Click "Rollback to this version"
