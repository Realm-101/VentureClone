# VentureClone AI - Project Structure

## Overview

VentureClone AI follows a monorepo structure with clear separation between client, server, and shared code. This document provides a comprehensive guide to the project organization.

## Root Directory Structure

```
ventureClone/
├── client/              # React frontend application
├── server/              # Express backend application
├── shared/              # Shared TypeScript code (schemas, types)
├── docs/                # Documentation files
├── drizzle/             # Database migrations
├── migrations/          # Legacy migrations (deprecated)
├── .github/             # GitHub workflows and templates
├── .kiro/               # Kiro AI assistant configuration
│   ├── settings/        # MCP and other settings
│   ├── specs/           # Feature specifications
│   └── steering/        # AI steering rules
└── dist/                # Production build output
```

## Client Structure (`client/`)

### Directory Layout

```
client/
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui base components
│   │   └── __tests__/   # Component tests
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML entry point
└── dist/                # Build output
```

### Key Components

**Core UI Components:**
- `workflow-tabs.tsx` - Stage navigation and display
- `progress-tracker.tsx` - Progress sidebar
- `clonability-scorecard.tsx` - Scorecard display
- `export-dropdown.tsx` - Export functionality
- `business-improvement.tsx` - Improvement results display
- `ai-provider-modal.tsx` - AI provider configuration

**Enhanced Analysis Components:**
- `technology-stack.tsx` - Tech stack display with insights
- `complexity-breakdown.tsx` - Complexity analysis visualization
- `skill-requirements-section.tsx` - Skill mapping display
- `build-vs-buy-section.tsx` - Build vs buy recommendations
- `estimates-card.tsx` - Time and cost estimates
- `recommendations-section.tsx` - Actionable recommendations
- `clonability-score-card.tsx` - Enhanced scorecard with methodology

### Import Aliases

- `@/` → `client/src/` (frontend code)
- `@shared/` → `shared/` (shared schemas and types)

## Server Structure (`server/`)

### Directory Layout

```
server/
├── services/            # Business logic and external integrations
│   ├── ai-providers.ts          # AI provider integration
│   ├── workflow.ts              # 6-stage workflow management
│   ├── tech-detection.ts        # Wappalyzer integration
│   ├── technology-insights.ts   # Technology analysis engine
│   ├── technology-knowledge-base.ts  # Tech profiles
│   ├── complexity-calculator.ts # Complexity scoring
│   ├── clonability-score.ts     # Clonability scoring
│   ├── business-improvement.ts  # Improvement generation
│   ├── export-service.ts        # Export functionality
│   ├── validation.ts            # Stage content validation
│   ├── performance-monitor.ts   # Performance tracking
│   └── insights-cache.ts        # Insights caching
├── lib/                 # Utility functions
│   ├── validation.ts            # Input validation
│   ├── retry.ts                 # Retry logic
│   ├── fetchFirstParty.ts       # First-party data extraction
│   └── export-utils.ts          # Export utilities
├── middleware/          # Express middleware
│   ├── errorHandler.ts          # Error handling
│   ├── rateLimit.ts             # Rate limiting
│   └── user.ts                  # User context
├── data/                # Static data files
│   └── technology-knowledge-base.json
├── __tests__/           # Test files
├── types/               # TypeScript type definitions
├── index.ts             # Server entry point
├── routes.ts            # API route registration
├── minimal-storage.ts   # Database abstraction
├── migrate.ts           # Migration runner
└── vite.ts              # Development server integration
```

### Key Services

**AI & Analysis:**
- `ai-providers.ts` - Multi-provider AI integration (Gemini, Grok, OpenAI)
- `workflow.ts` - 6-stage workflow orchestration
- `business-improvement.ts` - AI-powered improvement generation

**Technology Analysis:**
- `tech-detection.ts` - Wappalyzer-based tech stack detection
- `technology-insights.ts` - Actionable insights generation
- `technology-knowledge-base.ts` - 50+ technology profiles
- `complexity-calculator.ts` - Enhanced complexity scoring
- `clonability-score.ts` - Comprehensive clonability scoring

**Infrastructure:**
- `export-service.ts` - PDF, HTML, JSON export generation
- `performance-monitor.ts` - System health monitoring
- `insights-cache.ts` - 24-hour insights caching
- `validation.ts` - Stage content validation

## Shared Code (`shared/`)

### Schema Organization

```
shared/
└── schema.ts            # All schemas and types
    ├── Database schemas (Drizzle)
    ├── Zod validation schemas
    └── TypeScript type exports
```

### Key Schemas

