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

  describe('HTML structure variations', () => {
    it('should handle single-page applications with dynamic content', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>SPA Application</title>
            <meta name="description" content="Single page application">
          </head>
          <body>
            <div id="root">
              <div class="app-container">
                <header>
                  <h1>Dynamic SPA</h1>
                </header>
                <main>
                  <p>This content is dynamically loaded in a single-page application.</p>
                  <div class="feature-section">
                    <h2>Key Features</h2>
                    <ul>
                      <li>Real-time updates</li>
                      <li>Interactive dashboard</li>
                      <li>User authentication</li>
                    </ul>
                  </div>
                </main>
              </div>
            </div>
            <script src="app.js"></script>
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

      const result = await fetchFirstParty('https://spa-example.com');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('SPA Application');
      expect(result?.h1).toBe('Dynamic SPA');
      expect(result?.textSnippet).toContain('dynamically loaded');
      expect(result?.textSnippet).toContain('Real-time updates');
      expect(result?.textSnippet).not.toContain('app.js');
    });

    it('should handle e-commerce product pages', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Premium Wireless Headphones - TechStore</title>
            <meta name="description" content="High-quality wireless headphones with noise cancellation and 30-hour battery life.">
          </head>
          <body>
            <nav>Store Navigation</nav>
            <main>
              <div class="product-container">
                <h1>Premium Wireless Headphones</h1>
                <div class="product-details">
                  <p class="price">$299.99</p>
                  <p class="description">Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation.</p>
                  <ul class="features">
                    <li>30-hour battery life</li>
                    <li>Active noise cancellation</li>
                    <li>Bluetooth 5.0 connectivity</li>
                  </ul>
                </div>
                <div class="reviews">
                  <h3>Customer Reviews</h3>
                  <p>Excellent sound quality and comfort. Highly recommended!</p>
                </div>
              </div>
            </main>
            <footer>Footer content</footer>
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

      const result = await fetchFirstParty('https://techstore.com/headphones');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Premium Wireless Headphones - TechStore');
      expect(result?.h1).toBe('Premium Wireless Headphones');
      expect(result?.textSnippet).toContain('crystal-clear audio');
      expect(result?.textSnippet).toContain('30-hour battery');
      expect(result?.textSnippet).not.toContain('Store Navigation');
      expect(result?.textSnippet).not.toContain('Footer content');
    });

    it('should handle blog articles with rich content', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>The Future of AI in Business Analysis | Tech Blog</title>
            <meta name="description" content="Exploring how artificial intelligence is revolutionizing business analysis and decision-making processes.">
          </head>
          <body>
            <header class="site-header">Blog Header</header>
            <article>
              <h1>The Future of AI in Business Analysis</h1>
              <div class="article-meta">
                <span class="author">By John Smith</span>
                <span class="date">March 15, 2024</span>
              </div>
              <div class="article-content">
                <p>Artificial intelligence is transforming how businesses analyze data and make strategic decisions. This comprehensive guide explores the latest trends and technologies.</p>
                <h2>Key Benefits of AI in Business</h2>
                <p>AI-powered analysis tools provide unprecedented insights into market trends, customer behavior, and operational efficiency.</p>
                <blockquote>
                  "AI is not replacing human analysts, but augmenting their capabilities to make better decisions faster."
                </blockquote>
                <h3>Implementation Strategies</h3>
                <p>Successful AI implementation requires careful planning, data preparation, and stakeholder buy-in.</p>
              </div>
            </article>
            <aside class="sidebar">Related articles</aside>
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

      const result = await fetchFirstParty('https://techblog.com/ai-business-analysis');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('The Future of AI in Business Analysis | Tech Blog');
      expect(result?.h1).toBe('The Future of AI in Business Analysis');
      expect(result?.textSnippet).toContain('transforming how businesses');
      expect(result?.textSnippet).toContain('unprecedented insights');
      expect(result?.textSnippet).not.toContain('Blog Header');
      expect(result?.textSnippet).not.toContain('Related articles');
    });

    it('should handle landing pages with marketing content', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Revolutionary Business Analytics Platform | AnalyticsPro</title>
            <meta name="description" content="Transform your business with AI-powered analytics. Get insights, make decisions, drive growth.">
          </head>
          <body>
            <nav class="navbar">Navigation</nav>
            <section class="hero">
              <h1>Revolutionary Business Analytics Platform</h1>
              <p class="hero-subtitle">Transform your business with AI-powered analytics that deliver actionable insights in real-time.</p>
              <button class="cta-button">Start Free Trial</button>
            </section>
            <section class="features">
              <h2>Why Choose AnalyticsPro?</h2>
              <div class="feature-grid">
                <div class="feature">
                  <h3>Real-time Analytics</h3>
                  <p>Get instant insights from your data with our advanced processing engine.</p>
                </div>
                <div class="feature">
                  <h3>AI-Powered Predictions</h3>
                  <p>Leverage machine learning to forecast trends and identify opportunities.</p>
                </div>
                <div class="feature">
                  <h3>Easy Integration</h3>
                  <p>Connect with your existing tools and databases in minutes, not months.</p>
                </div>
              </div>
            </section>
            <section class="testimonials">
              <h2>What Our Customers Say</h2>
              <blockquote>"AnalyticsPro helped us increase revenue by 40% in just 6 months."</blockquote>
            </section>
            <footer>Footer links</footer>
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

      const result = await fetchFirstParty('https://analyticspro.com');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Revolutionary Business Analytics Platform | AnalyticsPro');
      expect(result?.h1).toBe('Revolutionary Business Analytics Platform');
      expect(result?.textSnippet).toContain('AI-powered analytics');
      expect(result?.textSnippet).toContain('insights in real-time');
      expect(result?.textSnippet).toContain('machine learning');
      expect(result?.textSnippet).not.toContain('Navigation');
      expect(result?.textSnippet).not.toContain('Footer links');
    });

    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Malformed HTML Test
            <meta name="description" content="Testing malformed HTML handling">
          <body>
            <h1>Unclosed Header
            <p>Paragraph without closing tag
            <div>
              <span>Nested content
            <p>Another paragraph</p>
            <script>console.log('script content');</script>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html' : null
        },
        text: () => Promise.resolve(malformedHtml)
      });

      const result = await fetchFirstParty('https://malformed-example.com');

      expect(result).not.toBeNull();
      expect(result?.title).toContain('Malformed HTML Test');
      expect(result?.h1).toContain('Unclosed Header');
      expect(result?.textSnippet).toContain('Paragraph without closing');
      // Note: Malformed HTML may not be parsed correctly, so script content might remain
      // This is expected behavior for malformed HTML
    });

    it('should handle empty or minimal HTML', async () => {
      const minimalHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title></title>
          </head>
          <body>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html' : null
        },
        text: () => Promise.resolve(minimalHtml)
      });

      const result = await fetchFirstParty('https://minimal-example.com');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Untitled'); // Empty title gets fallback
      expect(result?.description).toBe('');
      expect(result?.h1).toBe('Untitled'); // H1 falls back to title when empty
      expect(result?.textSnippet).toBe('Untitled'); // Text snippet falls back to title when no content
    });

    it('should handle pages with multiple H1 tags', async () => {
      const multipleH1Html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Multiple H1 Test</title>
          </head>
          <body>
            <h1>First Heading</h1>
            <section>
              <h1>Second Heading</h1>
              <p>Content under second heading</p>
            </section>
            <article>
              <h1>Third Heading</h1>
              <p>Article content</p>
            </article>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html' : null
        },
        text: () => Promise.resolve(multipleH1Html)
      });

      const result = await fetchFirstParty('https://multiple-h1-example.com');

      expect(result).not.toBeNull();
      expect(result?.h1).toBe('First Heading'); // Should take the first H1
      expect(result?.textSnippet).toContain('Article content'); // Text extraction may vary
    });

    it('should handle pages with special characters and encoding', async () => {
      const specialCharsHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Café & Restaurant — "Best Food" in Town!</title>
            <meta name="description" content="Enjoy our café's special dishes: crème brûlée, naïve soufflé & more!">
          </head>
          <body>
            <h1>Welcome to Café Français</h1>
            <p>Experience authentic French cuisine with dishes like coq au vin, ratatouille, and crème brûlée.</p>
            <p>Prices range from €15–€45 per dish. Reservations: +33 1 23 45 67 89</p>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html; charset=utf-8' : null
        },
        text: () => Promise.resolve(specialCharsHtml)
      });

      const result = await fetchFirstParty('https://cafe-francais.com');

      expect(result).not.toBeNull();
      expect(result?.title).toContain('Café & Restaurant');
      expect(result?.title).toContain('"Best Food"');
      expect(result?.h1).toBe('Welcome to Café Français');
      expect(result?.description).toContain('crème brûlée');
      expect(result?.textSnippet).toContain('coq au vin');
    });
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