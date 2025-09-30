import * as cheerio from 'cheerio';

export interface FirstPartyData {
  title: string;
  description: string;
  h1: string;
  textSnippet: string;
  url: string;
}

/**
 * Fetches and extracts first-party data from a target URL
 * @param url - The URL to fetch and parse
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns FirstPartyData object or null if extraction fails
 */
export async function fetchFirstParty(url: string, timeoutMs: number = 10000): Promise<FirstPartyData | null> {
  const startTime = Date.now();
  
  try {
    // Validate URL format
    const parsedUrl = new URL(url);
    
    // Validate protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.error(`Unsupported protocol for ${url}: ${parsedUrl.protocol}`);
      return null;
    }
    
    // Performance optimization: Use AbortController for better timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    try {
      // Optimized fetch with minimal headers and better timeout handling
      const fetchOptions: RequestInit = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VentureClone/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=300' // Allow 5-minute cache for performance
        },
        redirect: 'follow',
        signal: controller.signal
      };

      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const elapsed = Date.now() - startTime;
        console.error(`HTTP error fetching ${url}: ${response.status} ${response.statusText} (${elapsed}ms)`);
        
        // Provide more specific error information
        if (response.status >= 400 && response.status < 500) {
          console.error(`Client error (${response.status}): Target site may be blocking requests or URL may be invalid`);
        } else if (response.status >= 500) {
          console.error(`Server error (${response.status}): Target site may be experiencing issues`);
        }
        
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        console.error(`Non-HTML content type for ${url}: ${contentType}`);
        return null;
      }
      
      // Performance optimization: Stream parsing with size limit
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let html = '';
      let totalSize = 0;
      const maxSize = 2 * 1024 * 1024; // 2MB limit for HTML content
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          totalSize += value.length;
          if (totalSize > maxSize) {
            console.warn(`HTML content too large for ${url}, truncating at ${maxSize} bytes`);
            break;
          }
          
          html += decoder.decode(value, { stream: true });
          
          // Performance optimization: Early exit if we have enough content
          if (html.includes('</head>') && html.length > 50000) {
            // We have head section and substantial content, that's enough
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      // Performance optimization: Use cheerio with minimal parsing
      const $ = cheerio.load(html, {
        xmlMode: false,
        decodeEntities: false, // Faster parsing
        lowerCaseAttributeNames: false
      });
      
      // Extract title
      let title = $('title').first().text().trim();
      if (!title) {
        title = $('h1').first().text().trim();
      }
      if (!title) {
        title = 'Untitled';
      }
      
      // Extract description from meta tags
      let description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || '';
      description = description.trim();
      
      // If no meta description, try to extract from first paragraph
      if (!description) {
        const firstP = $('p').first().text().trim();
        if (firstP && firstP.length > 20) {
          description = firstP.substring(0, 200) + (firstP.length > 200 ? '...' : '');
        }
      }
      
      // Extract H1 tag
      let h1 = $('h1').first().text().trim();
      if (!h1) {
        h1 = title; // Fallback to title if no H1
      }
      
      // Performance optimization: Efficient text extraction
      let textSnippet = '';
      
      // Remove non-content elements efficiently
      $('script, style, nav, header, footer, aside, noscript, iframe').remove();
      
      // Performance optimization: Try specific content selectors first
      const contentSelectors = [
        'main', '[role="main"]', '.main-content', '.content', 
        'article', '.post-content', '.entry-content', '.article-content'
      ];
      
      let mainContent;
      for (const selector of contentSelectors) {
        mainContent = $(selector).first();
        if (mainContent.length > 0) break;
      }
      
      if (mainContent && mainContent.length > 0) {
        textSnippet = mainContent.text();
      } else {
        // Fallback: get first few paragraphs instead of entire body
        const paragraphs = $('p').slice(0, 5);
        textSnippet = paragraphs.map((_, el) => $(el).text()).get().join(' ');
        
        if (!textSnippet) {
          // Last resort: body text but limit extraction
          const bodyText = $('body').text();
          textSnippet = bodyText.substring(0, 1000); // Limit initial extraction
        }
      }
      
      // Performance optimization: Efficient text cleaning
      textSnippet = textSnippet
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .trim()
        .substring(0, 500); // Limit length early
      
      // Ensure we have some content
      if (!textSnippet || textSnippet.length < 10) {
        textSnippet = description || title || 'No content available';
      }
      
      return {
        title: title.substring(0, 200), // Limit title length
        description: description.substring(0, 300), // Limit description length
        h1: h1.substring(0, 200), // Limit H1 length
        textSnippet,
        url: parsedUrl.href // Use the parsed URL to ensure it's properly formatted
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clean up timeout
      const elapsed = Date.now() - startTime;
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error(`Timeout fetching ${url}: Request aborted after ${elapsed}ms (limit: ${timeoutMs}ms)`);
        } else if (fetchError.message.includes('network') || fetchError.message.includes('fetch')) {
          console.error(`Network error fetching ${url} (${elapsed}ms):`, fetchError.message);
        } else {
          console.error(`Fetch error for ${url} (${elapsed}ms):`, fetchError.message);
        }
      } else {
        console.error(`Unknown fetch error for ${url} (${elapsed}ms):`, fetchError);
      }
      
      return null;
    }
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid URL')) {
        console.error(`Invalid URL format: ${url}`);
      } else {
        console.error(`Error processing URL ${url} (${elapsed}ms):`, error.message);
      }
    } else {
      console.error(`Unknown error processing URL ${url} (${elapsed}ms):`, error);
    }
    
    return null;
  }
}

