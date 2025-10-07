import { describe, it, expect } from 'vitest';
import {
  flattenForCSV,
  escapeCSV,
  generateCSV,
  generateCSVFromArray
} from '../lib/export-utils';

describe('Export Utils', () => {
  describe('flattenForCSV', () => {
    it('should flatten simple objects', () => {
      const data = {
        name: 'John',
        age: 30,
        city: 'New York'
      };

      const result = flattenForCSV(data);
      
      expect(result).toEqual({
        name: 'John',
        age: '30',
        city: 'New York'
      });
    });

    it('should flatten nested objects with dot notation', () => {
      const data = {
        user: {
          name: 'John',
          age: 30
        },
        location: {
          city: 'New York',
          country: 'USA'
        }
      };

      const result = flattenForCSV(data);
      
      expect(result).toEqual({
        'user.name': 'John',
        'user.age': '30',
        'location.city': 'New York',
        'location.country': 'USA'
      });
    });

    it('should handle arrays by joining with semicolons', () => {
      const data = {
        tags: ['javascript', 'typescript', 'react'],
        numbers: [1, 2, 3]
      };

      const result = flattenForCSV(data);
      
      expect(result).toEqual({
        tags: 'javascript; typescript; react',
        numbers: '1; 2; 3'
      });
    });

    it('should handle arrays of objects by stringifying', () => {
      const data = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      };

      const result = flattenForCSV(data);
      
      expect(result.users).toContain('John');
      expect(result.users).toContain('Jane');
      expect(result.users).toContain(';'); // Joined with semicolons
    });

    it('should handle null and undefined values', () => {
      const data = {
        name: 'John',
        age: null,
        city: undefined,
        country: 'USA'
      };

      const result = flattenForCSV(data);
      
      expect(result).toEqual({
        name: 'John',
        age: '',
        city: '',
        country: 'USA'
      });
    });

    it('should handle deeply nested objects', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };

      const result = flattenForCSV(data);
      
      expect(result).toEqual({
        'level1.level2.level3.value': 'deep'
      });
    });

    it('should handle mixed nested structures', () => {
      const data = {
        name: 'Product',
        details: {
          price: 99.99,
          tags: ['new', 'sale'],
          specs: {
            weight: '1kg',
            dimensions: '10x10x10'
          }
        }
      };

      const result = flattenForCSV(data);
      
      expect(result.name).toBe('Product');
      expect(result['details.price']).toBe('99.99');
      expect(result['details.tags']).toBe('new; sale');
      expect(result['details.specs.weight']).toBe('1kg');
      expect(result['details.specs.dimensions']).toBe('10x10x10');
    });

    it('should handle empty objects', () => {
      const data = {};
      const result = flattenForCSV(data);
      expect(result).toEqual({});
    });

    it('should handle empty arrays', () => {
      const data = {
        tags: []
      };
      const result = flattenForCSV(data);
      expect(result.tags).toBe('');
    });
  });

  describe('escapeCSV', () => {
    it('should not escape simple strings', () => {
      expect(escapeCSV('hello')).toBe('hello');
      expect(escapeCSV('world')).toBe('world');
      expect(escapeCSV('123')).toBe('123');
    });

    it('should escape strings with commas', () => {
      expect(escapeCSV('hello, world')).toBe('"hello, world"');
      expect(escapeCSV('one,two,three')).toBe('"one,two,three"');
    });

    it('should escape strings with quotes', () => {
      expect(escapeCSV('He said "hello"')).toBe('"He said ""hello"""');
      expect(escapeCSV('"quoted"')).toBe('"""quoted"""');
    });

    it('should escape strings with newlines', () => {
      expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"');
      expect(escapeCSV('multi\nline\ntext')).toBe('"multi\nline\ntext"');
    });

    it('should escape strings with multiple special characters', () => {
      expect(escapeCSV('Hello, "world"\nHow are you?')).toBe('"Hello, ""world""\nHow are you?"');
    });

    it('should handle empty strings', () => {
      expect(escapeCSV('')).toBe('');
    });

    it('should handle strings with only special characters', () => {
      expect(escapeCSV(',')).toBe('","');
      expect(escapeCSV('"')).toBe('""""');
      expect(escapeCSV('\n')).toBe('"\n"');
    });

    it('should handle strings with spaces but no special characters', () => {
      expect(escapeCSV('hello world')).toBe('hello world');
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV with headers and values', () => {
      const data = {
        name: 'John',
        age: 30,
        city: 'New York'
      };

      const result = generateCSV(data);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('name,age,city');
      expect(lines[1]).toBe('John,30,New York');
    });

    it('should generate CSV without headers when specified', () => {
      const data = {
        name: 'John',
        age: 30
      };

      const result = generateCSV(data, false);
      
      expect(result).toBe('John,30');
      expect(result).not.toContain('name');
    });

    it('should escape special characters in CSV values', () => {
      const data = {
        name: 'John, Doe',
        quote: 'He said "hi"',
        text: 'Simple text'
      };

      const result = generateCSV(data);
      
      expect(result).toContain('"John, Doe"');
      expect(result).toContain('"He said ""hi"""');
      expect(result).toContain('Simple text');
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'John',
          age: 30
        }
      };

      const result = generateCSV(data);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('user.name,user.age');
      expect(lines[1]).toBe('John,30');
    });

    it('should handle arrays', () => {
      const data = {
        tags: ['javascript', 'typescript']
      };

      const result = generateCSV(data);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('tags');
      expect(lines[1]).toBe('javascript; typescript');
    });

    it('should handle empty objects', () => {
      const data = {};
      const result = generateCSV(data);
      expect(result).toBe('\n');
    });
  });

  describe('generateCSVFromArray', () => {
    it('should generate CSV from array of objects', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(3); // Header + 2 rows
      expect(lines[0]).toBe('name,age');
      expect(lines[1]).toBe('John,30');
      expect(lines[2]).toBe('Jane,25');
    });

    it('should handle objects with different keys', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', city: 'NYC' }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      // Should include all unique keys
      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('age');
      expect(lines[0]).toContain('city');
      
      // Missing values should be empty
      expect(lines[1]).toContain('John');
      expect(lines[2]).toContain('Jane');
    });

    it('should escape special characters in array data', () => {
      const data = [
        { name: 'John, Doe', quote: 'He said "hi"' },
        { name: 'Jane Smith', quote: 'She said "bye"' }
      ];

      const result = generateCSVFromArray(data);
      
      expect(result).toContain('"John, Doe"');
      expect(result).toContain('"He said ""hi"""');
      expect(result).toContain('Jane Smith'); // No comma, so not quoted
      expect(result).toContain('"She said ""bye"""');
    });

    it('should handle nested objects in array', () => {
      const data = [
        { name: 'John', address: { city: 'NYC', zip: '10001' } },
        { name: 'Jane', address: { city: 'LA', zip: '90001' } }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('address.city');
      expect(lines[0]).toContain('address.zip');
    });

    it('should handle arrays within objects', () => {
      const data = [
        { name: 'John', tags: ['js', 'ts'] },
        { name: 'Jane', tags: ['python', 'go'] }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines[1]).toContain('js; ts');
      expect(lines[2]).toContain('python; go');
    });

    it('should handle empty array', () => {
      const data: any[] = [];
      const result = generateCSVFromArray(data);
      expect(result).toBe('');
    });

    it('should handle array with single object', () => {
      const data = [
        { name: 'John', age: 30 }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(2); // Header + 1 row
      expect(lines[0]).toBe('name,age');
      expect(lines[1]).toBe('John,30');
    });

    it('should handle null and undefined values in array', () => {
      const data = [
        { name: 'John', age: 30, city: null },
        { name: 'Jane', age: undefined, city: 'NYC' }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines[1]).toContain('John');
      expect(lines[2]).toContain('Jane');
      // Empty values should be represented as empty strings
    });

    it('should handle complex nested structures', () => {
      const data = [
        {
          name: 'Product A',
          details: {
            price: 99.99,
            tags: ['new', 'sale'],
            specs: { weight: '1kg' }
          }
        },
        {
          name: 'Product B',
          details: {
            price: 149.99,
            tags: ['featured'],
            specs: { weight: '2kg' }
          }
        }
      ];

      const result = generateCSVFromArray(data);
      const lines = result.split('\n');
      
      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('details.price');
      expect(lines[0]).toContain('details.tags');
      expect(lines[0]).toContain('details.specs.weight');
      
      expect(lines[1]).toContain('Product A');
      expect(lines[1]).toContain('99.99');
      expect(lines[1]).toContain('new; sale');
      expect(lines[1]).toContain('1kg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const result = escapeCSV(longString);
      expect(result).toBe(longString); // No special chars, so no escaping
    });

    it('should handle unicode characters', () => {
      const data = {
        name: 'José',
        emoji: '🎉',
        chinese: '你好'
      };

      const result = generateCSV(data);
      expect(result).toContain('José');
      expect(result).toContain('🎉');
      expect(result).toContain('你好');
    });

    it('should handle boolean values', () => {
      const data = {
        active: true,
        deleted: false
      };

      const result = flattenForCSV(data);
      expect(result.active).toBe('true');
      expect(result.deleted).toBe('false');
    });

    it('should handle numeric values including zero', () => {
      const data = {
        count: 0,
        price: 0.0,
        negative: -5
      };

      const result = flattenForCSV(data);
      expect(result.count).toBe('0');
      expect(result.price).toBe('0');
      expect(result.negative).toBe('-5');
    });

    it('should handle special CSV characters in combination', () => {
      const value = 'Test, "with" all\nspecial chars';
      const result = escapeCSV(value);
      expect(result).toBe('"Test, ""with"" all\nspecial chars"');
    });
  });
});
