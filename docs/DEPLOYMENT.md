# Deployment Guide

This guide covers deployment strategies for VentureClone AI, including phased rollout approaches and configuration options.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (or Neon Database account)
- At least one AI provider API key (Gemini, Grok, or OpenAI)
- Environment variables configured (see `.env.example`)

## Standard Deployment

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build all components (shared, server, client)
npm run build
```

### 2. Configure Environment

Create a `.env` file with production settings:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Storage Configuration
STORAGE=db
DATABASE_URL=postgresql://user:password@host:port/database

# AI Provider Keys (at least one required)
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key

# Feature Flags
VITE_ENABLE_EXTRAS=0
ENABLE_TECH_DETECTION=true
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

### 4. Start Production Server

```bash
npm start
```

## Technology Detection & Insights Feature

### Overview

The technology detection and insights feature transforms raw tech stack data into actionable business intelligence. This comprehensive system:

**Technology Detection:**
- Uses Wappalyzer to accurately identify technologies used by analyzed websites
- Runs in parallel with AI analysis for minimal performance impact
- Provides accurate tech stack detection with confidence scores
- Falls back gracefully to AI-only analysis if detection fails

**Technology Insights Engine:**
- Generates actionable recommendations and alternatives for detected technologies
- Provides build-vs-buy analysis with SaaS alternatives and cost comparisons
- Maps skill requirements with proficiency levels and learning resources
- Calculates realistic time and cost estimates based on tech stack complexity
- Combines technical, market, and resource factors into a comprehensive clonability score (1-10)

**Enhanced Complexity Analysis:**
- Breaks down complexity by frontend (0-3), backend (0-4), and infrastructure (0-3)
- Uses weighted scoring by category importance
- Considers technology count, licensing complexity, and maturity
- Provides detailed explanations for complexity scores

**Technology Knowledge Base:**
- Contains 50+ technology profiles with alternatives, costs, and learning resources
- Loaded into memory on server start for fast O(1) lookups
- Easily extensible by adding entries to JSON file
- Provides fallback recommendations for unknown technologies

**Performance Optimization:**
- Insights generation completes in <500ms (excluding tech detection)
- 24-hour caching for repeated analyses
- In-memory knowledge base for fast lookups
- Parallel processing where possible

**Integration Points:**
- Enhances AI recommendations in Stage 3 (MVP Planning) with detected tech and alternatives
- Informs Stage 6 (AI Automation) with automation opportunities based on tech stack
- Provides comprehensive technology analysis in analysis results
- Exports insights in PDF, HTML, and JSON formats

### Feature Flag Control

The technology detection feature can be controlled via the `ENABLE_TECH_DETECTION` environment variable:

```env
# Enable technology detection (default)
ENABLE_TECH_DETECTION=true