/**
 * Validates if a URL is accessible and returns basic info
 * @param url - The URL to validate
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns boolean indicating if URL is accessible
 */
export async function validateUrl(url: string, timeoutMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const parsedUrl = new URL(url);
    
    // Basic protocol validation
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.warn(`URL validation failed: Unsupported protocol ${parsedUrl.protocol} for ${url}`);
      return false;
    }
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        reject(new Error(`URL validation timeout after ${elapsed}ms (limit: ${timeoutMs}ms)`));
      }, timeoutMs);
    });
    
    try {
      const fetchPromise = fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs - 500) // Leave buffer for processing
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`URL validation successful for ${url} (${elapsed}ms)`);
        return true;
      } else {
        console.warn(`URL validation failed for ${url}: ${response.status} ${response.statusText} (${elapsed}ms)`);
        return false;
      }
      
    } catch (fetchError) {
      const elapsed = Date.now() - startTime;
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError' || fetchError.message.includes('timeout')) {
          console.warn(`URL validation timeout for ${url} (${elapsed}ms)`);
        } else {
          console.warn(`URL validation network error for ${url} (${elapsed}ms):`, fetchError.message);
        }
      }
      
      return false;
    }
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid URL')) {
      console.warn(`URL validation failed: Invalid URL format for ${url}`);
    } else {
      console.warn(`URL validation error for ${url}:`, error);
    }
    return false;
  }
}

/**
 * Enhanced first-party data extraction with comprehensive error handling
 * @param url - The URL to fetch and parse
 * @param options - Configuration options
 * @returns FirstPartyData object or detailed error information
 */
export interface FirstPartyExtractionOptions {
  timeoutMs?: number;
  validateFirst?: boolean;
  retryCount?: number;
  retryDelayMs?: number;
}

export interface FirstPartyExtractionResult {
  success: boolean;
  data?: FirstPartyData;
  error?: {
    type: 'TIMEOUT' | 'NETWORK' | 'VALIDATION' | 'PARSING' | 'UNKNOWN';
    message: string;
    retryable: boolean;
  };
  metadata: {
    url: string;
    elapsedMs: number;
    attempts: number;
  };
}

export async function fetchFirstPartyWithRetry(
  url: string, 
  options: FirstPartyExtractionOptions = {}
): Promise<FirstPartyExtractionResult> {
  const {
    timeoutMs = 10000,
    validateFirst = false,
    retryCount = 1,
    retryDelayMs = 1000
  } = options;
  
  const startTime = Date.now();
  let attempts = 0;
  let lastError: any = null;

  // Validate URL first if requested
  if (validateFirst) {
    const isValid = await validateUrl(url, Math.min(5000, timeoutMs / 2));
    if (!isValid) {
      return {
        success: false,
        error: {
          type: 'VALIDATION',
          message: 'URL is not accessible or returns non-success status',
          retryable: true
        },
        metadata: {
          url,
          elapsedMs: Date.now() - startTime,
          attempts: 0
        }
      };
    }
  }

  // Retry loop
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    attempts++;
    
    try {
      const data = await fetchFirstParty(url, timeoutMs);
      
      if (data) {
        return {
          success: true,
          data,
          metadata: {
            url,
            elapsedMs: Date.now() - startTime,
            attempts
          }
        };
      } else {
        lastError = new Error('First-party extraction returned null');
      }
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (error instanceof Error) {
        if (error.message.includes('Invalid URL') || error.message.includes('Unsupported protocol')) {
          break; // Don't retry validation errors
        }
      }
    }
    
    // Wait before retry (except on last attempt)
    if (attempt < retryCount) {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  // Determine error type and retryability
  let errorType: 'TIMEOUT' | 'NETWORK' | 'VALIDATION' | 'PARSING' | 'UNKNOWN' = 'UNKNOWN';
  let retryable = true;
  
  if (lastError instanceof Error) {
    const message = lastError.message.toLowerCase();
    if (message.includes('timeout')) {
      errorType = 'TIMEOUT';
      retryable = true;
    } else if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      errorType = 'NETWORK';
      retryable = true;
    } else if (message.includes('invalid url') || message.includes('protocol')) {
      errorType = 'VALIDATION';
      retryable = false;
    } else if (message.includes('parsing') || message.includes('html')) {
      errorType = 'PARSING';
      retryable = true;
    }
  }

  return {
    success: false,
    error: {
      type: errorType,
      message: lastError?.message || 'Unknown error during first-party extraction',
      retryable
    },
    metadata: {
      url,
      elapsedMs: Date.now() - startTime,
      attempts
    }
  };
}