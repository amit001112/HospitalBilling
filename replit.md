# Hospital Billing Management System - Lifeline Emergency Care

## Overview

This is a modern hospital billing management system built for Lifeline Emergency Care with a full-stack TypeScript architecture. The application provides patient management, billing functionality, and reporting capabilities with a clean, medical-themed interface. Located at Hope Hospital Mor, Linebazar, Purnea, Bihar 854301.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for type-safe data validation
- **Development**: Hot module replacement with Vite integration

### Data Storage Solutions
- **Patient Database**: Separate PostgreSQL connection for patient data via Neon Database serverless
- **Billing Database**: Separate PostgreSQL connection for billing data via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations with separate database contexts
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Separation**: Logical separation of patient and billing operations for better data organization

## Key Components

### Database Schema
- **Patient Database**:
  - **Patients Table**: Patient demographics, contact info, medical history
- **Billing Database**:
  - **Bills Table**: Bill records with totals, status, and metadata  
  - **Bill Items Table**: Individual line items for each bill
- **Cross-Database Relationships**: Patient ID references maintained across databases

### API Structure
- **RESTful Design**: Standard REST endpoints for CRUD operations
- **Patient Management**: `/api/patients` - Create, read, update, delete patients
- **Billing Operations**: `/api/bills` - Manage bills and bill items
- **Dashboard Data**: `/api/dashboard/stats` - Aggregate statistics
- **Search Functionality**: Query parameters for patient search

### Frontend Pages
- **Dashboard**: Overview with statistics and recent activity
- **Patients**: Patient management with search and CRUD operations
- **Billing**: Bill creation, viewing, and management
- **Reports**: Analytics and reporting interface

### UI Components
- **Layout Components**: Sidebar navigation and header
- **Form Components**: Patient and bill creation/editing forms
- **Data Display**: Tables, cards, and statistical displays
- **Interactive Elements**: Modals, dialogs, and toast notifications

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Business Logic**: Storage layer abstracts database operations
4. **Database Operations**: 
   - Patient operations use `patientDb` connection
   - Billing operations use `billingDb` connection
   - Cross-database queries handled in storage layer
5. **Response Handling**: Type-safe responses with error handling
6. **State Updates**: React Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **Database**: Neon Database for serverless PostgreSQL hosting
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and validation
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build Tool**: Vite for fast development and building
- **Type Checking**: TypeScript compiler for static analysis
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Runtime**: tsx for TypeScript execution in development

## Deployment Strategy

### Build Process
- **Frontend Build**: Vite builds React app to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Static Assets**: Client assets served from build directory
- **Production Mode**: Single Node.js process serves both API and static files

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Development Mode**: Hot reloading with Vite middleware integration
- **Production Mode**: Optimized builds with static file serving
- **Replit Integration**: Special handling for Replit development environment

### Database Management
- **Schema Migrations**: Drizzle Kit handles database schema changes
- **Connection Pooling**: Neon Database provides automatic connection management
- **Backup Strategy**: Relies on Neon Database's built-in backup capabilities