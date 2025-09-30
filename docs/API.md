# VentureClone AI API Documentation

## Overview

The VentureClone AI API provides comprehensive business analysis capabilities with enhanced features including first-party data extraction, AI-powered analysis, and business improvement suggestions.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

The API uses session-based authentication. Users must be authenticated to access analysis endpoints.

## Rate Limiting

- **Concurrent Analyses**: Maximum 5 simultaneous analysis requests
- **Request Deduplication**: Identical requests are automatically deduplicated
- **Timeout Limits**: Requests timeout after 45 seconds total

## Endpoints

### Health Check

#### GET /healthz

Returns system health status and performance metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "performance": {
    "avgResponseTime": 2500,
    "concurrentRequests": 2,
    "errorRate": 0.02,
    "systemHealth": "healthy"
  }
}
```

### Business Analysis

#### POST /business-analyses/analyze

Creates a new business analysis for the provided URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "goal": "Improve user engagement" // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://example.com",
  "summary": "AI-generated summary...",
  "model": "gemini:gemini-2.0-flash-exp",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "structured": {
    "overview": {
      "valueProposition": "Clear value proposition...",
      "targetAudience": "Target audience description...",
      "monetization": "Revenue model description..."
    },
    "market": {
      "competitors": [
        {
          "name": "Competitor Name",
          "url": "https://competitor.com",
          "notes": "Analysis notes..."
        }
      ],
      "swot": {
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "opportunities": ["Opportunity 1", "Opportunity 2"],
        "threats": ["Threat 1", "Threat 2"]
      }
    },
    "technical": {
      "techStack": ["React", "Node.js", "PostgreSQL"],
      "confidence": 0.85,
      "uiColors": ["#FF6B6B", "#4ECDC4"],
      "keyPages": ["/", "/pricing", "/about"]
    },
    "data": {
      "trafficEstimates": {
        "value": "10K-50K monthly visitors",
        "source": "https://similarweb.com"
      },
      "keyMetrics": [
        {
          "name": "Monthly Revenue",
          "value": "$10K-50K",
          "source": "https://source.com",
          "asOf": "2024-01-01"
        }
      ]
    },
    "synthesis": {
      "summary": "Executive summary of analysis...",
      "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
      "nextActions": ["Action 1", "Action 2", "Action 3"]
    },
    "sources": [
      {
        "url": "https://source.com",
        "excerpt": "Relevant excerpt from source..."
      }
    ]
  },
  "firstPartyData": {
    "title": "Website Title",
    "description": "Meta description...",
    "h1": "Main heading",
    "textSnippet": "Key content excerpt...",
    "url": "https://example.com"
  }
}
```

**Error Responses:**

```json
// Invalid URL
{
  "error": "VALIDATION_ERROR",
  "message": "Please enter a valid URL",
  "details": "URL validation failed"
}

// AI Service Error
{
  "error": "AI_PROVIDER_DOWN",
  "message": "AI analysis service is temporarily unavailable",
  "details": "Both primary and fallback providers failed"
}

// Rate Limit Exceeded
{
  "error": "RATE_LIMITED",
  "message": "Too many concurrent requests",
  "details": "Maximum 5 concurrent analyses allowed"
}

// Timeout Error
{
  "error": "GATEWAY_TIMEOUT",
  "message": "Analysis request timed out",
  "details": "Request exceeded 45 second limit"
}
```

#### GET /business-analyses

