/**
 * Export utility functions for generating CSV and other export formats
 * Handles data flattening, special character escaping, and CSV generation
 */

/**
 * Flattens nested objects and arrays into a single-level object suitable for CSV export
 * 
 * @param data - The data object to flatten
 * @param prefix - Optional prefix for nested keys (used internally for recursion)
 * @returns Flattened object with dot-notation keys
 * 
 * @example
 * flattenForCSV({ user: { name: 'John', age: 30 } })
 * // Returns: { 'user.name': 'John', 'user.age': '30' }
 * 
 * flattenForCSV({ tags: ['a', 'b', 'c'] })
 * // Returns: { 'tags': 'a; b; c' }
 */
export function flattenForCSV(data: any, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = '';
    } else if (Array.isArray(value)) {
      // Join array elements with semicolons
      result[newKey] = value.map(v =>
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      ).join('; ');
    } else if (typeof value === 'object') {
      // Recursively flatten nested objects
      Object.assign(result, flattenForCSV(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

/**
 * Escapes special characters in CSV values according to RFC 4180
 * 
 * @param value - The string value to escape
 * @returns Escaped string safe for CSV format
 * 
 * @example
 * escapeCSV('Hello, World')
 * // Returns: '"Hello, World"'
 * 
 * escapeCSV('He said "Hi"')
 * // Returns: '"He said ""Hi"""'
 */
export function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates a complete CSV string from data object
 * 
 * @param data - The data object to convert to CSV
 * @param includeHeaders - Whether to include header row (default: true)
 * @returns CSV-formatted string
 * 
 * @example
 * generateCSV({ name: 'John', age: 30 })
 * // Returns: 'name,age\nJohn,30'
 */
export function generateCSV(data: any, includeHeaders: boolean = true): string {
  const flattened = flattenForCSV(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened).map(v => escapeCSV(String(v)));

  if (includeHeaders) {
    return [
      headers.join(','),
      values.join(',')
    ].join('\n');
  }

  return values.join(',');
}

/**
 * Generates CSV from an array of objects (multiple rows)
 * 
 * @param dataArray - Array of objects to convert to CSV
 * @returns CSV-formatted string with headers and multiple rows
 * 
 * @example
 * generateCSVFromArray([
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 }
 * ])
 * // Returns: 'name,age\nJohn,30\nJane,25'
 */
export function generateCSVFromArray(dataArray: any[]): string {
  if (!dataArray || dataArray.length === 0) {
    return '';
  }

  // Flatten all objects
  const flattenedArray = dataArray.map(item => flattenForCSV(item));
  
  // Get all unique headers across all objects
  const allHeaders = new Set<string>();
  flattenedArray.forEach(item => {
    Object.keys(item).forEach(key => allHeaders.add(key));
  });
  
  const headers = Array.from(allHeaders);
  
  // Generate rows
  const rows = flattenedArray.map(item => {
    return headers.map(header => {
      const value = item[header] || '';
      return escapeCSV(String(value));
    }).join(',');
  });

  // Combine headers and rows
  return [
    headers.join(','),
    ...rows
  ].join('\n');
}
