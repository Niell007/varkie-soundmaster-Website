# Soundmaster Admin Dashboard

A comprehensive admin dashboard for the Soundmaster Radio website built with Cloudflare Workers.

## Features

- **User Authentication**: Secure login and user management with JWT-based authentication
- **Content Management**: Create, edit, and publish website content
- **Media Management**: Upload, organize, and manage media files (audio, images, documents) with advanced search, filtering, and analytics
- **Schedule Management**: Manage radio show schedules with calendar view
- **Playlist Management**: Create and manage music playlists with track listings
- **News Management**: Create, edit, and publish news articles
- **Website Deployment**: Deploy website content with a single click
- **User Management**: Add, edit, and remove users with different permission levels
- **Settings Management**: Configure site-wide and streaming settings
- **Analytics**: View website traffic and engagement metrics

## Technology Stack

- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite) for structured data
- **Storage**: Cloudflare R2 for media files and Cloudflare KV for static assets
- **Authentication**: JWT-based authentication
- **Frontend**: React with TypeScript, CSS modules

## Project Structure

```text
admin/
├── assets/              # Static assets for the admin dashboard
│   ├── css/             # CSS stylesheets
│   ├── js/              # JavaScript files
│   └── index.html       # Main HTML template
├── migrations/          # D1 database migrations
│   └── 0000_initial_schema.sql  # Initial database schema
├── src/                 # Source code
│   ├── api/             # API handlers and routes
│   │   ├── handlers.ts  # API request handlers
│   │   └── routes.ts    # API route definitions
│   ├── auth/            # Authentication logic
│   │   ├── handlers.ts  # Auth request handlers
│   │   ├── index.ts     # Auth utilities
│   │   └── utils.ts     # Auth helper functions
│   └── index.ts         # Main entry point
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
└── wrangler.jsonc       # Cloudflare Workers configuration
```

## Setup and Deployment

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:8787`

### Deployment

1. Login to Cloudflare:

   ```bash
   wrangler login
   ```

2. Create D1 databases:

   ```bash
   wrangler d1 create soundmaster-users
   wrangler d1 create soundmaster-content
   ```

3. Create KV namespace:

   ```bash
   wrangler kv:namespace create ADMIN_ASSETS
   ```

4. Update the `wrangler.jsonc` file with your database IDs and KV namespace ID.

5. Deploy the worker:

   ```bash
   npm run deploy
   ```

6. Upload admin assets:

   ```bash
   wrangler kv:bulk put ADMIN_ASSETS ./assets
   ```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token generation and verification
- `ADMIN_EMAIL`: Email address for the initial admin user

## Database Schema

The application uses two D1 databases:

1. **USERS_DB**: Stores user accounts and authentication data
2. **CONTENT_DB**: Stores website content, schedules, playlists, and settings

See the `migrations/0000_initial_schema.sql` file for the complete database schema.

## API Endpoints

### Authentication

- `POST /api/auth/login`: Login with email and password
- `POST /api/auth/register`: Register a new user (admin only)
- `POST /api/auth/logout`: Logout current user

### Content Management

- `GET /api/content/:type`: Get content by type (pages, posts, shows, events)
- `PUT /api/content/:type`: Update content

### Schedule Management

- `GET /api/schedule`: Get schedule data
- `PUT /api/schedule`: Update schedule data

### Media Management

- `GET /api/media`: List all media files with optional filtering by type and search term
- `POST /api/media/upload`: Upload a new media file with metadata
- `GET /api/media/:key`: Get a media file by key
- `GET /api/media/:key/metadata`: Get metadata for a media file
- `PUT /api/media/:key/metadata`: Update metadata for a media file
- `DELETE /api/media/:key`: Delete a media file
- `POST /api/media/:key/signedUrl`: Generate a signed URL for secure access

### News Management

- `GET /api/news`: Get all news articles
- `POST /api/news`: Create a new news article
- `GET /api/news/:id`: Get a news article by ID
- `PUT /api/news/:id`: Update a news article
- `DELETE /api/news/:id`: Delete a news article

### Website Deployment

- `POST /api/deploy`: Generate and deploy website content

#### Media Features

- **Advanced Search**: Search media files by name, type, and metadata
- **Media Analytics**: View insights about your media library including usage statistics and type breakdown
- **Drag-and-Drop Upload**: Easy uploading with drag-and-drop interface
- **Metadata Editing**: Edit metadata for existing media files
- **Secure Access**: Generate time-limited signed URLs for secure media access

### Playlist Management

- `GET /api/playlists`: Get all playlists
- `POST /api/playlists`: Create a new playlist
- `PUT /api/playlists/:id`: Update a playlist
- `DELETE /api/playlists/:id`: Delete a playlist

### User Management

- `GET /api/users`: Get all users (admin only)
- `GET /api/user/profile`: Get current user profile
- `PUT /api/user/settings`: Update user settings and profile
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user (admin only)

### Settings Management

- `GET /api/settings/site`: Get site settings
- `PUT /api/settings/site`: Update site settings
- `GET /api/settings/stream`: Get stream settings
- `PUT /api/settings/stream`: Update stream settings

### Analytics

- `GET /api/analytics`: Get analytics data

## Security

- All API endpoints (except login and register) require a valid JWT token
- Passwords are securely hashed before storage
- Role-based access control for admin functions
- CORS protection for API endpoints

## License

Copyright © 2025 Soundmaster Radio. All rights reserved.