Retrieves all business analyses for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "url": "https://example.com",
    "summary": "Analysis summary...",
    "model": "gemini:gemini-2.0-flash-exp",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "structured": { /* Structured analysis data */ },
    "firstPartyData": { /* First-party data */ },
    "improvements": { /* Business improvements if generated */ }
  }
]
```

### Business Improvements

#### POST /business-analyses/:id/improve

Generates business improvement suggestions for an existing analysis.

**Request Body:**
```json
{
  "goal": "Increase conversion rate" // Optional specific goal
}
```

**Response:**
```json
{
  "analysisId": "uuid",
  "improvement": {
    "twists": [
      "Focus on mobile-first user experience to capture growing mobile traffic",
      "Implement freemium pricing model to lower barrier to entry",
      "Add social proof elements and customer testimonials for trust building"
    ],
    "sevenDayPlan": [
      {
        "day": 1,
        "tasks": [
          "Research target audience mobile usage patterns",
          "Analyze competitor mobile experiences",
          "Define mobile-first MVP requirements"
        ]
      },
      {
        "day": 2,
        "tasks": [
          "Create mobile wireframes and user flows",
          "Design responsive UI components",
          "Set up mobile development environment"
        ]
      },
      {
        "day": 3,
        "tasks": [
          "Implement core mobile functionality",
          "Add touch-optimized interactions",
          "Test on multiple device sizes"
        ]
      },
      {
        "day": 4,
        "tasks": [
          "Integrate freemium pricing logic",
          "Create upgrade prompts and flows",
          "Implement usage tracking"
        ]
      },
      {
        "day": 5,
        "tasks": [
          "Add customer testimonials section",
          "Implement social proof widgets",
          "Create trust badges and certifications"
        ]
      },
      {
        "day": 6,
        "tasks": [
          "Conduct mobile user testing",
          "Optimize conversion funnels",
          "Fix critical usability issues"
        ]
      },
      {
        "day": 7,
        "tasks": [
          "Launch improved mobile experience",
          "Monitor key conversion metrics",
          "Gather user feedback for iteration"
        ]
      }
    ],
    "generatedAt": "2024-01-01T12:00:00.000Z"
  },
  "generatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**

```json
// Analysis Not Found
{
  "error": "NOT_FOUND",
  "message": "Analysis not found",
  "details": "The requested analysis could not be found or you don't have permission to access it"
}

// Missing Structured Data
{
  "error": "BAD_REQUEST",
  "message": "Analysis does not have structured data required for improvement generation",
  "details": "This analysis does not contain the structured data needed to generate improvements"
}

// AI Generation Timeout
{
  "error": "TIMEOUT",
  "message": "Business improvement generation timed out",
  "details": "Request exceeded 30 second timeout limit"
}
```

## Data Models

### EnhancedStructuredAnalysis

```typescript
interface EnhancedStructuredAnalysis {
  overview: {
    valueProposition: string;
    targetAudience: string;
    monetization: string;
  };
  market: {
    competitors: Array<{
      name: string;
      url?: string;
      notes?: string;
    }>;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  };
  technical: {
    techStack: string[];
    confidence: number; // 0.0 to 1.0
    uiColors: string[];
    keyPages: string[];
  };
  data: {
    trafficEstimates?: {
      value: string;
      source?: string;
    };
    keyMetrics: Array<{
      name: string;
      value: string;
      source?: string;
      asOf?: string;
    }>;
  };
  synthesis: {
    summary: string;
    keyInsights: string[];
    nextActions: string[];
  };
  sources: Array<{
    url: string;
    excerpt: string;
  }>;
}
```

### BusinessImprovement

```typescript
interface BusinessImprovement {
  twists: [string, string, string]; // Exactly 3 improvement strategies
  sevenDayPlan: Array<{
    day: number; // 1-7
    tasks: string[]; // 1-3 tasks per day
  }>;
  generatedAt: string; // ISO timestamp
}
```

### FirstPartyData

```typescript
interface FirstPartyData {
  title: string;        // Page title
  description: string;  // Meta description
  h1: string;          // Main heading
  textSnippet: string; // Content excerpt (max 500 chars)
  url: string;         // Canonical URL
}
```

## Performance Characteristics

### Response Times

- **First-Party Extraction**: ≤ 8 seconds
- **AI Analysis**: ≤ 15 seconds  
- **Business Improvements**: ≤ 30 seconds
- **Total Request**: ≤ 45 seconds

### Concurrency Limits

- **Maximum Concurrent Analyses**: 5
- **Request Deduplication**: Automatic for identical URLs
- **Queue Management**: FIFO with timeout handling

### Resource Limits

- **HTML Content**: 2MB maximum per extraction
- **Response Size**: 5MB maximum
- **Memory Usage**: Optimized streaming processing

## Error Handling

### Error Codes

| Code | Description | Retry Recommended |
|------|-------------|-------------------|
| `VALIDATION_ERROR` | Invalid input parameters | No |
| `NOT_FOUND` | Resource not found | No |
| `BAD_REQUEST` | Invalid request format | No |
| `RATE_LIMITED` | Too many requests | Yes, after delay |
| `AI_PROVIDER_DOWN` | AI service unavailable | Yes, after delay |
| `GATEWAY_TIMEOUT` | Request timeout | Yes |
| `INTERNAL` | Server error | Yes |

### Retry Strategy

For retryable errors:
1. Wait 1 second before first retry
2. Use exponential backoff: 2s, 4s, 8s
3. Maximum 3 retry attempts
4. For rate limits, wait for the specified delay

## SDK Examples

### JavaScript/TypeScript

```typescript
class VentureCloneAPI {
  constructor(private baseUrl: string) {}

  async analyzeUrl(url: string, goal?: string) {
    const response = await fetch(`${this.baseUrl}/business-analyses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, goal }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async generateImprovements(analysisId: string, goal?: string) {
    const response = await fetch(`${this.baseUrl}/business-analyses/${analysisId}/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Improvement generation failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Usage
const api = new VentureCloneAPI('https://api.ventureClone.com/api');

try {
  const analysis = await api.analyzeUrl('https://example.com');
  console.log('Analysis completed:', analysis.id);
  
  const improvements = await api.generateImprovements(analysis.id, 'Increase user engagement');
  console.log('Improvements generated:', improvements.improvement.twists);
} catch (error) {
  console.error('API Error:', error.message);
}
```

### Python

```python
import requests
import json

class VentureCloneAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def analyze_url(self, url, goal=None):
        payload = {'url': url}
        if goal:
            payload['goal'] = goal
            
        response = self.session.post(
            f"{self.base_url}/business-analyses/analyze",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def generate_improvements(self, analysis_id, goal=None):
        payload = {}
        if goal:
            payload['goal'] = goal
            
        response = self.session.post(
            f"{self.base_url}/business-analyses/{analysis_id}/improve",
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage
api = VentureCloneAPI('https://api.ventureClone.com/api')

try:
    analysis = api.analyze_url('https://example.com')
    print(f"Analysis completed: {analysis['id']}")
    
    improvements = api.generate_improvements(analysis['id'], 'Increase conversion rate')
    print(f"Generated {len(improvements['improvement']['twists'])} improvement strategies")
except requests.RequestException as e:
    print(f"API Error: {e}")
```

## Webhooks (Future Feature)

*Note: Webhooks are planned for future releases to enable real-time notifications.*

```json
{
  "event": "analysis.completed",
  "data": {
    "analysisId": "uuid",
    "url": "https://example.com",
    "status": "completed",
    "completedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Support

For API support:
- Check the [troubleshooting guide](../README.md#troubleshooting)
- Review error codes and retry strategies above
- Monitor system health at `/api/healthz`
- Create an issue in the repository for bugs or feature requests