# Overview

This is an adapted physical activity application for patients in addiction therapy, designed to help manage cravings through exercise and emotional regulation tools. The application provides a comprehensive platform for tracking cravings, performing therapeutic exercises, cognitive-behavioral therapy tools (Beck column analysis), and gamification elements to encourage regular engagement.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent Material Design-inspired UI
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation
- **Mobile-First Design**: Responsive design with mobile navigation and desktop header navigation

## Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured error handling and request logging middleware
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

## Data Storage Solutions
- **Database**: PostgreSQL configured with Drizzle ORM
- **Cloud Database**: Neon serverless PostgreSQL with WebSocket connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **ORM Features**: Type-safe database operations with Drizzle-Zod integration for runtime validation

## Authentication and Authorization
- **Session-Based Auth**: Express sessions with secure cookie configuration
- **Demo User System**: Development-friendly demo user system for testing
- **User Management**: Basic user profile management with levels, points, and badges

## Key Features Implementation

### Craving Management System
- **Tracking**: 0-10 intensity scale with triggers and emotions tracking
- **Analytics**: Statistical analysis of craving patterns and trends
- **Correlation**: Links between physical activity and craving intensity reduction

### Exercise Library
- **Categorization**: Multiple categories (craving reduction, relaxation, energy boost, emotion management)
- **Adaptive Difficulty**: Beginner to advanced levels with intensity ratings
- **Session Tracking**: Before/after craving measurements and completion tracking

### Beck Column Analysis (CBT Tool)
- **5-Column Structure**: Situation, automatic thoughts, emotions, rational responses, results
- **Interactive Forms**: Step-by-step guided cognitive restructuring
- **Historical Analysis**: Saved analyses for pattern recognition and progress tracking

### Gamification System
- **Progress Tracking**: User levels, points, and achievement badges
- **Motivation**: Visual progress indicators and milestone rewards
- **Engagement**: Streak tracking and completion statistics

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, Vite, and Wouter routing
- **UI Framework**: Radix UI primitives with shadcn/ui component system
- **State Management**: TanStack React Query for server state and caching

### Database and Backend
- **Database**: Neon PostgreSQL serverless with connection pooling
- **ORM**: Drizzle ORM with PostgreSQL adapter and Zod integration
- **Server**: Express with TypeScript, cors, and session middleware

### Development and Build Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: TSX for development server, ESBuild for production builds
- **CSS**: Tailwind CSS with PostCSS and Autoprefixer
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### UI and Styling
- **Design System**: Material Design principles with Google Fonts (Roboto, Material Icons)
- **Components**: Comprehensive shadcn/ui component library
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities
- **Animations**: CSS transitions and Material Design elevation shadows

### Deployment and Hosting
- **Platform**: Replit-optimized with development banner and runtime error overlay
- **Environment**: Node.js with WebSocket support for database connections
- **Static Assets**: Vite-based build system for optimized client bundle