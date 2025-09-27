# Technology Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Comprehensive Radix UI component library with custom styling

## Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions with PostgreSQL storage (connect-pg-simple)
- **AI Integration**: Multi-provider support (OpenAI, Google Gemini, Grok/X.AI)

## Database & Storage
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Database**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-backed sessions for persistence

## Development Tools
- **Package Manager**: npm
- **TypeScript**: Strict mode with path aliases (@/, @shared/)
- **Bundling**: esbuild for server, Vite for client
- **Environment**: ESM throughout, no CommonJS

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run db:studio        # Open Drizzle Studio for database management
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run database migrations
```

### Building
```bash
npm run build            # Build entire application (shared + server + client)
npm run build:shared     # Build shared TypeScript code
npm run build:server     # Bundle server with esbuild
npm run build:client     # Build client with Vite
```

### Production
```bash
npm start               # Start production server (requires build first)
```

## Architecture Patterns
- **Monorepo Structure**: Shared code between client and server
- **Type Safety**: End-to-end TypeScript with Zod validation
- **API Design**: RESTful endpoints with consistent error handling
- **Component Architecture**: Reusable UI components with proper separation of concerns