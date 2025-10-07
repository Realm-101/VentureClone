---
inclusion: fileMatch
fileMatchPattern: '**/export*.{ts,tsx}'
---

# Export Functionality Guidelines

## Export Formats

The application supports 4 export formats:

1. **HTML** - Formatted, styled document for web viewing
2. **JSON** - Structured data for programmatic access
3. **CSV** - Tabular data for spreadsheet import
4. **PDF** - Professional document for sharing/printing

## Export Types

### Per-Stage Export
- Available on all stages (1-6)
- Exports only that stage's data
- Filename format: `stage-{N}-{format}.{ext}`

### Complete Plan Export
- Available on Stage 6 after completion
- Combines all 6 stages into single document
- Filename format: `business-plan-{domain}-{date}.{ext}`

## Implementation Guidelines

### HTML Export
```typescript
// Include:
- Inline CSS for styling
- Proper semantic HTML structure
- Responsive layout
- Print-friendly styles
```

### JSON Export
```typescript
// Include:
- Complete structured data
- Metadata (exportedAt, version, analysisId)
- Proper nesting and typing
- Pretty-printed (2-space indent)
```

### CSV Export
```typescript
// Requirements:
- Flatten nested objects (dot notation)
- Join arrays with semicolons
- Escape special characters (commas, quotes, newlines)
- Include header row
- Handle null/undefined as empty string
```

### PDF Export
```typescript
// Use jsPDF or pdfmake
// Include:
- Cover page with business name and date
- Table of contents (for complete plan)
- Proper page breaks
- Headers and footers
- Professional formatting
- Page numbers
```

## CSV Flattening Rules

```typescript
// Nested objects: use dot notation
{ user: { name: "John" } } → "user.name": "John"

// Arrays: join with semicolons
{ tags: ["a", "b", "c"] } → "tags": "a; b; c"

// Objects in arrays: stringify
{ items: [{id: 1}, {id: 2}] } → "items": '{"id":1}; {"id":2}'
```

## Special Character Escaping

```typescript
// CSV escaping rules:
- Contains comma → wrap in quotes
- Contains quote → double the quote and wrap in quotes
- Contains newline → wrap in quotes
- Example: 'He said, "Hi"' → '"He said, ""Hi"""'
```

## Export Service Architecture

```typescript
// server/services/export-service.ts
class ExportService {
  // Per-stage export
  async exportStage(
    stageNumber: number,
    stageData: any,
    format: ExportFormat
  ): Promise<Buffer | string>
  
  // Complete plan export
  async generateCompletePlan(
    analysisId: string,
    format: ExportFormat
  ): Promise<Buffer | string>
}
```

## API Endpoints

```typescript
// Per-stage export
POST /api/business-analyses/:id/stages/:stageNumber/export
Body: { format: 'html' | 'json' | 'csv' | 'pdf' }

// Complete plan export
POST /api/business-analyses/:id/export-complete
Body: { format: 'html' | 'json' | 'csv' | 'pdf' }
```

## Response Headers

```typescript
// Set appropriate headers:
res.setHeader('Content-Type', getContentType(format));
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

// Content types:
- HTML: 'text/html; charset=utf-8'
- JSON: 'application/json; charset=utf-8'
- CSV: 'text/csv; charset=utf-8'
- PDF: 'application/pdf'
```

## Error Handling

```typescript
// Export-specific errors
class ExportError extends Error {
  constructor(
    message: string,
    public format: string,
    public stage?: number
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

// Handle gracefully:
try {
  await exportService.generatePDF(data);
} catch (error) {
  if (error instanceof ExportError) {
    // Show user-friendly message
    // Log detailed error
    // Offer retry option
  }
}
```

## Performance Optimization

- **Server-side generation**: Generate exports on server to avoid client performance issues
- **Streaming**: Use streaming for large PDFs
- **Caching**: Cache generated exports for 1 hour
- **Lazy loading**: Load export libraries only when needed
- **Progress indicators**: Show progress for large exports

## Security Considerations

- **Sanitization**: Sanitize all user content before export
- **File size limits**: Limit export file sizes (e.g., 10MB max)
- **Rate limiting**: Rate limit export endpoints
- **Access control**: Verify user owns analysis before export
- **Logging**: Log all export operations for audit

## Testing Guidelines

When testing export functionality:
- Test each format independently
- Test with special characters (commas, quotes, newlines)
- Test with nested data structures
- Test with large datasets
- Test with missing/null data
- Test error scenarios
- Verify file downloads correctly
- Verify content is complete and accurate
