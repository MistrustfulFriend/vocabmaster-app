# VocabMaster - Language Learning Application

## Overview

VocabMaster is a full-stack vocabulary learning application built with React and Express.js. The application allows users to add words, organize them by language and category, take quizzes, and track their learning progress. It features a modern dark theme with mobile-first design and comprehensive statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom dark theme and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reloading with Vite middleware integration

## Key Components

### Database Schema
The application uses three main database tables:
- **words**: Stores vocabulary entries with translations, categories, and learning statistics
- **quiz_sessions**: Tracks quiz attempts with scores and metadata
- **quiz_answers**: Records individual answers within quiz sessions for detailed analytics

### Core Features
1. **Word Management**: Add, edit, delete, and search vocabulary words
2. **Quiz System**: Interactive quizzes with multiple choice questions and instant feedback
3. **Progress Tracking**: Detailed statistics including accuracy rates and learning streaks
4. **Organization**: Filter words by language, category, and dictionary
5. **Mobile Experience**: Responsive design with bottom navigation and touch-friendly interface

### Storage Layer
The application implements a flexible storage interface with PostgreSQL database storage:
- **Database**: PostgreSQL with Drizzle ORM for persistent data storage
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Auto-seeding**: Database automatically populated with sample vocabulary on startup

## Data Flow

1. **Word Addition**: Users input vocabulary through forms → validated with Zod → stored in database → UI updates via React Query
2. **Quiz Flow**: Random words selected → quiz session created → user answers tracked → statistics updated → results displayed
3. **Statistics**: Real-time calculation of accuracy, streaks, and progress metrics from quiz performance data
4. **Search & Filter**: Client-side and server-side filtering with debounced search for responsive user experience

## Recent Changes

### Database Integration (Latest)
- **Date**: January 20, 2025
- **Changes**: Replaced in-memory storage with PostgreSQL database
- **Implementation**: DatabaseStorage class with full CRUD operations
- **Features**: Automatic database seeding with 30 sample words (French & Spanish)
- **Benefits**: Data persistence across sessions, production-ready storage

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm & drizzle-kit**: Type-safe database ORM and migrations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **wouter**: Lightweight routing

### UI Libraries
- **@radix-ui/***: Accessible UI primitives (20+ components)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Modern icon library

### Development Tools
- **typescript**: Type safety across the stack
- **vite**: Fast build tool and dev server
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Development**: Hot reloading with Vite middleware, PostgreSQL database with auto-seeding
- **Production**: Compiled assets served statically, PostgreSQL database required
- **Database**: Uses `DATABASE_URL` environment variable for PostgreSQL connection
- **Data Persistence**: All vocabulary words, quiz sessions, and progress data stored permanently

### Hosting Considerations
- Static assets served from Express in production
- Database migrations run via `npm run db:push`
- Environment-aware configuration for optimal performance in each context