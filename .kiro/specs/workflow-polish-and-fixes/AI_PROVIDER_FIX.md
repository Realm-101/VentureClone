# AI Provider Display Fix - Task 12.1

## Problem Description

The UI was displaying "GROK" as the active AI provider when "GEMINI" was actually being used for workflow generation. This mismatch occurred because:

1. The `/api/ai-providers/active` endpoint checked for `GROK_API_KEY` first
2. The actual workflow generation code checked for `GEMINI_API_KEY` first
3. When both keys were present in the environment, the UI showed Grok but Gemini was being used

## Root Cause

**Inconsistent Provider Priority:**
- Active provider endpoint: `Grok > Gemini > OpenAI`
- Workflow generation (Stage 1): `Gemini > Grok > OpenAI`
- Business improvement generation: `Gemini > Grok > OpenAI`
- Workflow stages 2-6: `Grok > Gemini > OpenAI` (incorrect!)

## Solution

### 1. Created Centralized Helper Function

Added `getActiveAIProvider()` helper function in `server/routes.ts`:

```typescript
// Helper function to get the active AI provider based on environment variables
// Priority: Gemini > Grok > OpenAI (matches workflow generation logic)
function getActiveAIProvider(): { provider: AIProvider; apiKey: string } | null {
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
  } else if (process.env.GROK_API_KEY) {
    return { provider: 'grok', apiKey: process.env.GROK_API_KEY };
  } else if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }
  return null;
}
```

### 2. Updated All Provider Selection Points

**Updated `/api/ai-providers/active` endpoint:**
- Now uses `getActiveAIProvider()` helper
- Ensures UI displays the correct provider

**Updated business improvement generation:**
- Replaced inline provider selection with `getActiveAIProvider()`
- Ensures consistent provider usage

**Updated workflow stage generation (Stages 2-6):**
- Fixed incorrect priority order (was Grok first)
- Now uses `getActiveAIProvider()` helper
- Ensures all stages use the same provider

## Testing

Created comprehensive test suite in `server/__tests__/ai-provider-display.test.ts`:

✅ Prioritizes Gemini when both Gemini and Grok keys are set
✅ Uses Grok when only Grok key is set
✅ Uses OpenAI when only OpenAI key is set
✅ Prioritizes Gemini over OpenAI when both are set
✅ Prioritizes Grok over OpenAI when both are set (but not Gemini)

All tests pass successfully.

## Verification

With the current environment configuration:
- `GEMINI_API_KEY` is set
- `GROK_API_KEY` is set
- `OPENAI_API_KEY` is commented out

**Before Fix:**
- UI displayed: "GROK"
- Actually used: Gemini (for most operations)

**After Fix:**
- UI displays: "GEMINI"
- Actually used: Gemini (for all operations)

## Benefits

1. **Consistency:** All parts of the application now use the same provider priority
2. **Transparency:** UI accurately reflects which AI provider is being used
3. **Maintainability:** Single source of truth for provider selection logic
4. **Reliability:** Eliminates confusion about which provider is handling requests

## Requirements Satisfied

✅ 12.1 - Ensure UI reflects actual selected provider
✅ 12.2 - Update display when provider changes
✅ 12.3 - Fix Gemini showing as Grok
✅ 12.4 - Update `client/src/components/ai-provider-modal.tsx` or provider selector

## Files Modified

1. `server/routes.ts`
   - Added `getActiveAIProvider()` helper function
   - Updated `/api/ai-providers/active` endpoint
   - Updated business improvement generation
   - Updated workflow stage generation

2. `server/__tests__/ai-provider-display.test.ts` (new)
   - Comprehensive test coverage for provider priority logic

## Notes

- The AI provider modal component (`client/src/components/ai-provider-modal.tsx`) did not require changes as it correctly displays the provider returned by the backend API
- The dashboard component (`client/src/pages/dashboard.tsx`) correctly displays `activeProvider.provider.toUpperCase()`, so no frontend changes were needed
- The fix is entirely server-side, ensuring the backend returns the correct active provider
