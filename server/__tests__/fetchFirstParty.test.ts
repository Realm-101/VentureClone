import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFirstParty, validateUrl } from '../lib/fetchFirstParty.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchFirstParty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract basic HTML content successfully', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Website</title>
          <meta name="description" content="This is a test website description">
        </head>
        <body>
          <h1>Welcome to Test Site</h1>
          <p>This is the main content of the test website. It contains useful information.</p>
          <p>Additional paragraph with more content.</p>
        </body>
      </html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name === 'content-type' ? 'text/html; charset=utf-8' : null
      },
      text: () => Promise.resolve(mockHtml)
    });

    const result = await fetchFirstParty('https://example.com');

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Test Website');
    expect(result?.description).toBe('This is a test website description');
    expect(result?.h1).toBe('Welcome to Test Site');
    expect(result?.textSnippet).toContain('This is the main content');
    expect(result?.url).toBe('https://example.com/');
  });

  it('should handle missing meta description by using first paragraph', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>No Meta Description</title>
        </head>
        <body>
          <h1>Main Heading</h1>
          <p>This should become the description since there's no meta description tag present.</p>
        </body>
      </html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name === 'content-type' ? 'text/html' : null
      },
      text: () => Promise.resolve(mockHtml)
    });

    const result = await fetchFirstParty('https://example.com');

    expect(result).not.toBeNull();
    expect(result?.description).toContain('This should become the description');
  });

  it('should handle timeout errors gracefully', async () => {
    // Mock timeout error
    const timeoutError = new Error('Request timeout');
    
    mockFetch.mockRejectedValueOnce(timeoutError);

    const result = await fetchFirstParty('https://slow-example.com');

    expect(result).toBeNull();
  }, 15000); // Increase test timeout

  it('should handle HTTP errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: () => null
      }
    });

    const result = await fetchFirstParty('https://example.com/404');

    expect(result).toBeNull();
  });

  it('should handle non-HTML content types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name === 'content-type' ? 'application/json' : null
      }
    });

    const result = await fetchFirstParty('https://api.example.com/data.json');

    expect(result).toBeNull();
  });

  it('should handle invalid URLs', async () => {
    const result = await fetchFirstParty('not-a-valid-url');

    expect(result).toBeNull();
  });

  it('should clean up text content properly', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Text Cleanup Test</title>
        </head>
        <body>
          <script>console.log('should be removed');</script>
          <style>.hidden { display: none; }</style>
          <nav>Navigation menu</nav>
          <h1>Main Content</h1>
          <p>This    has     multiple     spaces
          
          and    newlines    that should be cleaned up.</p>
        </body>
      </html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name === 'content-type' ? 'text/html' : null
      },
      text: () => Promise.resolve(mockHtml)
    });

    const result = await fetchFirstParty('https://example.com');

    expect(result).not.toBeNull();
    expect(result?.textSnippet).not.toContain('console.log');
    expect(result?.textSnippet).not.toContain('Navigation menu');
    expect(result?.textSnippet).not.toContain('display: none');
    expect(result?.textSnippet).toMatch(/This has multiple spaces and newlines/);
  });
});

describe('validateUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate accessible URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200
    });

    const result = await validateUrl('https://example.com');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      method: 'HEAD'
    }));
  });

  it('should reject invalid protocols', async () => {
    const result = await validateUrl('ftp://example.com');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should reject inaccessible URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await validateUrl('https://example.com/404');

    expect(result).toBe(false);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await validateUrl('https://unreachable.com');

    expect(result).toBe(false);
  });
});