# Architecture Overview

## System Design

Mini-Insighter is a full-stack Next.js application that enables users to query BigQuery datasets through a natural language chat interface.

## Key Components

### Frontend Layer
- **Next.js App Router**: Modern routing with server and client components
- **React Components**: Reusable UI components for charts, tables, and chat
- **Tailwind CSS**: Utility-first styling

### Backend Layer (API Routes)
- **Authentication**: User auth via Supabase
- **Project Management**: CRUD operations for projects
- **Dataset Registration**: Connect BigQuery datasets
- **Query Execution**: Execute SQL queries on BigQuery
- **Chat Processing**: Natural language to SQL conversion

### Data Layer
- **Supabase**: User data, projects, messages
- **BigQuery**: Analytics data warehouse

### Business Logic
- **Rule Engine**: Pattern matching for query generation
- **Query Builder**: SQL construction helpers
- **Formatters**: Data transformation for UI

## Data Flow

1. User sends chat message
2. Rule engine matches pattern and generates SQL
3. SQL executed on BigQuery
4. Results formatted and returned to UI
5. Message history saved to Supabase

## Security

- Environment variables for sensitive credentials
- SQL validation to prevent injection
- Supabase RLS for data access control
