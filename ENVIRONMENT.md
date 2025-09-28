# Environment Configuration Guide

This document provides comprehensive information about environment variables and configuration options for the Minimal Venture Analysis application.

## Overview

The application is designed with flexibility in mind, supporting:
- **Switchable storage backends** (memory vs database)
- **Multiple AI providers** with automatic fallback
- **Feature flags** for experimental functionality
- **Environment-specific configurations** for development and production

## Environment Variables Reference

### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Node.js environment mode |
| `PORT` | No | `5000` | Server port (required for deployment) |

### Storage Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE` | No | `mem` | Storage backend selection (`mem` or `db`) |
| `DATABASE_URL` | Conditional | - | PostgreSQL connection string (required when `STORAGE=db`) |

#### Storage Backend Details

**Memory Storage (`STORAGE=mem`)**
- ✅ **Pros**: Fast, no setup required, perfect for development
- ❌ **Cons**: Data lost on server restart, not suitable for production
- **Use cases**: Development, testing, quick deployments, demos

**Database Storage (`STORAGE=db`)**
- ✅ **Pros**: Persistent data, production-ready, scalable
- ❌ **Cons**: Requires database setup and configuration
- **Use cases**: Production deployments, data persistence required

### AI Provider Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Conditional | - | Google Gemini API key (primary provider) |
| `OPENAI_API_KEY` | Conditional | - | OpenAI API key (fallback provider) |

**At least one AI provider API key is required** for the application to function.

#### AI Provider Fallback Logic

1. **Primary**: Google Gemini (`gemini-1.5-flash` model)
2. **Fallback**: OpenAI (`gpt-4o-mini` model)
3. **Error**: If both fail, user receives error message

### Client Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE` | No | `""` | API base URL for client-server communication |

#### API Base URL Configuration

- **Development**: Set to `http://localhost:5000` if client and server run on different ports
- **Production**: Leave empty (`""`) for same-origin requests
- **Custom**: Set to your API server URL if deployed separately

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_ENABLE_EXTRAS` | No | `0` | Enable experimental features (`0` or `1`) |

#### Feature Flag Behavior

**Minimal Mode (`VITE_ENABLE_EXTRAS=0`)**
- Core URL analysis functionality only
- Lightweight bundle size (~200KB smaller)
- Fast loading times
- Recommended for production

**Full Mode (`VITE_ENABLE_EXTRAS=1`)**
- All experimental features enabled
- Analytics charts and visualizations
- AI assistant and batch analysis
- Larger bundle size

## Configuration Examples

### Development Setup

```bash
# .env file for development
NODE_ENV=development
PORT=5000
STORAGE=mem
GEMINI_API_KEY=your_gemini_key_here
VITE_ENABLE_EXTRAS=0
```

### Production Setup (Memory Storage)

```bash
# .env file for production with memory storage
NODE_ENV=production
PORT=5000
STORAGE=mem
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
VITE_ENABLE_EXTRAS=0
```

### Production Setup (Database Storage)

```bash
# .env file for production with database storage
NODE_ENV=production
PORT=5000
STORAGE=db
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
VITE_ENABLE_EXTRAS=0
```

## Storage Switching Guide

### Switching from Memory to Database

1. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb venturesclone
   ```

2. **Update environment variables**
   ```bash
   STORAGE=db
   DATABASE_URL=postgresql://user:password@localhost:5432/venturesclone
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Restart the application**
   ```bash
   npm run build
   npm start
   ```

### Switching from Database to Memory

1. **Update environment variables**
   ```bash
   STORAGE=mem
   # DATABASE_URL can be left as-is (will be ignored)
   ```

2. **Restart the application**
   ```bash
   npm run dev
   ```

**Note**: Switching to memory storage will lose all existing data from the database.

## NPM Scripts for Different Configurations

### Development Scripts

```bash
# Standard development (uses .env file)
npm run dev

# Force minimal mode development
npm run dev:minimal

# Force full features development
npm run dev:full
```

### Production Scripts

```bash
# Build for minimal mode
npm run build:minimal

# Build for full features
npm run build:full

# Start production server (minimal mode)
npm run start:minimal
```

### Utility Scripts

```bash
# Check current environment configuration
npm run lint:env

# Type checking
npm run typecheck

# Clean build artifacts
npm run clean
```

## Troubleshooting

### Common Issues

**"At least one AI provider API key is required"**
- Ensure either `GEMINI_API_KEY` or `OPENAI_API_KEY` is set
- Check that API keys are valid and have sufficient credits

**"DbStorage not implemented yet"**
- You're using `STORAGE=db` but the database implementation isn't ready
- Switch to `STORAGE=mem` for now

**Client can't connect to server**
- Check `VITE_API_BASE` configuration
- Ensure server is running on the expected port
- Verify CORS settings if running on different origins

### Environment Validation

Use the built-in environment checker:

```bash
npm run lint:env
```

This will display:
- Current storage mode
- Feature flag status
- Available AI provider keys

### Debug Mode

For detailed logging, set:

```bash
NODE_ENV=development
```

This enables:
- Request/response logging
- Detailed error messages
- Development-specific features

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate keys regularly
- Monitor API usage and costs

### Database Connections
- Use connection pooling in production
- Implement proper connection string security
- Consider using connection encryption (SSL)

### Environment Files
- Add `.env` to `.gitignore`
- Use `.env.example` for documentation only
- Validate environment variables on startup

## Migration Path

The application is designed to support easy migration from memory to database storage:

1. **Phase 1**: Start with `STORAGE=mem` for quick deployment
2. **Phase 2**: Set up database infrastructure
3. **Phase 3**: Switch to `STORAGE=db` for persistence
4. **Phase 4**: Implement data migration tools (future enhancement)

This approach allows for rapid prototyping and gradual scaling as needed.