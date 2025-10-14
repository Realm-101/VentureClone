# VentureClone AI

A systematic business cloning platform that analyzes online businesses for clonability potential using AI-powered insights across technical complexity, market opportunity, competitive landscape, resource requirements, and time to market.

## 🚀 Quick Start

**Get running in 5 minutes** → See [QUICK_START.md](QUICK_START.md)

```bash
npm install
cp .env.example .env  # Add your API keys
npm run db:migrate
npm run dev
```

## ✨ Key Features

- **6-Stage Workflow System**: Systematic process from discovery to AI automation
- **Technology Detection**: Wappalyzer-powered tech stack analysis with complexity scoring
- **Clonability Scoring**: Comprehensive 1-10 score across 5 weighted dimensions
- **Multi-Provider AI**: Support for Gemini 2.5 Pro, Grok 4, and OpenAI GPT-4
- **Business Improvements**: AI-generated strategies with 7-day implementation plans
- **Export Capabilities**: PDF, HTML, and JSON exports for all stages
- **Technology Insights**: Actionable recommendations, alternatives, and build-vs-buy analysis
- **Performance Optimized**: Sub-8-second response times with concurrent request handling

## 📋 Recent Updates (v3.1 - January 2025)

- ✅ Technology Insights Engine with 50+ technology profiles
- ✅ Enhanced complexity analysis (frontend/backend/infrastructure breakdown)
- ✅ Time & cost estimates based on detected tech stack
- ✅ Skill requirements mapping with learning resources
- ✅ Comprehensive scoring methodology documentation
- ✅ Stage-by-stage progress tracking
- ✅ Enhanced export functionality for all workflow stages

## 🏗️ System Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + Radix UI
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js 18+ + Express + TypeScript
- PostgreSQL + Drizzle ORM
- Multi-provider AI integration (Gemini, Grok, OpenAI)
- Session-based authentication

**Key Services:**
- Technology detection (Wappalyzer)
- Complexity analysis & scoring
- Business improvement generation
- Export service (PDF, HTML, JSON)
- Performance monitoring & caching

For detailed architecture information, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
## 🔐 Authentication

VentureClone AI uses **Stack Auth** for enterprise-grade authentication:

**Features:**
- ✅ Email/password authentication with verification
- ✅ Social login (Google, GitHub) - optional
- ✅ User profiles with avatars
- ✅ Session management with secure cookies
- ✅ Password reset functionality
- ✅ Protected routes

**Quick Setup:**
1. Create a free account at [Stack Auth](https://app.stack-auth.com/)
2. Add credentials to `.env`:
   ```env
   VITE_STACK_PROJECT_ID=your_project_id
   VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_key
   STACK_SECRET_SERVER_KEY=your_secret
   ```
3. Configure URLs in Stack dashboard
4. Start your app!

📚 **Detailed Guide:** [Authentication Quick Start](docs/AUTHENTICATION_QUICKSTART.md)

## 🔌 AI Provider Integration

VentureClone AI supports multiple AI providers with automatic fallback:

| Provider | Model | Best For | Setup |
|----------|-------|----------|-------|
| **Gemini** | 2.5 Pro | High-quality analysis | `GEMINI_API_KEY` |
| **Grok** | 4 Fast | Fast, reliable results | `GROK_API_KEY` |
| **OpenAI** | GPT-4 | Additional coverage | `OPENAI_API_KEY` |

**Features:**
- Evidence-based prompts with source attribution
- Confidence scoring (0.0-1.0)
- 120-second timeout for complex operations
- Automatic retry logic and error recovery
## ⚡ Performance

| Metric | Target | Details |
|--------|--------|---------|
| **First-Party Extraction** | ≤ 8s | Streaming HTML parsing |
| **AI Analysis** | ≤ 15s | Multi-provider fallback |
| **Business Improvements** | ≤ 30s | Comprehensive validation |
| **Total Request Time** | ≤ 45s | End-to-end |
| **Concurrent Analyses** | 5 max | Queue-based management |
| **Insights Cache** | 24h | Fast retrieval |

## 🔗 API Overview

### Key Endpoints

```typescript
POST /api/business-analyses/analyze    # Create new analysis
POST /api/business-analyses/:id/improve # Generate improvements
GET  /api/business-analyses            # List analyses
GET  /api/healthz                      # Health check
```

For complete API documentation, see [docs/API.md](docs/API.md)

## 🛠️ Development

### Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5000)
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Building
npm run build            # Build entire application
npm run build:shared     # Build shared code
npm run build:server     # Bundle server
npm run build:client     # Build frontend

# Production
npm start                # Start production server
```

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)

## 📖 Usage

### 6-Stage Workflow

1. **Discovery & Selection** - Initial analysis with cloneability scoring
2. **Lazy-Entrepreneur Filter** - Effort vs. reward analysis
3. **MVP Launch Planning** - Core features and tech stack
4. **Demand Testing Strategy** - Market validation approach
5. **Scaling & Growth** - Growth strategies and milestones
6. **AI Automation Mapping** - Automation opportunities

Each stage includes export options (PDF, HTML, JSON) and actionable insights.

For detailed usage instructions, see [docs/FEATURES.md](docs/FEATURES.md)

## ⚙️ Configuration

Environment variables control system behavior. See [ENVIRONMENT.md](ENVIRONMENT.md) for complete reference.

**Key Settings:**
- `ENABLE_TECH_DETECTION` - Enable/disable technology detection (default: true)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- AI provider API keys (at least one required)

## 🔧 Troubleshooting

**Common Issues:**
- **Analysis Timeout** → Check AI provider API keys and network connectivity
- **First-Party Extraction Fails** → Target website may block requests
- **High Error Rates** → Monitor system health at `/api/healthz`
- **Performance Issues** → Check concurrent request limits

For detailed troubleshooting, see [QUICK_START.md](QUICK_START.md#troubleshooting)

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Environment Setup](ENVIRONMENT.md)** - Environment variable reference
- **[Project Structure](PROJECT_STRUCTURE.md)** - Codebase organization guide

### Features & Usage
- **[Features Overview](docs/FEATURES.md)** - Detailed feature documentation
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Scoring Methodology](docs/SCORING_METHODOLOGY.md)** - How scores are calculated
- **[Technology Knowledge Base](docs/TECHNOLOGY_KNOWLEDGE_BASE.md)** - 50+ tech profiles

### Deployment & Migration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Migration Guide](docs/MIGRATION_GUIDE_v3.1.md)** - Upgrading from v3.0

### Development
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Release Notes v3.1](RELEASE_NOTES_v3.1.md)** - Latest release details

## 🧪 Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Quality Standards:**
- TypeScript strict mode enabled
- Comprehensive test coverage required
- Follow existing code patterns
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

- 📖 Check the [documentation](docs/)
- 🐛 [Create an issue](../../issues) for bugs
- 💡 [Request features](../../issues) via GitHub issues
- 📧 Contact support for urgent matters