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
 * @returns FirstPartyData object or null if extraction fails
 */
export async function fetchFirstParty(url: string): Promise<FirstPartyData | null> {
  try {
    // Validate URL format
    const parsedUrl = new URL(url);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    try {
      // Fetch the webpage with timeout using Promise.race
      const fetchPromise = fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow'
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        console.error(`HTTP error fetching ${url}: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        console.error(`Non-HTML content type for ${url}: ${contentType}`);
        return null;
      }
      
      const html = await response.text();
      
      // Parse HTML with cheerio
      const $ = cheerio.load(html);
      
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
      
      // Extract body text snippet
      let textSnippet = '';
      
      // Remove script, style, and other non-content elements
      $('script, style, nav, header, footer, aside, .nav, .navigation, .menu, .sidebar').remove();
      
      // Try to get main content area first
      const mainContent = $('main, .main, .content, .post-content, .entry-content, article').first();
      if (mainContent.length > 0) {
        textSnippet = mainContent.text().trim();
      } else {
        // Fallback to body text
        textSnippet = $('body').text().trim();
      }
      
      // Clean up the text snippet
      textSnippet = textSnippet
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      // Limit text snippet length
      if (textSnippet.length > 500) {
        textSnippet = textSnippet.substring(0, 500) + '...';
      }
      
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
      if (fetchError.message === 'Request timeout') {
        console.error(`Timeout fetching ${url}: Request took longer than 10 seconds`);
      } else {
        console.error(`Network error fetching ${url}:`, fetchError.message);
      }
      return null;
    }
    
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error.message);
    return null;
  }
}

/**
 * Validates if a URL is accessible and returns basic info
 * @param url - The URL to validate
 * @returns boolean indicating if URL is accessible
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);
    
    // Basic protocol validation
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    try {
      const fetchPromise = fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.ok;
      
    } catch (fetchError) {
      return false;
    }
    
  } catch (error) {
    return false;
  }
}