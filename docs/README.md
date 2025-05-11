# Soundmaster Website Documentation

This documentation provides comprehensive information about the Soundmaster website project, including architecture, API references, development guides, and diagrams.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Development Guides](#development-guides)
- [Diagrams](#diagrams)

## Overview

The Soundmaster website consists of two main components:

1. **Admin Dashboard** - A Cloudflare Workers-based application for managing website content
2. **Public Website** - A Cloudflare Pages-based frontend for public visitors

Both components are deployed to Cloudflare and use Cloudflare's services for data storage and content delivery.

## Architecture

The architecture documentation provides detailed information about the system design, components, and their interactions.

- [System Architecture](./architecture/system-architecture.md)
- [Database Schema](./architecture/database-schema.md)
- [Authentication Flow](./architecture/authentication-flow.md)

## API Reference

The API reference documentation provides detailed information about the API endpoints, request/response formats, and authentication requirements.

- [Admin API](./api-reference/admin-api.md)
- [Content API](./api-reference/content-api.md)
- [Media API](./api-reference/media-api.md)

## Development Guides

The development guides provide instructions for setting up the development environment, deploying the application, and contributing to the project.

- [Getting Started](./guides/getting-started.md)
- [Development Workflow](./guides/development-workflow.md)
- [Deployment Guide](./guides/deployment-guide.md)
- [Testing Guide](./guides/testing-guide.md)

## Diagrams

The diagrams provide visual representations of the system architecture, workflows, and data models.

- [System Architecture Diagram](./diagrams/system-architecture.md)
- [Database Schema Diagram](./diagrams/database-schema.md)
- [Authentication Flow Diagram](./diagrams/authentication-flow.md)

### Viewing Diagrams

The diagrams in this documentation are created using [Mermaid](https://mermaid-js.github.io/mermaid/), a markdown-based diagramming tool. To view these diagrams:

1. **GitHub**: If viewing on GitHub, the diagrams will render automatically.
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension to view diagrams in the markdown preview.
3. **Mermaid Live Editor**: You can copy the diagram code and paste it into the [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/) to view and edit the diagrams.

## Progress Tracking

The project progress is tracked in the [PROGRESS.md](./PROGRESS.md) file, which contains information about completed tasks, current status, and future plans.