**Database Tables:**
- `users` - User accounts
- `aiProviders` - AI provider configurations
- `businessAnalyses` - Business analysis records
- `workflowStages` - Workflow stage data

**Validation Schemas:**
- Insert/update schemas with Zod validation
- Type inference for TypeScript
- Shared between client and server

## Documentation (`docs/`)

```
docs/
├── API.md                          # API reference
├── DEPLOYMENT.md                   # Deployment guide
├── FEATURES.md                     # Feature documentation
├── MIGRATION_GUIDE_v3.1.md        # Migration guide
├── SCORING_METHODOLOGY.md         # Scoring details
└── TECHNOLOGY_KNOWLEDGE_BASE.md   # Tech profiles reference
```

## Database (`drizzle/`)

```
drizzle/
└── 0000_*.sql           # Migration files (sequential)
```

**Migration Workflow:**
1. Update `shared/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration
4. Use `npm run db:studio` to inspect database

## Configuration Files

### Root Level

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `components.json` - shadcn/ui configuration
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore rules

### Environment Variables

See [ENVIRONMENT.md](ENVIRONMENT.md) for complete reference.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- At least one AI provider API key

**Optional:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ENABLE_TECH_DETECTION` - Feature flag (default: true)

## Build Output (`dist/`)

```
dist/
├── public/              # Built frontend assets
│   ├── assets/          # JS, CSS, images
│   └── index.html       # Entry HTML
└── index.js             # Bundled server code
```

## Testing Structure

### Test Organization

```
server/__tests__/
├── *.test.ts            # Test files
└── README.md            # Test documentation

client/src/components/__tests__/
└── *.test.tsx           # Component tests
```

### Test Categories

- **Unit Tests**: Individual function/component testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: End-to-end workflow testing
- **Performance Tests**: Response time and concurrency testing

## Development Workflow

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open database UI
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Building
npm run build            # Build entire app
npm run build:shared     # Build shared code
npm run build:server     # Bundle server
npm run build:client     # Build frontend

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode

# Production
npm start                # Start production server
```

### Development Flow

1. **Feature Development**
   - Create feature branch
   - Update code in appropriate directory
   - Add tests
   - Update documentation

2. **Database Changes**
   - Modify `shared/schema.ts`
   - Generate migration
   - Test migration
   - Update related code

3. **Testing**
   - Write tests alongside code
   - Run tests locally
   - Ensure coverage
   - Fix any issues

4. **Documentation**
   - Update relevant docs
   - Add JSDoc comments
   - Update README if needed

## Code Organization Principles

### Separation of Concerns

- **Client**: UI and user interaction only
- **Server**: Business logic and data management
- **Shared**: Common schemas and types

### Type Safety

- Strict TypeScript throughout
- Zod validation for runtime checks
- Shared types prevent drift

### Modularity

- Services are independent and testable
- Components are reusable
- Clear interfaces between layers

### Performance

- Concurrent request handling
- Caching where appropriate
- Optimized database queries
- Efficient bundling

## File Naming Conventions

- **TypeScript files**: `kebab-case.ts`
- **React components**: `PascalCase.tsx` or `kebab-case.tsx`
- **Test files**: `*.test.ts` or `*.test.tsx`
- **Type definitions**: `*.d.ts`
- **Configuration**: `*.config.ts` or `*.config.js`

## Import Conventions

### Absolute Imports (Preferred)

```typescript
// Client code
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// Server code
import { db } from './minimal-storage';
import { analyzeBusinessSchema } from '@shared/schema';
```

### Relative Imports (When Necessary)

```typescript
// Same directory
import { helper } from './helper';

// Parent directory
import { service } from '../services/service';
```

## Best Practices

### Component Organization

- One component per file
- Co-locate tests with components
- Use TypeScript interfaces for props
- Export named components

### Service Organization

- One service per file
- Clear function signatures
- Comprehensive error handling
- Proper logging

### Database Operations

- Use Drizzle ORM exclusively
- Parameterized queries only
- Proper transaction handling
- Index frequently queried columns

### Error Handling

- Use custom error classes
- Centralized error middleware
- Proper error logging
- User-friendly error messages

## Security Considerations

- Environment variables for secrets
- Input validation on all endpoints
- SQL injection prevention (Drizzle)
- XSS prevention (React)
- CSRF protection (sessions)
- Rate limiting on API endpoints

## Performance Optimization

- Code splitting (Vite)
- Lazy loading components
- Database query optimization
- Response caching
- Concurrent request handling
- Efficient bundling

---

*Last Updated: January 2025*
*Version: 3.1*
