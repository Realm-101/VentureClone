# VentureClone AI - Quick Start Guide

Get up and running with VentureClone AI in 5 minutes!

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon Database account)
- At least one AI provider API key (Gemini or Grok recommended)

---

## Installation

### 1. Clone & Install

```bash
git clone <repository-url>
cd ventureClone
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/ventureClone

# AI Providers (at least one required)
GEMINI_API_KEY=your_gemini_api_key_here
GROK_API_KEY=your_grok_api_key_here

# Session (required)
SESSION_SECRET=your_random_secret_here
```

### 3. Setup Database

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5000`

---

## Getting API Keys

### Google Gemini (Recommended)
1. Visit: https://ai.google.dev/
2. Click "Get API Key"
3. Create new project or select existing
4. Copy API key to `.env` as `GEMINI_API_KEY`

### Grok (Alternative)
1. Visit: https://x.ai/
2. Sign up for API access
3. Generate API key
4. Copy to `.env` as `GROK_API_KEY`

### OpenAI (Optional)
1. Visit: https://platform.openai.com/
2. Create account and add payment method
3. Generate API key
4. Copy to `.env` as `OPENAI_API_KEY`

---

## First Analysis

### Step 1: Enter URL
- Navigate to home page
- Enter a business URL (e.g., `https://example.com`)
- Click "Analyze Business"

### Step 2: Review Stage 1
- Wait for analysis (up to 120 seconds)
- Review cloneability scorecard
- Check SWOT analysis
- Generate business improvements (optional)
- Export as PDF, HTML, or JSON

### Step 3: Continue Through Stages
- Click "Continue to Stage 2"
- Review effort/reward analysis
- Continue through remaining stages
- Export individual stages or complete plan

---

## Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run db:studio        # Open database UI
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
```

### Production
```bash
npm run build            # Build for production
npm start                # Start production server
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

---

## Troubleshooting

### "Analysis timeout"
- Check your AI provider API key is valid
- Ensure you have internet connectivity
- Try a different AI provider

### "Database connection failed"
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database credentials

### "No AI provider available"
- Add at least one API key to `.env`
- Restart the server after adding keys
- Verify API key is valid

### "Port already in use"
- Change port in `.env`: `PORT=3000`
- Or kill process using port 5000

---

## Quick Tips

### Best Practices
- Use Gemini 2.5 Pro for best quality
- Allow full 120 seconds for complex analyses
- Export stages as you complete them
- Review methodology link in Stage 2

### Performance
- First analysis may take longer (cold start)
- Subsequent analyses are faster
- Export generation is quick (< 5 seconds)

### Workflow
- Complete stages in order for best results
- Stage 1 & 2 give quick go/no-go decision
- Complete all 6 stages for full business plan
- Export complete plan from Stage 6

---

## Next Steps

### Learn More
- Read [README.md](README.md) for detailed documentation
- Check [CHANGELOG.md](CHANGELOG.md) for version history
- Review [docs/SCORING_METHODOLOGY.md](docs/SCORING_METHODOLOGY.md) for scoring details

### Get Help
- Check troubleshooting section above
- Review documentation
- Create GitHub issue
- Contact support

---

## Production Deployment

### Build & Deploy

```bash
# Build application
npm run build

# Set production environment
export NODE_ENV=production

# Start server
npm start
```

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
SESSION_SECRET=<strong-random-secret>
GEMINI_API_KEY=<your-key>
PORT=5000
```

### Recommended Hosting

- **Database**: Neon Database (serverless PostgreSQL)
- **Application**: Railway, Render, or Heroku
- **Alternative**: VPS with PM2 process manager

---

## Support

Need help? We're here for you!

- 📖 Documentation: [README.md](README.md)
- 🐛 Issues: Create GitHub issue
- 💬 Questions: Check troubleshooting section
- 📧 Contact: support@example.com

---

**Ready to clone your first business?** 🚀

Start analyzing now at `http://localhost:5000`
