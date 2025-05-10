# Soundmaster Website Cloudflare Deployment

This repository contains the code for deploying the Soundmaster website to Cloudflare Workers and Pages. The deployment consists of two parts:

1. **Admin Panel**: A secure, private interface for managing website content, deployed as a Cloudflare Worker
2. **Public Website**: The public-facing website, deployed to Cloudflare Pages

## Architecture Overview

The solution follows a headless CMS architecture:

- **Admin Panel**: Secure, authenticated interface for content management
- **Public Website**: Static site that fetches content via API
- **Shared Resources**:
  - D1 Database: Stores content, media metadata, and user information
  - R2 Storage: Stores media files

## Prerequisites

- Cloudflare account
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd varkie-website/cloudflare
```

### 2. Set Up Cloudflare Resources

1. Log in to Cloudflare:
   ```bash
   wrangler login
   ```

2. Create an R2 bucket for media storage:
   ```bash
   wrangler r2 bucket create soundmaster-media
   ```

3. Create a D1 database:
   ```bash
   wrangler d1 create soundmaster-db
   ```

4. Apply the database schema:
   ```bash
   wrangler d1 execute soundmaster-db --file=admin/schema.sql
   ```

### 3. Configure the Admin Panel

1. Update the `admin/wrangler.jsonc` file with your D1 database ID:
   ```jsonc
   "d1_databases": [
     {
       "binding": "SITE_DB",
       "database_name": "soundmaster-db",
       "database_id": "YOUR_D1_DATABASE_ID" // Replace with your actual database ID
     }
   ]
   ```

2. Set a secure password for the admin panel:
   ```bash
   cd admin
   wrangler secret put ADMIN_PASSWORD
   ```

### 4. Deploy the Admin Panel

```bash
cd admin
npm install
wrangler deploy
```

After deployment, you'll receive a URL for your admin panel (e.g., `https://soundmaster-admin.yourusername.workers.dev`).

### 5. Deploy the Public Website

1. Copy your existing website files to the `public` directory
2. Create a custom domain for your website in the Cloudflare dashboard
3. Deploy the website:
   ```bash
   cd public
   wrangler pages deploy .
   ```

## Security Considerations

The admin panel is secured using HTTP Basic Authentication. For additional security:

1. Set up Cloudflare Access to add an additional authentication layer
2. Configure a custom domain with HTTPS for the admin panel
3. Use a strong, unique password for the admin panel

## Usage

### Accessing the Admin Panel

1. Navigate to your admin panel URL (e.g., `https://soundmaster-admin.yourusername.workers.dev`)
2. Enter the username (`admin`) and password you configured

### Managing Content

The admin panel provides interfaces for:

1. **Media Library**: Upload and manage images, audio, and other media files
2. **Content Management**: Create and edit pages, news articles, and other content
3. **User Management**: Manage admin users and permissions
4. **Settings**: Configure website settings

### Public Website

The public website automatically fetches content from the same database used by the admin panel, ensuring synchronization between the admin panel and the public site.

## Customization

### Admin Panel

The admin panel can be customized by modifying the `admin/src/index.ts` file. You can add new API endpoints, change the authentication method, or modify the admin interface.

### Public Website

The public website can be customized by modifying the files in the `public` directory. The `_worker.js` file handles API requests for the public site.

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your admin password is correctly set using `wrangler secret put ADMIN_PASSWORD`
2. **Database Connection Issues**: Verify the database ID in `wrangler.jsonc`
3. **CORS Errors**: The admin panel includes CORS headers, but you may need to adjust them for your specific domains

### Logs and Debugging

View logs for your Worker:
```bash
wrangler tail
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
