# Soundmaster Admin Dashboard Features

This document provides an overview of the features implemented in the Soundmaster Admin Dashboard.

## Core Features

### Authentication
- Secure login with JWT-based authentication
- Role-based access control for admin functions
- Token validation for API requests

### Playlist Management
- View all playlists with sorting and filtering
- Create new playlists with title, description, track count, and duration
- Edit existing playlists
- Delete playlists
- Mark playlists as featured for homepage display

### Schedule Management
- View schedule in a weekly calendar format
- Create schedule items with day, time, title, and description
- Edit schedule items
- Delete schedule items
- Color-coding for different types of shows

### News Management
- View all news articles with sorting and filtering
- Create news articles with title, content, summary, and featured image
- Rich text editor for content creation
- Edit existing news articles
- Delete news articles
- Mark articles as featured for homepage display
- Preview news articles before publishing

### Website Deployment
- One-click deployment of website content
- Automatic generation of HTML files based on database content
- Deployment history tracking
- Status notifications for deployment process

## Technical Implementation

### API Endpoints

#### Authentication
- `POST /api/auth/login`: Login with email and password
- `POST /api/auth/logout`: Logout current user

#### Playlist Management
- `GET /api/playlists`: Get all playlists
- `POST /api/playlists`: Create a new playlist
- `GET /api/playlists/:id`: Get a playlist by ID
- `PUT /api/playlists/:id`: Update a playlist
- `DELETE /api/playlists/:id`: Delete a playlist

#### Schedule Management
- `GET /api/schedule`: Get all schedule items
- `POST /api/schedule`: Create a new schedule item
- `GET /api/schedule/:id`: Get a schedule item by ID
- `PUT /api/schedule/:id`: Update a schedule item
- `DELETE /api/schedule/:id`: Delete a schedule item

#### News Management
- `GET /api/news`: Get all news articles
- `POST /api/news`: Create a new news article
- `GET /api/news/:id`: Get a news article by ID
- `PUT /api/news/:id`: Update a news article
- `DELETE /api/news/:id`: Delete a news article

#### Website Deployment
- `POST /api/deploy`: Generate and deploy website content

### Frontend Components

#### Playlist Manager
- List view of all playlists
- Form for creating and editing playlists
- Confirmation dialog for deletion
- Status notifications for operations

#### Schedule Manager
- Calendar view of schedule
- Form for creating and editing schedule items
- Color picker for schedule item styling
- Day and time selection controls

#### News Manager
- List view of all news articles
- Form for creating and editing news articles
- Rich text editor for content
- Image selection for featured images
- Preview functionality

#### Deploy Manager
- Deployment button with status indicator
- Deployment history list
- Status notifications for deployment process

## Database Schema

### Playlists Table
- `id`: Unique identifier
- `title`: Playlist title
- `description`: Playlist description
- `track_count`: Number of tracks
- `duration`: Total duration
- `featured`: Boolean flag for featured status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Schedule Table
- `id`: Unique identifier
- `title`: Schedule item title
- `description`: Schedule item description
- `start_time`: Start time (HH:MM)
- `end_time`: End time (HH:MM)
- `days`: JSON array of days (e.g., ["Monday", "Wednesday"])
- `playlist_id`: Related playlist ID (optional)
- `host_id`: Related host/user ID (optional)
- `color`: Color code for display
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### News Table
- `id`: Unique identifier
- `title`: News article title
- `content`: News article content (HTML)
- `summary`: Short summary
- `image`: Featured image URL or media ID
- `publish_date`: Publication date
- `featured`: Boolean flag for featured status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Future Enhancements

### Planned Features
- User management with different permission levels
- Media library integration for news articles
- Analytics dashboard for website traffic
- SEO optimization tools
- Automated content scheduling
- Email notifications for new content

### Technical Improvements
- Enhanced error handling and validation
- Comprehensive test coverage
- Performance optimizations
- Responsive design improvements
- Accessibility enhancements

## Testing

A test script is available to verify API functionality:

```bash
npm run test:api
```

This script tests all core API endpoints and verifies that they are working correctly.
