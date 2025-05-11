# Getting Started Guide

This guide provides instructions for setting up the development environment and getting started with the Soundmaster website project.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v8 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (v4 or later)
- [Git](https://git-scm.com/)
- A code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/))
- A Cloudflare account with Workers and Pages access

## Project Structure

The Soundmaster website project is organized as follows:

```
soundmaster-website/
├── cloudflare/
│   ├── admin/                # Admin dashboard (Cloudflare Workers)
│   │   ├── src/              # Source code
│   │   │   ├── client/       # Admin dashboard frontend
│   │   │   ├── auth.ts       # Authentication module
│   │   │   ├── content.ts    # Content management module
│   │   │   ├── dashboard.ts  # Dashboard statistics module
│   │   │   ├── db-init.ts    # Database initialization module
│   │   │   ├── index.ts      # Main entry point
│   │   │   └── media-library.ts # Media library module
│   │   ├── schema.sql        # Database schema
│   │   ├── wrangler.jsonc    # Wrangler configuration
│   │   └── package.json      # Dependencies
│   ├── public/               # Public website (Cloudflare Pages)
│   │   ├── src/              # Source code
│   │   ├── index.html        # Main HTML file
│   │   ├── wrangler.jsonc    # Wrangler configuration
│   │   └── package.json      # Dependencies
│   ├── deploy.ps1            # Deployment script (PowerShell)
│   └── README.md             # Project README
└── docs/                     # Project documentation
    ├── api-reference/        # API reference documentation
    ├── architecture/         # Architecture documentation
    ├── diagrams/             # System diagrams
    ├── guides/               # Development guides
    ├── PROGRESS.md           # Progress tracking
    └── README.md             # Documentation README
```

## Setting Up the Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/soundmaster-website.git
cd soundmaster-website
```

### 2. Set Up the Admin Dashboard

```bash
cd cloudflare/admin
npm install
```

### 3. Set Up the Public Website

```bash
cd ../public
npm install
```

### 4. Configure Wrangler

Ensure you're logged in to Wrangler:

```bash
npx wrangler login
```

### 5. Create Cloudflare Resources

#### D1 Database

```bash
cd ../admin
npx wrangler d1 create soundmaster-db
```

Update the `wrangler.jsonc` file with the database ID.

#### R2 Bucket

```bash
npx wrangler r2 bucket create soundmaster-media
```

Update the `wrangler.jsonc` file with the bucket name.

## Local Development

### Running the Admin Dashboard Locally

```bash
cd cloudflare/admin
npx wrangler dev
```

This will start a local development server at `http://localhost:8787`.

### Running the Public Website Locally

```bash
cd cloudflare/public
npm run dev
```

This will start a local development server at `http://localhost:5173`.

## Database Setup

### Initialize the Local Database

```bash
cd cloudflare/admin
npx wrangler d1 execute soundmaster-db --local --file=schema.sql
```

### Populate with Sample Data

The database will be automatically initialized with sample data when the admin dashboard is first accessed. However, you can manually initialize it:

```bash
cd cloudflare/admin
node deploy-db.js
```

## Testing

### Admin Dashboard

To test the admin dashboard, navigate to `http://localhost:8787` in your browser and log in with the following credentials:

- Username: `admin`
- Password: `Soundmaster2025!`

### Public Website

To test the public website, navigate to `http://localhost:5173` in your browser.

## Development Workflow

1. Make changes to the code
2. Test locally using the development servers
3. Commit your changes to Git
4. Deploy to Cloudflare (see [Deployment Guide](./deployment-guide.md))

## Troubleshooting

### Common Issues

#### Wrangler Command Not Found

If you encounter a "command not found" error when running Wrangler, ensure it's installed globally or use `npx wrangler` instead.

#### Database Connection Issues

If you encounter database connection issues:

1. Ensure your D1 database ID is correctly configured in `wrangler.jsonc`
2. Try recreating the local database:
   ```bash
   npx wrangler d1 execute soundmaster-db --local --file=schema.sql
   ```

#### CORS Errors

If you encounter CORS errors when accessing the API from the public website:

1. Ensure the `CORS_ALLOWED_ORIGINS` environment variable includes your local development URL
2. Check that the CORS headers are being correctly set in the API responses

## Next Steps

After setting up your development environment, you might want to:

1. Explore the [API Reference](../api-reference/admin-api.md) to understand the available endpoints
2. Review the [System Architecture](../architecture/system-architecture.md) to understand how the components fit together
3. Check the [Database Schema](../architecture/database-schema.md) to understand the data model

## Getting Help

If you encounter any issues or have questions, please:

1. Check the documentation in the `docs` directory
2. Review the code comments for implementation details
3. Reach out to the project maintainers
