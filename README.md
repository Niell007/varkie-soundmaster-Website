# Soundmaster Website

A professional website for Soundmaster, featuring an admin dashboard for content management and a public-facing website. Built with Cloudflare Workers and Pages.

## Overview

The Soundmaster website consists of two main components:

1. **Admin Dashboard** - A Cloudflare Workers application for managing website content
2. **Public Website** - A Cloudflare Pages website for public visitors

Both components are deployed to Cloudflare and use Cloudflare's services for data storage and content delivery.

## Live URLs

- **Admin Dashboard**: [https://varkie-soundmaster-admin.workers.dev](https://varkie-soundmaster-admin.workers.dev)
- **Public Website**: [https://varkie-soundmaster-public.pages.dev](https://varkie-soundmaster-public.pages.dev)

## Project Structure

```
soundmaster-website/
├── cloudflare/           # Main project code
│   ├── admin/            # Admin dashboard (Cloudflare Workers)
│   ├── public/           # Public website (Cloudflare Pages)
│   ├── deploy.ps1        # Deployment script
│   └── README.md         # Cloudflare-specific README
└── docs/                 # Project documentation
    ├── api-reference/    # API reference documentation
    ├── architecture/     # Architecture documentation
    ├── diagrams/         # System diagrams
    ├── guides/           # Development guides
    ├── PROGRESS.md       # Progress tracking
    └── README.md         # Documentation README
```

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Documentation Home](./docs/README.md)
- [Getting Started Guide](./docs/guides/getting-started.md)
- [Deployment Guide](./docs/guides/deployment-guide.md)
- [API Reference](./docs/api-reference/admin-api.md)
- [System Architecture](./docs/architecture/system-architecture.md)
- [Progress Tracking](./docs/PROGRESS.md)

## Features

### Admin Dashboard

- Secure authentication system
- Content management (news, team, schedules, playlists)
- Media library management
- Dashboard statistics
- Settings management

### Public Website

- Responsive design
- News articles display
- Team member profiles
- Event schedules
- Music playlists

## Technologies Used

- **Backend**:
  - Cloudflare Workers (TypeScript)
  - Cloudflare D1 (SQL Database)
  - Cloudflare R2 (Object Storage)
  - JWT Authentication

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Responsive Design
  - Modern UI Components

## Getting Started

See the [Getting Started Guide](./docs/guides/getting-started.md) for detailed instructions on setting up the development environment.

Quick start:

```bash
# Install dependencies for admin dashboard
cd cloudflare/admin
npm install

# Install dependencies for public website
cd ../public
npm install

# Run admin dashboard locally
cd ../admin
npx wrangler dev

# Run public website locally
cd ../public
npm run dev
```

## Deployment

See the [Deployment Guide](./docs/guides/deployment-guide.md) for detailed instructions on deploying to Cloudflare.

Quick deployment:

```bash
# Deploy to production
cd cloudflare
./deploy.ps1 -Environment production
```

## Admin Access

To access the admin dashboard:

- **URL**: [https://varkie-soundmaster-admin.workers.dev](https://varkie-soundmaster-admin.workers.dev)
- **Username**: admin
- **Password**: Soundmaster2025!

## License

Copyright © 2025 Soundmaster. All rights reserved.
