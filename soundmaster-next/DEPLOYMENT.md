# Soundmaster Website Unified Deployment Guide

## Overview

This guide explains how to deploy the Soundmaster website (including the admin dashboard and all backend functions) as a **single unified project** on Cloudflare Pages. This approach avoids creating multiple separate workers that would clutter your Cloudflare account.

## Deployment Architecture

The Soundmaster website uses a unified deployment approach that combines:

- Next.js frontend (public website)
- Admin dashboard
- API endpoints (using Cloudflare Functions)
- Authentication system
- Media handling

All of these components are deployed as a single project to Cloudflare Pages, with Functions enabled to handle backend logic.

## Prerequisites

1. Cloudflare account with Pages access
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Cloudflare API token with appropriate permissions

## Environment Setup

Create a `.env.local` file with the following variables:

```env
# Cloudflare configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# KV Namespace IDs
KV_SESSION_STORE_ID=your_kv_namespace_id
KV_SESSION_STORE_PREVIEW_ID=your_kv_namespace_preview_id

# Authentication
AUTH_SECRET=your_auth_secret
AUTH_URL=https://your-site.pages.dev
```

## Deployment Commands

The project includes several deployment scripts to simplify the process:

### Production Deployment

```bash
npm run deploy
```

This command builds the Next.js application and deploys it to Cloudflare Pages as a production site.

### Development Deployment

```bash
npm run deploy:dev
```

This command deploys to a development environment for testing.

### Local Development

```bash
npm run dev:unified
```

This starts a local development server that simulates the Cloudflare Pages environment.

## How It Works

### 1. Build Process

The deployment script (`deploy.mjs`) handles:

- Building the Next.js application
- Generating Cloudflare Functions for API endpoints
- Configuring environment bindings
- Deploying everything as a single project

### 2. API Routes

API endpoints are implemented as Cloudflare Functions in the `.cloudflare/functions` directory. These are automatically generated during deployment.

### 3. Authentication

Authentication is handled through NextAuth.js, with session data stored in Cloudflare KV.

### 4. Media Storage

Media files are stored in Cloudflare R2 buckets, configured through the deployment process.

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication errors**
   - Verify your Cloudflare API token has the correct permissions
   - Ensure environment variables are properly set

2. **Functions not working**
   - Check the Functions logs in the Cloudflare dashboard
   - Verify the function routes are correctly configured

3. **KV binding errors**
   - Make sure KV namespaces are created and IDs are correctly set in environment variables

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
