# Admin API Reference

This document provides a comprehensive reference for the Admin API endpoints, including authentication, request/response formats, and examples.

## Base URL

The base URL for all API endpoints is:

```
https://varkie-soundmaster-admin.workers.dev/api
```

## Authentication

All API endpoints (except for `/api/auth/login`) require authentication using a JWT token. The token should be included in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <token>
```

Alternatively, the token can be included in a cookie named `adminToken`.

## Endpoints

### Authentication

#### Login

Authenticates a user and returns a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication Required**: No

**Request Body**:
```json
{
  "username": "admin",
  "password": "password"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

### Dashboard

#### Get Dashboard Statistics

Retrieves statistics for the dashboard.

- **URL**: `/dashboard/stats`
- **Method**: `GET`
- **Authentication Required**: Yes

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "stats": {
    "news": 3,
    "media": 5,
    "team": 2,
    "schedules": 2,
    "playlists": 1
  }
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Get Recent Content

Retrieves recent content items for the dashboard.

- **URL**: `/dashboard/recent`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `limit` (optional): Maximum number of items to return (default: 5)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "type": "news",
      "title": "New Product Launch",
      "created_at": "2025-05-10T12:00:00Z"
    },
    {
      "id": 2,
      "type": "schedule",
      "title": "Product Demo: June 2025",
      "created_at": "2025-05-09T10:30:00Z"
    }
  ]
}
```

### Content Management

#### Get Content List

Retrieves a list of content items by type.

- **URL**: `/content/:type`
- **Method**: `GET`
- **Authentication Required**: Yes

**URL Parameters**:
- `type`: Content type (news, team, schedule, playlist)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `published` (optional): Filter by published status (true/false)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "slug": "new-product-launch",
      "title": "New Product Launch",
      "is_published": true,
      "published_at": "2025-05-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Content Item

Retrieves a single content item by type and slug.

- **URL**: `/content/:type/:slug`
- **Method**: `GET`
- **Authentication Required**: Yes

**URL Parameters**:
- `type`: Content type (news, team, schedule, playlist)
- `slug`: Content slug

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "type": "news",
    "slug": "new-product-launch",
    "title": "New Product Launch",
    "content": "<p>We are excited to announce...</p>",
    "is_published": true,
    "published_at": "2025-05-10T12:00:00Z",
    "created_at": "2025-05-10T10:00:00Z",
    "updated_at": "2025-05-10T10:00:00Z"
  }
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "success": false,
  "error": "Content not found"
}
```

#### Create Content Item

Creates a new content item.

- **URL**: `/content/:type`
- **Method**: `POST`
- **Authentication Required**: Yes

**URL Parameters**:
- `type`: Content type (news, team, schedule, playlist)

