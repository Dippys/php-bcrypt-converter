/**
 * @file index.test.ts
 * Tests for PHP to JS Bcrypt Hash Converter
 */

import { PhpBcryptConverter, ConversionOptions } from './index';

describe('PhpBcryptConverter', () => {
  let converter: PhpBcryptConverter;

  beforeEach(() => {
    converter = new PhpBcryptConverter();
  });

  describe('Basic Conversion', () => {
    test('should convert $2y$ to $2b$ format', () => {
      const phpHash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(phpHash);
      
      expect(result.success).toBe(true);
      expect(result.hash).toBe('$2b$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(result.rounds).toBe(10);
    });

    test('should keep $2b$ format unchanged', () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      
      expect(result.success).toBe(true);
      expect(result.hash).toBe(hash);
      expect(result.rounds).toBe(10);
    });

    test('should convert $2a$ format', () => {
      const hash = '$2a$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      
      expect(result.success).toBe(true);
      expect(result.hash).toBe(hash);
      expect(result.rounds).toBe(10);
    });
  });

  describe('Rounds Handling', () => {
    test('should correctly detect different rounds', () => {
      const hash = '$2y$12$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(12);
    });

    test('should handle single digit rounds', () => {
      const hash = '$2y$08$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(8);
      expect(result.hash).toMatch(/^\$2b\$08\$/);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid hash in strict mode', () => {
      const invalidHash = '$2y$10$tooshort';
      
      expect(() => {
        converter.convert(invalidHash, { strict: true });
      }).toThrow('Invalid PHP bcrypt hash format');
    });

    test('should return error result for invalid hash in non-strict mode', () => {
      const invalidHash = '$2y$10$tooshort';
      const result = converter.convert(invalidHash, { strict: false });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.hash).toBe('');
    });

    test('should handle invalid version identifier', () => {
      const invalidHash = '$2z$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(invalidHash, { strict: false });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Options Handling', () => {
    test('should respect custom options', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const options: ConversionOptions = {
        rounds: 12,
        strict: false
      };
      
      const result = converter.convert(hash, options);
      expect(result.success).toBe(true);
      // Original rounds should be preserved despite custom rounds option
      expect(result.rounds).toBe(10);
    });

    test('should use default options when none provided', () => {
      const invalidHash = '$2y$invalid';
      
      expect(() => {
        converter.convert(invalidHash);
      }).toThrow(); // Default strict: true should cause throw
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(() => {
        converter.convert('');
      }).toThrow('Invalid PHP bcrypt hash format');
    });

    test('should handle null/undefined inputs', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior with invalid input
        converter.convert(null);
      }).toThrow();

      expect(() => {
        // @ts-ignore - Testing runtime behavior with invalid input
        converter.convert(undefined);
      }).toThrow();
    });

    test('should handle hash with maximum rounds', () => {
      const hash = '$2y$31$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(31);
    });
  });
});