# Soundmaster Radio Website

A modern, full-stack website for Soundmaster Radio built with [Next.js](https://nextjs.org/) and deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Project Overview

The Soundmaster Radio website consists of two main components:

1. **Public Website** - A responsive, user-facing website with pages for news, team information, program schedules, playlists, and on-demand content.

2. **Admin Dashboard** - A secure admin panel for managing all content on the website, including news articles, team members, schedules, playlists, and media files.

## Features

- **Modern UI** with Tailwind CSS
- **Responsive Design** for all devices
- **Server-Side Rendering** for optimal performance
- **API Routes** for backend functionality
- **Authentication System** powered by Auth.js with Cloudflare D1 for the admin dashboard
- **Content Management** for all website sections
- **Media Library** for managing audio, video, and images
- **Cloudflare Integration** for global deployment

## Getting Started

### Setting Up the Database

Before running the application, you need to initialize the Auth.js database tables in Cloudflare D1:

```bash
# Create a D1 database (if you haven't already)
npx wrangler d1 create soundmaster-db

# Initialize the Auth.js database tables and create users with secure password hashing
npm run init:auth-db
```

### Authentication Setup

The application uses Auth.js (formerly NextAuth.js) with Cloudflare D1 for secure authentication. The setup includes:

1. **Database Tables**: Auth.js requires specific tables for users, accounts, sessions, and verification tokens.

2. **Secure Password Hashing**: User passwords are hashed using bcrypt before storage.

3. **JWT-based Sessions**: Authentication state is maintained using secure JWT tokens.

4. **Role-based Access Control**: Users have specific roles (admin, editor) with different permissions.

To complete the Auth.js setup, run:

```bash
# Initialize Auth.js database tables and create users with secure password hashing
npm run setup:auth
```

### Development

You can run the application in three modes:

1. **Standard Next.js Development** (without Cloudflare integration):

```bash
npm run dev
```

2. **Cloudflare Pages Development** (with D1 database):

```bash
npm run dev:cf
```

3. **Cloudflare Pages Development with Auth.js** (complete setup):

```bash
npm run dev:with-auth
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the public website.
Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin dashboard.

### Admin Login Credentials

The initialization script creates two default users:

1. **Admin User**
   - **Username:** admin
   - **Email:** admin@soundmaster.com
   - **Password:** admin123
   - **Role:** admin

2. **Editor User**
   - **Username:** editor
   - **Email:** editor@soundmaster.com
   - **Password:** editor123
   - **Role:** editor

## Cloudflare integration

Besides the `dev` script mentioned above `c3` has added a few extra scripts that allow you to integrate the application with the [Cloudflare Pages](https://pages.cloudflare.com/) environment, these are:
  - `pages:build` to build the application for Pages using the [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) CLI
  - `preview` to locally preview your Pages application using the [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
  - `deploy` to deploy your Pages application using the [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI

> __Note:__ while the `dev` script is optimal for local development you should preview your Pages application as well (periodically or before deployments) in order to make sure that it can properly work in the Pages environment (for more details see the [`@cloudflare/next-on-pages` recommended workflow](https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md#recommended-development-workflow))

### Bindings

Cloudflare [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) are what allows you to interact with resources available in the Cloudflare Platform.

You can use bindings during development, when previewing locally your application and of course in the deployed application:

- To use bindings in dev mode you need to define them in the `next.config.js` file under `setupDevBindings`, this mode uses the `next-dev` `@cloudflare/next-on-pages` submodule. For more details see its [documentation](https://github.com/cloudflare/next-on-pages/blob/05b6256/internal-packages/next-dev/README.md).

- To use bindings in the preview mode you need to add them to the `pages:preview` script accordingly to the `wrangler pages dev` command. For more details see its [documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1) or the [Pages Bindings documentation](https://developers.cloudflare.com/pages/functions/bindings/).

- To use bindings in the deployed application you will need to configure them in the Cloudflare [dashboard](https://dash.cloudflare.com/). For more details see the  [Pages Bindings documentation](https://developers.cloudflare.com/pages/functions/bindings/).

## Project Structure

```
soundmaster-next/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app router
│   │   ├── (site)/     # Public website pages
│   │   │   ├── news/   # News section
│   │   │   ├── team/   # Team section
│   │   │   └── ...     # Other public pages
│   │   ├── admin/      # Admin dashboard
│   │   │   ├── dashboard/  # Admin home
│   │   │   ├── news/       # News management
│   │   │   └── ...         # Other admin sections
│   │   └── api/       # API routes
│   │       ├── auth/   # Authentication
│   │       ├── content/ # Content management
│   │       └── media/   # Media management
│   ├── components/     # Reusable React components
│   ├── lib/            # Utility functions
│   └── styles/         # CSS modules or Tailwind
└── ...                 # Config files
```

## Database Setup

The application uses Cloudflare D1 for data storage. The database includes tables for:

- Users (admin authentication)
- News articles
- Team members
- Schedule items
- Playlists
- Media items

### Setting Up Cloudflare D1

1. **Create a D1 Database**

   ```bash
   npx wrangler d1 create soundmaster-db
   ```

   This will output a configuration snippet that you should add to your `wrangler.jsonc` file.

2. **Initialize the Database Schema**

   The schema is defined in `schema.sql`. To initialize the database with this schema and sample data:

   ```bash
   # For local development
   npx wrangler d1 execute soundmaster-db --local --file=./src/scripts/init-db.js
   
   # For production
   npx wrangler d1 execute soundmaster-db --file=./src/scripts/init-db.js
   ```

3. **Configure Database Bindings**

   Make sure your `wrangler.jsonc` file includes the D1 binding:

   ```json
   {
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "soundmaster-db",
         "database_id": "YOUR_DATABASE_ID"
       }
     ]
   }
   ```

   Replace `YOUR_DATABASE_ID` with the ID provided when you created the database.

4. **Local Development with D1**

   When running locally, you can use the D1 database with:

   ```bash
   npx wrangler pages dev --d1=soundmaster-db
   ```

   Or use the mock data provided in the Database class for development without D1.

## Deployment

Follow these steps to deploy the application to Cloudflare Pages:

1. **Set up your Cloudflare account**

   If you don't have a Cloudflare account, create one at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).

2. **Authenticate Wrangler**

   ```bash
   npx wrangler login
   ```

   This will open a browser window to authenticate with your Cloudflare account.

3. **Create a D1 Database** (if you haven't already)

   ```bash
   npx wrangler d1 create soundmaster-db
   ```

   Update your `wrangler.jsonc` file with the database binding information.

4. **Initialize the Database**

   ```bash
   npx wrangler d1 execute soundmaster-db --file=./src/scripts/init-db.js
   ```

5. **Build and Deploy**

   ```bash
   npm run deploy
   ```

   This will build the application and deploy it to Cloudflare Pages.

6. **Configure Environment Variables**

   In the Cloudflare Dashboard, go to Pages > Your Project > Settings > Environment Variables.
   
   Add the following environment variables:
   - `JWT_SECRET`: A secure random string for JWT token generation

7. **Set up Custom Domain** (Optional)

   In the Cloudflare Dashboard, go to Pages > Your Project > Custom Domains.
   
   Follow the instructions to add your custom domain.

### Continuous Deployment

You can also set up continuous deployment by connecting your GitHub repository to Cloudflare Pages. This will automatically deploy your application whenever you push changes to your repository.