**Request Body**:
```json
{
  "slug": "new-product-launch",
  "title": "New Product Launch",
  "content": "<p>We are excited to announce...</p>",
  "is_published": true
}
```

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "type": "news",
    "slug": "new-product-launch",
    "title": "New Product Launch",
    "content": "<p>We are excited to announce...</p>",
    "is_published": true,
    "published_at": "2025-05-10T12:00:00Z",
    "created_at": "2025-05-10T12:00:00Z",
    "updated_at": "2025-05-10T12:00:00Z"
  }
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "success": false,
  "error": "Slug already exists"
}
```

#### Update Content Item

Updates an existing content item.

- **URL**: `/content/:type/:slug`
- **Method**: `PUT`
- **Authentication Required**: Yes

**URL Parameters**:
- `type`: Content type (news, team, schedule, playlist)
- `slug`: Content slug

**Request Body**:
```json
{
  "title": "Updated Product Launch",
  "content": "<p>We are excited to announce...</p>",
  "is_published": true
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "type": "news",
    "slug": "new-product-launch",
    "title": "Updated Product Launch",
    "content": "<p>We are excited to announce...</p>",
    "is_published": true,
    "published_at": "2025-05-10T12:00:00Z",
    "created_at": "2025-05-10T10:00:00Z",
    "updated_at": "2025-05-10T12:00:00Z"
  }
}
```

#### Delete Content Item

Deletes a content item.

- **URL**: `/content/:type/:slug`
- **Method**: `DELETE`
- **Authentication Required**: Yes

**URL Parameters**:
- `type`: Content type (news, team, schedule, playlist)
- `slug`: Content slug

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### Media Library

#### Get Media Items

Retrieves a list of media items.

- **URL**: `/media`
- **Method**: `GET`
- **Authentication Required**: Yes

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by media type (image, audio, video, document)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "key": "images/product.jpg",
      "filename": "product.jpg",
      "content_type": "image/jpeg",
      "size": 12345,
      "type": "image",
      "title": "Product Image",
      "uploaded_at": "2025-05-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Media Item

Retrieves a single media item by ID.

- **URL**: `/media/:id`
- **Method**: `GET`
- **Authentication Required**: Yes

**URL Parameters**:
- `id`: Media item ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "key": "images/product.jpg",
    "filename": "product.jpg",
    "content_type": "image/jpeg",
    "size": 12345,
    "type": "image",
    "title": "Product Image",
    "alt_text": "Product image description",
    "description": "Image of our new product",
    "is_public": true,
    "uploaded_at": "2025-05-10T12:00:00Z"
  }
}
```

#### Upload Media Item

Uploads a new media item.

- **URL**: `/media/upload`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Content-Type**: `multipart/form-data`

**Form Parameters**:
- `file`: Media file
- `title` (optional): Media title
- `alt_text` (optional): Alternative text
- `description` (optional): Media description
- `is_public` (optional): Whether the media is public (default: false)

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "key": "images/product.jpg",
    "filename": "product.jpg",
    "content_type": "image/jpeg",
    "size": 12345,
    "type": "image",
    "title": "Product Image",
    "alt_text": "Product image description",
    "description": "Image of our new product",
    "is_public": true,
    "uploaded_at": "2025-05-10T12:00:00Z"
  }
}
```

#### Update Media Item

Updates a media item's metadata.

- **URL**: `/media/:id`
- **Method**: `PUT`
- **Authentication Required**: Yes

**URL Parameters**:
- `id`: Media item ID

**Request Body**:
```json
{
  "title": "Updated Product Image",
  "alt_text": "Updated product image description",
  "description": "Updated image of our new product",
  "is_public": true
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "item": {
    "id": 1,
    "key": "images/product.jpg",
    "filename": "product.jpg",
    "content_type": "image/jpeg",
    "size": 12345,
    "type": "image",
    "title": "Updated Product Image",
    "alt_text": "Updated product image description",
    "description": "Updated image of our new product",
    "is_public": true,
    "uploaded_at": "2025-05-10T12:00:00Z"
  }
}
```

#### Delete Media Item

Deletes a media item.

- **URL**: `/media/:id`
- **Method**: `DELETE`
- **Authentication Required**: Yes

**URL Parameters**:
- `id`: Media item ID

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

### Settings

#### Get Settings

Retrieves all settings.

- **URL**: `/settings`
- **Method**: `GET`
- **Authentication Required**: Yes

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "settings": {
    "site_name": "Soundmaster",
    "site_description": "Professional Audio Equipment"
  }
}
```

#### Update Setting

Updates a setting.

- **URL**: `/settings/:key`
- **Method**: `PUT`
- **Authentication Required**: Yes

**URL Parameters**:
- `key`: Setting key

**Request Body**:
```json
{
  "value": "New Soundmaster"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "setting": {
    "key": "site_name",
    "value": "New Soundmaster",
    "updated_at": "2025-05-10T12:00:00Z"
  }
}
```

## Error Handling

All API endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error responses have the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per IP address

When a rate limit is exceeded, the API returns a 429 Too Many Requests response:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

The `retry_after` field indicates the number of seconds to wait before making another request.
