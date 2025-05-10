# Soundmaster Website Deployment Guide

This guide provides step-by-step instructions for deploying the Soundmaster website to Cloudflare Workers and Pages, ensuring a secure and private admin panel that is completely separate from the public-facing site.

## Architecture Overview

The deployment consists of two main components:

1. **Admin Panel (Cloudflare Worker)**: A secure, authenticated interface for managing website content
2. **Public Website (Cloudflare Pages)**: The public-facing website that displays content to visitors

Both components access the same backend resources:
- **D1 Database**: Stores content, media metadata, and user information
- **R2 Storage**: Stores media files (images, audio, documents)

## Prerequisites

- Cloudflare account
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)

## Deployment Steps

### 1. Set Up Cloudflare Resources

First, you need to create the necessary Cloudflare resources:

```bash
# Log in to Cloudflare
wrangler login

# Create an R2 bucket for media storage
wrangler r2 bucket create soundmaster-media

# Create a D1 database
wrangler d1 create soundmaster-db

# Apply the database schema
wrangler d1 execute soundmaster-db --file=admin/schema.sql
```

### 2. Update Configuration Files

#### Admin Panel Configuration

Edit `admin/wrangler.jsonc` and update the database ID:

```jsonc
"d1_databases": [
  {
    "binding": "SITE_DB",
    "database_name": "soundmaster-db",
    "database_id": "YOUR_D1_DATABASE_ID" // Replace with your actual database ID
  }
]
```

#### Public Website Configuration

Edit `public/wrangler.jsonc` and update the database ID and domain settings:

```jsonc
"d1_databases": [
  {
    "binding": "SITE_DB",
    "database_name": "soundmaster-db",
    "database_id": "YOUR_D1_DATABASE_ID" // Replace with your actual database ID
  }
],
"triggers": {
  "http": {
    "routes": ["yourdomain.com/*"],
    "custom_domains": ["yourdomain.com"]
  }
}
```

### 3. Set Admin Password

Set a secure password for the admin panel:

```bash
cd admin
wrangler secret put ADMIN_PASSWORD
```

When prompted, enter a strong, unique password. This password will be used to access the admin panel.

### 4. Deploy the Admin Panel

```bash
cd admin
npm install
wrangler deploy
```

After deployment, you'll receive a URL for your admin panel (e.g., `https://soundmaster-admin.yourusername.workers.dev`).

### 5. Deploy the Public Website

```bash
cd public
npm install
wrangler pages deploy .
```

### 6. Automated Deployment

For convenience, you can use the included PowerShell script to deploy both components:

```powershell
./deploy.ps1
```

## Security Considerations

### Admin Panel Security

The admin panel is secured with multiple layers of protection:

1. **HTTP Basic Authentication**: Username/password authentication for all admin panel access
2. **Separate Domain**: The admin panel runs on a completely different domain from your public site
3. **CORS Headers**: Configured to prevent unauthorized access

### Additional Security Recommendations

For enhanced security:

1. **Set Up Cloudflare Access**: Add an additional authentication layer for the admin panel
   ```bash
   # Create an application in Cloudflare Zero Trust dashboard
   # Configure access policies for your admin panel domain
   ```

2. **Use Custom Domains with HTTPS**: Configure custom domains for both the admin panel and public site
   ```bash
   # In Cloudflare dashboard, add custom domains and configure SSL/TLS
   ```

3. **Regular Password Updates**: Change the admin password regularly
   ```bash
   wrangler secret put ADMIN_PASSWORD
   ```

## Usage Guide

### Accessing the Admin Panel

1. Navigate to your admin panel URL (e.g., `https://soundmaster-admin.yourusername.workers.dev`)
2. Enter the username (`admin`) and the password you configured

### Managing Content

The admin panel provides interfaces for:

1. **Media Library**: Upload and manage images, audio files, and documents
2. **Content Management**: Create and edit products, news, and pages
3. **Settings**: Configure website settings

### Monitoring and Maintenance

View logs for your Worker:
```bash
wrangler tail
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your admin password is correctly set using `wrangler secret put ADMIN_PASSWORD`
2. **Database Connection Issues**: Verify the database ID in both `wrangler.jsonc` files
3. **CORS Errors**: If you're experiencing CORS issues, check the CORS headers in the admin panel worker

### Support Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
