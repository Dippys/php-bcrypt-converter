import { PhpBcryptConverter, InvalidHashError, ConversionOptions } from './index';

describe('PhpBcryptConverter', () => {
  let converter: PhpBcryptConverter;

  beforeEach(() => {
    converter = new PhpBcryptConverter();
  });

  describe('Hash Version Conversion', () => {
    it('should convert $2y$ format to $2b$', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.hash).toBe('$2b$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(result.rounds).toBe(10);
    });

    it('should preserve $2b$ format', () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.hash).toBe(hash);
      expect(result.rounds).toBe(10);
    });

    it('should preserve $2a$ format', () => {
      const hash = '$2a$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.hash).toBe(hash);
      expect(result.rounds).toBe(10);
    });
  });

  describe('Rounds Handling', () => {
    it('should handle minimum rounds (4)', () => {
      const hash = '$2y$04$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(4);
      expect(result.hash).toMatch(/^\$2b\$04\$/);
    });

    it('should handle maximum rounds (31)', () => {
      const hash = '$2y$31$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(31);
      expect(result.hash).toMatch(/^\$2b\$31\$/);
    });

    it('should reject rounds below minimum (3)', () => {
      const hash = '$2y$03$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(() => converter.convert(hash)).toThrow(InvalidHashError);
    });

    it('should reject rounds above maximum (32)', () => {
      const hash = '$2y$32$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(() => converter.convert(hash)).toThrow(InvalidHashError);
    });

    it('should handle single-digit rounds with leading zero', () => {
      const hash = '$2y$08$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = converter.convert(hash);
      expect(result.success).toBe(true);
      expect(result.rounds).toBe(8);
      expect(result.hash).toMatch(/^\$2b\$08\$/);
    });

    it('should extract rounds correctly using getRounds method', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(converter.getRounds(hash)).toBe(10);
    });

    it('should return default rounds for invalid hash in getRounds', () => {
      expect(converter.getRounds('invalid')).toBe(12);
    });
  });

  describe('Hash Validation', () => {
    it('should validate correct hash format', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(converter.isValidHash(hash)).toBe(true);
    });

    it('should reject invalid version identifier', () => {
      const hash = '$2c$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(converter.isValidHash(hash)).toBe(false);
    });

    it('should reject hash with invalid characters', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv!wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(converter.isValidHash(hash)).toBe(false);
    });

    it('should reject hash with incorrect length', () => {
      const hash = '$2y$10$tooshort';
      expect(converter.isValidHash(hash)).toBe(false);
    });

    it('should reject hash with missing sections', () => {
      const hash = '$2y$10$';
      expect(converter.isValidHash(hash)).toBe(false);
    });
  });

  describe('Options Handling', () => {
    it('should respect strict mode option', () => {
      const invalidHash = '$2y$10$invalid';
      const strictOptions: ConversionOptions = { strict: true };
      const nonStrictOptions: ConversionOptions = { strict: false };

      expect(() => converter.convert(invalidHash, strictOptions)).toThrow(InvalidHashError);
      
      const result = converter.convert(invalidHash, nonStrictOptions);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use default options when none provided', () => {
      const invalidHash = '$2y$10$invalid';
      expect(() => converter.convert(invalidHash)).toThrow(InvalidHashError);
    });

    it('should preserve original rounds regardless of options', () => {
      const hash = '$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const options: ConversionOptions = { rounds: 12 };
      const result = converter.convert(hash, options);
      expect(result.rounds).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty string', () => {
      expect(() => converter.convert('')).toThrow(InvalidHashError);
    });

    it('should handle null input', () => {
      expect(() => converter.convert(null as any)).toThrow(InvalidHashError);
    });

    it('should handle undefined input', () => {
      expect(() => converter.convert(undefined as any)).toThrow(InvalidHashError);
    });

    it('should provide error details in non-strict mode', () => {
      const result = converter.convert('invalid', { strict: false });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid PHP bcrypt hash format');
      expect(result.hash).toBe('');
    });

    it('should handle invalid rounds format', () => {
      const hash = '$2y$AB$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      expect(() => converter.convert(hash)).toThrow(InvalidHashError);
    });
  });
});