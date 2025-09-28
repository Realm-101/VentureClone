# Design Document

## Overview

The minimal hardening feature adds essential reliability, security, and operability improvements to the VentureClone AI application. The design focuses on implementing these enhancements with minimal code changes while maintaining the existing architecture and single golden path approach.

The hardening includes:
- Request timeout handling for AI provider calls
- Basic rate limiting to prevent abuse
- Health check endpoint for monitoring
- Non-mutating storage operations
- Consistent error handling with request tracking
- Automated CI pipeline for quality assurance

## Architecture

### Request Flow Enhancement

The current request flow will be enhanced with middleware layers:

```
Request → Request ID → Rate Limit → User Auth → Route Handler → Error Handler → Response
```

### Middleware Stack

1. **Request ID Middleware**: Assigns unique identifiers to all requests
2. **Rate Limiting Middleware**: Applied selectively to sensitive endpoints
3. **User Middleware**: Existing user identification (unchanged)
4. **Error Handler**: Centralized error formatting and logging

### Timeout Mechanism

AI provider calls will be wrapped with a timeout utility that uses AbortController to cancel long-running requests.

## Components and Interfaces

### 1. Request ID Middleware (`server/middleware/requestId.ts`)

```typescript
interface RequestWithId extends Request {
  requestId: string;
}
```

- Generates UUID for each request
- Supports external request ID headers
- Attaches ID to request object and response headers

### 2. Rate Limiting Middleware (`server/middleware/rateLimit.ts`)

```typescript
interface RateLimitOptions {
  windowMs?: number;  // Default: 5 minutes
  max?: number;       // Default: 10 requests
}
```

- In-memory sliding window implementation
- Key generation: `${ip}:${userId}`
- Configurable limits via options
- Automatic cleanup of expired entries

### 3. Fetch Timeout Utility (`server/lib/fetchWithTimeout.ts`)

```typescript
interface FetchOptions extends RequestInit {
  timeoutMs?: number;  // Default: 8000ms
}
```

- Wraps native fetch with AbortController
- Configurable timeout duration
- Proper cleanup of timeout handlers
- Compatible with existing fetch usage

### 4. Error Handler Middleware (`server/middleware/errorHandler.ts`)

```typescript
interface ErrorResponse {
  error: string;
  code: string;
  requestId: string;
}
```

- Standardized error response format
- HTTP status code mapping to error codes
- Request ID inclusion for debugging
- Prevents sensitive error details leakage

### 5. Health Check Endpoint (`server/routes/healthz.ts`)

```typescript
interface HealthResponse {
  ok: boolean;
  storage: 'mem' | 'db';
  providers: {
    openai: boolean;
    gemini: boolean;
  };
}
```

- Lightweight status check
- Storage mode detection
- AI provider configuration status
- No expensive operations

### 6. Storage Mutation Fix

The existing `MemStorage.listAnalyses()` method will be modified to return a sorted copy instead of mutating the original array.

## Data Models

### Rate Limit Storage

```typescript
// In-memory rate limit tracking
const hits = new Map<string, number[]>();
// Key: "ip:userId", Value: array of timestamps
```

### Request Tracking

```typescript
// Request ID attached to Express Request
interface Request {
  requestId: string;
}
```

## Error Handling

### Error Code Mapping

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 429 | RATE_LIMITED | Rate limit exceeded |
| 502 | AI_PROVIDER_DOWN | AI service unavailable |
| 504 | GATEWAY_TIMEOUT | Request timeout |
| 500 | INTERNAL | Generic server error |
| 400 | CONFIG_MISSING | Missing configuration |

### Error Response Format

All errors will follow a consistent JSON structure:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "requestId": "uuid-for-debugging"
}
```

### Timeout Handling

AI provider timeouts will be handled gracefully:
1. AbortController cancels the fetch request
2. Timeout error is caught and converted to 502 response
3. User receives immediate feedback instead of hanging

## Testing Strategy

### Unit Tests

1. **Rate Limiting**: Test window behavior, key generation, cleanup
2. **Timeout Utility**: Test abort behavior, cleanup, error handling
3. **Error Handler**: Test response formatting, status code mapping
4. **Storage Mutation**: Verify non-mutating behavior

### Integration Tests

1. **End-to-End Rate Limiting**: Verify 429 responses after limit exceeded
2. **Timeout Integration**: Test with mock slow AI providers
3. **Health Check**: Verify response format and provider detection
4. **Error Flow**: Test error propagation through middleware stack

### CI Pipeline Tests

1. **Type Checking**: Ensure TypeScript compilation without errors
2. **Test Suite**: Run all existing and new tests
3. **Build Verification**: Ensure application builds successfully

## Implementation Approach

### Phase 1: Core Infrastructure
- Request ID middleware
- Error handler middleware
- Fetch timeout utility
- Storage mutation fix

### Phase 2: Protection Mechanisms
- Rate limiting middleware
- Apply rate limiting to analyze endpoint
- Update AI provider calls with timeouts

### Phase 3: Monitoring & CI
- Health check endpoint
- CI pipeline configuration
- Environment variable documentation

### Backward Compatibility

All changes maintain backward compatibility:
- Existing API endpoints unchanged
- Response formats enhanced but not breaking
- Environment variables are optional with sensible defaults
- No database schema changes required

### Configuration

New optional environment variables:
- `RATE_LIMIT_WINDOW_MS`: Rate limit window (default: 300000)
- `RATE_LIMIT_MAX`: Max requests per window (default: 10)

### Performance Considerations

- Rate limiting uses in-memory Map with automatic cleanup
- Request IDs use crypto.randomUUID() for performance
- Health check performs no expensive operations
- Timeout utility has minimal overhead

### Security Considerations

- Rate limiting prevents basic abuse patterns
- Request IDs don't expose sensitive information
- Error responses don't leak internal details
- Timeout prevents resource exhaustion from hanging requests