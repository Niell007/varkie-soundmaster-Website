# System Architecture Diagram

This document provides visual representations of the Soundmaster website's system architecture.

## Overview Diagram

The following diagram shows the high-level architecture of the Soundmaster website, including the main components and their interactions.

```mermaid
graph TD
    subgraph "Client Layer"
        A[Admin Dashboard UI]
        B[Public Website]
    end
    
    subgraph "Cloudflare Workers"
        C[Admin API]
        D[Authentication]
        E[Content Management]
        F[Media Management]
        G[Dashboard Statistics]
    end
    
    subgraph "Cloudflare Storage"
        H[D1 Database]
        I[R2 Storage]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    D --> H
    E --> H
    F --> H
    F --> I
    G --> H
```

## Component Diagram

The following diagram shows the detailed components of the Soundmaster website and their relationships.

```mermaid
graph TD
    subgraph "Admin Dashboard"
        A1[Login Page]
        A2[Dashboard Home]
        A3[Content Management]
        A4[Media Library]
        A5[Settings]
    end
    
    subgraph "Public Website"
        B1[Home Page]
        B2[News]
        B3[Team]
        B4[Schedule]
        B5[Playlists]
    end
    
    subgraph "Admin API"
        C1[Auth API]
        C2[Content API]
        C3[Media API]
        C4[Dashboard API]
        C5[Settings API]
    end
    
    subgraph "Database"
        D1[Users Table]
        D2[Content Table]
        D3[Media Table]
        D4[Settings Table]
    end
    
    A1 --> C1
    A2 --> C4
    A3 --> C2
    A4 --> C3
    A5 --> C5
    
    B1 --> C2
    B2 --> C2
    B3 --> C2
    B4 --> C2
    B5 --> C2
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    C4 --> D1
    C4 --> D2
    C4 --> D3
    C5 --> D4
```

## Deployment Architecture

The following diagram shows the deployment architecture of the Soundmaster website on Cloudflare.

```mermaid
graph TD
    subgraph "Development Environment"
        A1[Local Admin Dashboard]
        A2[Local Public Website]
    end
    
    subgraph "Cloudflare"
        B1[Cloudflare Workers]
        B2[Cloudflare Pages]
        B3[Cloudflare D1]
        B4[Cloudflare R2]
        
        B1 --> B3
        B1 --> B4
        B2 --> B1
    end
    
    subgraph "End Users"
        C1[Admin Users]
        C2[Website Visitors]
        
        C1 --> B1
        C2 --> B2
    end
    
    A1 --> B1
    A2 --> B2
```

## Data Flow Diagram

The following diagram shows the data flow within the Soundmaster website.

```mermaid
graph LR
    A[Admin User] --> B[Admin Dashboard UI]
    B --> C[Admin API]
    C --> D[D1 Database]
    C --> E[R2 Storage]
    
    F[Website Visitor] --> G[Public Website]
    G --> C
    
    subgraph "Content Flow"
        A --> |Creates Content| B
        B --> |Saves Content| C
        C --> |Stores Content| D
        F --> |Views Content| G
        G --> |Requests Content| C
        C --> |Retrieves Content| D
        C --> |Returns Content| G
    end
    
    subgraph "Media Flow"
        A --> |Uploads Media| B
        B --> |Uploads Media| C
        C --> |Stores Media| E
        F --> |Views Media| G
        G --> |Requests Media| C
        C --> |Retrieves Media| E
        C --> |Returns Media| G
    end
```

## Authentication Flow Diagram

The following diagram shows the authentication flow for the admin dashboard.

```mermaid
sequenceDiagram
    participant A as Admin User
    participant B as Admin Dashboard UI
    participant C as Admin API
    participant D as D1 Database
    
    A->>B: Enter Credentials
    B->>C: POST /api/auth/login
    C->>D: Query User
    D-->>C: User Data
    C->>C: Validate Password
    C-->>B: JWT Token
    B->>B: Store Token in Cookie
    
    loop For each authenticated request
        B->>C: Request with JWT Token
        C->>C: Validate Token
        C->>D: Query Data
        D-->>C: Data
        C-->>B: Response
    end
```

## Database Schema Diagram

The following diagram shows the database schema for the Soundmaster website.

```mermaid
erDiagram
    USERS {
        integer id PK
        text username
        text password_hash
        text email
        text role
        text created_at
        text last_login
    }
    
    MEDIA {
        integer id PK
        text key
        text filename
        text content_type
        integer size
        text type
        text title
        text alt_text
        text description
        boolean is_public
        text uploaded_at
        integer uploaded_by FK
    }
    
    CONTENT {
        integer id PK
        text type
        text slug
        text title
        text content
        text meta_description
        integer featured_image FK
        boolean is_published
        text created_at
        text updated_at
        text published_at
        integer created_by FK
    }
    
    SETTINGS {
        text key PK
        text value
        text updated_at
    }
    
    USERS ||--o{ MEDIA : uploads
    USERS ||--o{ CONTENT : creates
    MEDIA ||--o{ CONTENT : featured_in
```
