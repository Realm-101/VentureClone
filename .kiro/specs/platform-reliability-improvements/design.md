# Design Document

## Overview

This design enhances the VentureClone AI platform's reliability and observability by implementing four key improvements: unified error handling, request timeouts with rate limiting, comprehensive health monitoring, and structured analysis output. The design builds upon the existing Express.js architecture while maintaining backward compatibility and following established patterns.

## Architecture

### Current State Analysis
The platform currently has:
- Express.js server with middleware pipeline
- Multi-provider AI integration (Gemini + OpenAI fallback)
- In-memory storage with interface for future database migration
- Basic error handling and rate limiting
- Health check endpoint

### Proposed Enhancements
1. **Unified Error Response Format**: Standardize all API errors to `{ error: string, code: string, requestId: string }`
2. **Enhanced Request Management**: Add comprehensive timeouts, rate limiting, and request tracing
3. **Improved Health Monitoring**: Expand health checks with environment and build information
4. **Structured Analysis Output**: Add structured data parsing while maintaining backward compatibility

## Components and Interfaces

### 1. Error Handling System

#### Enhanced AppError Class
```typescript
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getErrorCode(statusCode);
  }
}
```

#### Unified Error Handler Middleware
- Catches all errors in the application
- Converts errors to consistent JSON format
- Includes request ID for traceability
- Maps HTTP status codes to standardized error codes

### 2. Request Management System

#### Enhanced fetchWithTimeout Utility
```typescript
interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string | URL | Request, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response>
```

#### Request ID Middleware
- Generates unique UUID for each request
- Accepts existing `x-request-id` header
- Adds request ID to response headers
- Attaches request ID to request object for logging

#### Enhanced Rate Limiting
- Per-user and per-IP rate limiting
- Configurable windows and limits via environment variables
- Memory-efficient cleanup of expired entries
- Consistent error responses

### 3. Health Monitoring System

#### Expanded Health Response
```typescript
interface HealthResponse {
  ok: boolean;
  env: string;
  storage: 'mem' | 'db';
  providers: {
    openai: boolean;
    gemini: boolean;
  };
  commit?: string;
}
```

#### Health Check Features
- Environment detection (development/production)
- Storage type identification
- AI provider availability status
- Build/commit information for deployment tracking

### 4. Structured Analysis System

#### Structured Analysis Schema
```typescript
interface StructuredAnalysis {
  overview: {
    valueProposition: string;
    targetAudience: string;
    monetization: string;
  };
  market: {
    competitors: Array<{name: string; url?: string; notes?: string}>;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  };
  technical?: {
    techStack?: string[];
  };
  data?: {
    keyMetrics?: Array<{name: string; value: string}>;
  };
  synthesis: {
    summary: string;
    keyInsights: string[];
    nextActions: string[];
  };
}
```

#### Analysis Storage Enhancement
```typescript
interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
  structured?: StructuredAnalysis;  // New optional field
}
```

## Data Models

### Storage Interface Updates
The existing `IStorage` interface in `minimal-storage.ts` will be enhanced to support the structured analysis field without breaking existing functionality:

```typescript
interface CreateAnalysisInput {
  url: string;
  summary: string;
  model: string;
  structured?: StructuredAnalysis;  // New optional field
}
```

### Memory Storage Corrections
Fix the in-place mutation issue in `MemStorage.listAnalyses()`:
```typescript
async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
  const userAnalyses = this.analyses.get(userId) || [];
  // Return sorted copy to avoid mutating internal state
  return [...userAnalyses].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
```

## Error Handling

### Error Classification System
- **400 BAD_REQUEST**: Invalid input, malformed URLs
- **401 UNAUTHORIZED**: Authentication failures
- **403 FORBIDDEN**: Authorization failures
- **404 NOT_FOUND**: Resource not found
- **429 RATE_LIMITED**: Rate limit exceeded
- **500 INTERNAL**: Server errors, configuration issues
- **502 AI_PROVIDER_DOWN**: AI service failures
- **504 GATEWAY_TIMEOUT**: Request timeouts

### Error Response Format
All errors return consistent JSON structure:
```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "requestId": "uuid-for-tracing"
}
```

### Graceful Degradation
- AI analysis falls back from structured to plain text on parsing failures
- Multiple AI providers with automatic fallback
- Timeout handling prevents hung requests
- Rate limiting protects against abuse

## Testing Strategy

### Unit Tests
- Error handler middleware with various error types
- Rate limiting logic with different scenarios
- fetchWithTimeout utility with timeout and success cases
- Structured analysis parsing with valid and invalid JSON
- Storage operations without mutation side effects

### Integration Tests
- End-to-end API error responses
- Multi-provider AI analysis flow
- Health check endpoint responses
- Rate limiting across multiple requests
- Request ID propagation through middleware chain

### Performance Tests
- Rate limiting under load
- Memory usage of rate limiting storage
- Timeout behavior under network stress
- Storage operation performance

### Error Scenario Tests
- AI provider failures and fallbacks
- Network timeouts and retries
- Malformed AI responses
- Rate limit boundary conditions
- Invalid input validation

## Implementation Phases

### Phase 1: Core Infrastructure
1. Enhance error handling middleware
2. Fix storage mutation issues
3. Improve request ID middleware
4. Update health check endpoint

### Phase 2: Request Management
1. Enhance fetchWithTimeout utility
2. Implement comprehensive rate limiting
3. Add timeout handling to AI providers
4. Update middleware ordering

### Phase 3: Structured Analysis
1. Define structured analysis schema
2. Update AI provider prompts for JSON output
3. Implement parsing with fallback
4. Extend storage interface

### Phase 4: Testing & Validation
1. Comprehensive test coverage
2. Load testing for rate limits
3. Error scenario validation
4. Performance benchmarking