# Disable technology detection
ENABLE_TECH_DETECTION=false
```

### Phased Rollout Strategy

For production deployments, we recommend a phased rollout approach:

#### Phase 1: Canary Deployment (Week 1)

Deploy with tech detection enabled to a small subset of users (5-10%):

```env
ENABLE_TECH_DETECTION=true
```

**Monitoring checklist:**
- [ ] Check tech detection success rate (target: >80%)
- [ ] Monitor average detection time (target: <10 seconds)
- [ ] Track fallback rate (target: <20%)
- [ ] Verify no increase in error rates
- [ ] Confirm total analysis time increase <10%

**Success criteria:**
- Tech detection success rate >80%
- No significant performance degradation
- No increase in user-reported issues
- Positive feedback on tech stack accuracy

#### Phase 2: Gradual Rollout (Week 2-3)

If Phase 1 is successful, gradually increase to 25%, then 50%, then 75%:

```env
ENABLE_TECH_DETECTION=true
```

**Monitoring checklist:**
- [ ] Continue monitoring success rates and performance
- [ ] Track user feedback on tech stack accuracy
- [ ] Monitor system resource usage (CPU, memory)
- [ ] Check for any edge cases or failure patterns

#### Phase 3: Full Rollout (Week 4)

Deploy to 100% of users:

```env
ENABLE_TECH_DETECTION=true
```

**Post-rollout monitoring:**
- [ ] Establish baseline metrics for ongoing monitoring
- [ ] Set up alerts for degraded performance
- [ ] Document any issues and resolutions
- [ ] Gather user feedback for future improvements

### Rollback Plan

If issues occur during rollout, immediately disable tech detection:

```env
ENABLE_TECH_DETECTION=false
```

**Rollback procedure:**
1. Update environment variable to `ENABLE_TECH_DETECTION=false`
2. Restart application (no code changes needed)
3. Verify system returns to AI-only analysis
4. Investigate and fix issues
5. Re-enable after validation

**Note:** Disabling tech detection has no impact on user experience - the system gracefully falls back to AI-only analysis.

## Performance Monitoring

### Key Metrics to Monitor

1. **Tech Detection Success Rate**
   - Target: >80%
   - Alert threshold: <70%

2. **Average Detection Time**
   - Target: <10 seconds
   - Alert threshold: >15 seconds

3. **Insights Generation Time**
   - Target: <500ms
   - Alert threshold: >1000ms

4. **Knowledge Base Coverage**
   - Target: >70% of detected technologies have profiles
   - Alert threshold: <50%

5. **Cache Hit Rate**
   - Target: >80%
   - Alert threshold: <60%

6. **Fallback Rate**
   - Target: <20%
   - Alert threshold: >30%

7. **Total Analysis Time**
   - Target: <10% increase vs AI-only
   - Alert threshold: >15% increase

8. **Error Rate**
   - Target: <5%
   - Alert threshold: >10%

### Monitoring Endpoints

Check system health and performance:

```bash
# Health check with performance metrics
curl https://your-domain.com/api/healthz
```

Response includes:
- Tech detection success rate
- Average detection time
- Fallback rate
- Overall system health

### Log Analysis

Tech detection logs include structured data for analysis:

```json
{
  "requestId": "abc123",
  "url": "https://example.com",
  "service": "tech-detection",
  "duration": 8500,
  "success": true,
  "technologiesDetected": 12,
  "timestamp": "2025-01-10T12:00:00Z",
  "level": "INFO"
}
```

Query logs to calculate metrics:
- Success rate: `(successful detections / total attempts) * 100`
- Average time: `sum(duration) / count(attempts)`
- Fallback rate: `(failed detections / total attempts) * 100`

## Troubleshooting

### Tech Detection Failures

**Symptom:** High fallback rate (>30%)

**Possible causes:**
1. Network connectivity issues
2. Target websites blocking requests
3. Wappalyzer service issues
4. Timeout configuration too aggressive

**Solutions:**
1. Check network connectivity from server
2. Review error logs for patterns
3. Adjust timeout if needed (default: 15 seconds)
4. Temporarily disable feature if persistent issues

### Performance Degradation

**Symptom:** Analysis time increased >15%

**Possible causes:**
1. Slow target websites
2. High concurrent request load
3. Resource constraints (CPU, memory)

**Solutions:**
1. Monitor concurrent request limits
2. Scale server resources if needed
3. Adjust timeout configuration
4. Consider caching for frequently analyzed URLs

### Memory Issues

**Symptom:** High memory usage or OOM errors

**Possible causes:**
1. Large HTML responses from target websites
2. Memory leaks in detection service
3. Insufficient server resources

**Solutions:**
1. Monitor memory usage patterns
2. Review HTML content size limits
3. Restart service if memory leak suspected
4. Scale server resources

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
STORAGE=mem
ENABLE_TECH_DETECTION=true
VITE_ENABLE_EXTRAS=0
```

### Staging

```env
NODE_ENV=production
STORAGE=db
DATABASE_URL=postgresql://staging-db-url
ENABLE_TECH_DETECTION=true
VITE_ENABLE_EXTRAS=0
```

### Production

```env
NODE_ENV=production
STORAGE=db
DATABASE_URL=postgresql://production-db-url
ENABLE_TECH_DETECTION=true
VITE_ENABLE_EXTRAS=0
```

## Scaling Considerations

### Horizontal Scaling

The application supports horizontal scaling with multiple instances:

- **Stateless design**: No server-side state beyond database
- **Session storage**: PostgreSQL-backed sessions work across instances
- **Load balancing**: Standard HTTP load balancing works
- **Database pooling**: Configure connection pooling for multiple instances

### Caching Strategy (Future Enhancement)

Consider implementing caching for tech detection results:

- **Cache key**: URL hash
- **TTL**: 24 hours
- **Storage**: Redis or in-memory cache
- **Invalidation**: Time-based or manual

This can significantly reduce detection overhead for frequently analyzed URLs.

## Security Considerations

### URL Validation

The tech detection service includes built-in security measures:

- URL format validation
- Protocol restrictions (HTTP/HTTPS only)
- Private IP range blocking (localhost, 192.168.x.x, 10.x.x.x, etc.)
- URL length limits (max 2048 characters)

### Rate Limiting

Existing rate limiting applies to all analysis requests:

- Default: 10 requests per 5 minutes per IP+user
- Configure via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`

### API Key Security

- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate keys regularly
- Monitor API usage and costs

## Backup and Recovery

### Database Backups

Ensure regular database backups:

```bash
# PostgreSQL backup
pg_dump -U user -d database > backup.sql

