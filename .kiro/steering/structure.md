# Project Structure

## Root Level Organization
```
├── client/           # Frontend React application
├── server/           # Backend Express.js application  
├── shared/           # Shared TypeScript code (schemas, types)
├── drizzle/          # Database migrations
├── .kiro/            # Kiro AI assistant configuration
└── dist/             # Production build output
```

## Client Structure (`client/`)
- **index.html**: Main HTML entry point
- **src/**: React application source code
  - Components organized by feature/page
  - Uses `@/` path alias for clean imports
  - Follows component-based architecture with shadcn/ui patterns

## Server Structure (`server/`)
- **index.ts**: Main server entry point with Express setup
- **routes.ts**: API route registration and organization
- **services/**: Business logic and external service integrations
- **storage.ts**: Database abstraction layer
- **migrate.ts**: Database migration runner
- **vite.ts**: Development server integration

## Shared Code (`shared/`)
- **schema.ts**: Drizzle database schemas and Zod validation schemas
  - Database table definitions (users, aiProviders, businessAnalyses, workflowStages)
  - Type inference for TypeScript
  - Insert/update schemas with validation

## Key Conventions

### Import Aliases
- `@/*` → `client/src/*` (frontend code)
- `@shared/*` → `shared/*` (shared schemas and types)
- `@assets/*` → `attached_assets/*` (static assets)

### File Naming
- Use kebab-case for files and directories
- TypeScript files use `.ts` extension (`.tsx` for React components)
- Database migrations in `drizzle/` folder with sequential numbering

### Code Organization
- **Separation of Concerns**: Clear boundaries between client, server, and shared code
- **Type Safety**: Shared schemas ensure consistent types across frontend and backend
- **Modular Routes**: Server routes organized by feature/resource
- **Component Structure**: React components follow shadcn/ui patterns with proper prop typing

### Database Schema Patterns
- All tables use UUID primary keys with `gen_random_uuid()`
- Consistent naming: camelCase for columns, snake_case in database
- Foreign key relationships properly defined
- Timestamps for audit trails (createdAt, updatedAt)
- JSONB columns for flexible data storage (scoreDetails, aiInsights, stageData)