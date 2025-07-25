# Gas Station Finder Application

## Overview

This is a full-stack web application for finding and displaying gas stations with fuel prices. The application features an interactive map interface where users can search for stations, view detailed information, and receive notifications about low fuel prices. Built with a modern tech stack including React, Express, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Map Integration**: Leaflet for interactive maps
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful APIs with JSON responses

## Key Components

### Database Schema
- **Stations Table**: Stores gas station information including:
  - Unique ID (UUID)
  - Name, address, and city
  - GPS coordinates (latitude/longitude)  
  - Fuel prices (diesel and SP95)
  - Last update timestamp

### API Endpoints
- `GET /api/stations` - Retrieve all stations
- `GET /api/stations/:id` - Get specific station by ID
- `GET /api/stations/search/:query` - Search stations by name or city
- `GET /api/stations/low-price/:maxPrice` - Find stations with prices below threshold

### Frontend Features
- **Interactive Map**: Leaflet-based map with custom markers showing fuel prices
- **Search Functionality**: Real-time search with query-based filtering
- **Station Details**: Bottom sheet modal displaying comprehensive station information
- **Price Notifications**: Banner alerts for low fuel prices
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Data Flow

1. **Data Storage**: Station data is stored in PostgreSQL via Drizzle ORM
2. **API Layer**: Express server exposes RESTful endpoints for data access
3. **State Management**: TanStack Query handles API calls, caching, and synchronization
4. **UI Updates**: React components automatically re-render when data changes
5. **Map Integration**: Station data is displayed as interactive markers on Leaflet map

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection**: Uses DATABASE_URL environment variable

### UI Components
- **shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Open-source mapping library

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking
- **ESLint/Prettier**: Code formatting and linting

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `drizzle-kit push`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment setting (development/production)

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Static file serving capability

### Development Workflow
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production assets
- `npm run start`: Run production server
- `npm run db:push`: Apply database schema changes

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture prioritizes developer experience with fast hot reloading, type safety, and modern tooling while maintaining production readiness with proper error handling and logging.