# Restore
psql -U user -d database < backup.sql
```

### Configuration Backups

Keep backups of:
- `.env` file (without sensitive values)
- Database schema
- Deployment scripts

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review performance metrics
   - Check error logs
   - Monitor API usage and costs

2. **Monthly:**
   - Update dependencies
   - Review and rotate API keys
   - Analyze user feedback

3. **Quarterly:**
   - Performance optimization review
   - Security audit
   - Capacity planning

### Getting Help

For deployment issues:
1. Check this deployment guide
2. Review error logs and metrics
3. Consult the troubleshooting section
4. Create an issue in the repository

## Technology Knowledge Base Management

### Structure

The technology knowledge base is stored in `server/data/technology-knowledge-base.json` and contains profiles for 50+ technologies. Each profile includes:

```json
{
  "name": "React",
  "category": "frontend-framework",
  "difficulty": "intermediate",
  "alternatives": [
    {
      "name": "Vue.js",
      "reason": "Easier learning curve, good for solo developers",
      "difficulty": "beginner",
      "timeSavings": 40,
      "complexityReduction": 2
    }
  ],
  "estimatedCost": {
    "development": { "min": 80, "max": 160 },
    "monthly": { "min": 0, "max": 0 }
  },
  "saasAlternatives": [],
  "learningResources": [
    {
      "title": "React Official Tutorial",
      "url": "https://react.dev/learn",
      "type": "documentation",
      "difficulty": "beginner"
    }
  ],
  "popularity": 10,
  "maturity": "mature",
  "licensing": "open-source"
}
```

### Adding New Technologies

To add a new technology to the knowledge base:

1. **Edit the JSON file**: Open `server/data/technology-knowledge-base.json`

2. **Add a new entry** following the structure above:
   - `name`: Technology name (must match Wappalyzer detection name)
   - `category`: One of: frontend-framework, backend-framework, database, hosting, authentication, payment, cms, analytics, cdn, other
   - `difficulty`: beginner, intermediate, or advanced
   - `alternatives`: Array of simpler alternatives with time savings
   - `estimatedCost`: Development hours (min/max) and monthly cost (min/max)
   - `saasAlternatives`: Array of SaaS alternatives (for custom solutions)
   - `learningResources`: Array of learning resources with URLs
   - `popularity`: 1-10 scale
   - `maturity`: experimental, stable, mature, or legacy
   - `licensing`: open-source, commercial, or freemium

3. **Restart the server**: The knowledge base is loaded on server start

4. **Verify**: Check that the new technology appears in insights for analyses that detect it

### Best Practices

- **Keep alternatives relevant**: Only suggest alternatives that are genuinely simpler or more suitable for MVPs
- **Accurate time savings**: Base time savings on realistic development hour estimates
- **Quality learning resources**: Link to official documentation, high-quality tutorials, or courses
- **Update regularly**: Review and update profiles as technologies evolve
- **Test thoroughly**: Verify that new entries work correctly in the insights generation flow

### Fallback Behavior

If a detected technology is not in the knowledge base:
- The system provides generic recommendations based on category
- Logs the missing technology for future addition
- Continues with available data without errors

## Migration Guide for Existing Analyses

### Database Schema Changes

The tech insights feature adds new fields to the `businessAnalyses` table:

```sql
ALTER TABLE business_analyses 
ADD COLUMN technology_insights JSONB,
ADD COLUMN clonability_score JSONB,
ADD COLUMN enhanced_complexity JSONB,
ADD COLUMN insights_generated_at TIMESTAMP;
```

### Migrating Existing Data

Existing analyses will not have insights data. To regenerate insights:

**Option 1: Automatic Regeneration (Recommended)**
- Insights are generated on-demand when viewing an analysis
- No manual intervention required
- Cached for 24 hours after generation

**Option 2: Batch Regeneration**
- Create a script to re-analyze existing URLs
- Useful for ensuring all analyses have insights
- Can be run during off-peak hours

```typescript
// Example batch regeneration script
import { db } from './server/minimal-storage';
import { TechnologyInsightsService } from './server/services/technology-insights';

async function regenerateInsights() {
  const analyses = await db.getAllAnalyses();
  
  for (const analysis of analyses) {
    if (!analysis.technologyInsights && analysis.structured?.technical?.actualDetected) {
      const insights = await insightsService.generateInsights(
        analysis.structured.technical.actualDetected
      );
      
      await db.updateAnalysis(analysis.id, {
        technologyInsights: insights,
        insightsGeneratedAt: new Date()
      });
    }
  }
}
```

**Option 3: No Migration**
- Leave existing analyses as-is
- Only new analyses will have insights
- Simplest approach if historical data is not critical

### Backward Compatibility

The system is designed to be backward compatible:
- Analyses without insights display normally
- UI gracefully handles missing insights data
- No breaking changes to existing functionality
- Feature can be disabled via `ENABLE_TECH_DETECTION=false`

## Changelog

### v3.1 (January 2025)
- Added Technology Insights Engine with actionable recommendations
- Implemented Technology Knowledge Base with 50+ technology profiles
- Added Enhanced Complexity Calculator with detailed breakdown
- Implemented Clonability Score combining technical, market, and resource factors
- Added skill requirements analysis with learning resources
- Implemented build-vs-buy recommendations with SaaS alternatives
- Added time and cost estimation based on tech stack
- Implemented 24-hour caching for insights
- Enhanced Stage 3 and Stage 6 AI prompts with insights data
- Added comprehensive UI components for insights display

### v3.0 (January 2025)
- Added technology detection feature with Wappalyzer integration
- Implemented feature flag for phased rollout
- Added complexity scoring based on detected technologies
- Enhanced AI prompts with detected tech stack data
- Added comprehensive monitoring and logging
