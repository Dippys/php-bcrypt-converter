/**
 * @file index.ts
 * @description Converts PHP bcrypt hashes to JavaScript bcrypt format
 * @package php-bcrypt-converter
 * @license MIT
 */

/**
 * Configuration options for bcrypt hash conversion
 * @interface ConversionOptions
 */
export interface ConversionOptions {
  /**
   * Number of rounds used in the bcrypt hash (defaults to 10)
   * Must be between 4 and 31
   * @type {number}
   * @default 10
   */
  rounds?: number;

  /**
   * Whether to throw error on invalid hash format
   * If false, returns error in result object instead
   * @type {boolean}
   * @default true
   */
  strict?: boolean;
}

/**
 * Result object returned after hash conversion
 * @interface ConversionResult
 */
export interface ConversionResult {
  /**
   * The converted JavaScript bcrypt hash
   * Empty string if conversion failed
   * @type {string}
   */
  hash: string;

  /**
   * The number of rounds detected from the hash
   * Defaults to options.rounds if detection fails
   * @type {number}
   */
  rounds: number;

  /**
   * Whether the conversion was successful
   * @type {boolean}
   */
  success: boolean;

  /**
   * Error message if conversion failed
   * Only present if success is false
   * @type {string|undefined}
   */
  error?: string;
}

/**
 * Custom error class for invalid hash formats
 * @class InvalidHashError
 * @extends Error
 */
export class InvalidHashError extends Error {
  /**
   * @param {string} message - Error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHashError';
    Object.setPrototypeOf(this, InvalidHashError.prototype);
  }
}

/**
 * Main class for converting PHP bcrypt hashes to JavaScript format
 * Supports conversion between $2y$, $2a$ and $2b$ formats
 * @class PhpBcryptConverter
 */
export class PhpBcryptConverter {
  /**
   * Default options for hash conversion
   * @private
   * @type {Required<ConversionOptions>}
   */
  private defaultOptions: Required<ConversionOptions> = {
    rounds: 10,
    strict: true
  };

  /**
   * Validates if a given string is a valid PHP bcrypt hash
   * Checks for correct format, version, rounds, and character set
   * @private
   * @param {string} hash - The PHP bcrypt hash to validate
   * @returns {boolean} True if valid, false otherwise
   */
  private isValidPhpHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') return false;
    
    // Validate basic structure and allowed characters
    const phpBcryptPattern = /^\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;
    if (!phpBcryptPattern.test(hash)) return false;

    // Extract and validate rounds
    const rounds = this.extractRounds(hash);
    if (rounds < 4 || rounds > 31) return false;

    return true;
  }

  /**
   * Extracts the number of rounds from a PHP bcrypt hash
   * @private
   * @param {string} hash - The PHP bcrypt hash
   * @returns {number} Number of rounds, or default if extraction fails
   */
  private extractRounds(hash: string): number {
    const matches = hash.match(/^\$2[aby]\$([0-9]{2})\$/);
    if (!matches) return this.defaultOptions.rounds;
    
    const rounds = parseInt(matches[1], 10);
    if (isNaN(rounds)) return this.defaultOptions.rounds;
    
    return rounds;
  }

  /**
   * Validates rounds value is within acceptable range
   * @private
   * @param {number} rounds - The rounds value to validate
   * @returns {boolean} True if valid, false otherwise
   */
  private isValidRounds(rounds: number): boolean {
    return !isNaN(rounds) && rounds >= 4 && rounds <= 31;
  }

  /**
   * Converts a PHP bcrypt hash to JavaScript bcrypt format
   * Supports conversion from $2y$ to $2b$ format
   * Preserves existing $2a$ and $2b$ formats
   * 
   * @param {string} phpHash - The PHP bcrypt hash to convert
   * @param {ConversionOptions} [options] - Configuration options
   * @returns {ConversionResult} Result object containing converted hash and metadata
   * @throws {InvalidHashError} If hash format is invalid and strict mode is enabled
   * 
   * @example
   * ```typescript
   * const converter = new PhpBcryptConverter();
   * 
   * // Basic conversion
   * const result = converter.convert('$2y$10$...');
   * console.log(result.hash); // '$2b$10$...'
   * 
   * // Non-strict mode
   * const result2 = converter.convert('invalid', { strict: false });
   * console.log(result2.success); // false
   * console.log(result2.error); // 'Invalid PHP bcrypt hash format'
   * ```
   */
  public convert(phpHash: string, options?: ConversionOptions): ConversionResult {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Input validation
      if (!this.isValidPhpHash(phpHash)) {
        if (opts.strict) {
          throw new InvalidHashError('Invalid PHP bcrypt hash format');
        }
        return {
          hash: '',
          rounds: opts.rounds,
          success: false,
          error: 'Invalid PHP bcrypt hash format'
        };
      }

      // Extract hash components
      const [, version, roundsPart, hashPart] = phpHash.split('$');
      const rounds = parseInt(roundsPart, 10);

      // Validate rounds
      if (!this.isValidRounds(rounds)) {
        if (opts.strict) {
          throw new InvalidHashError('Invalid rounds value in hash');
        }
        return {
          hash: '',
          rounds: opts.rounds,
          success: false,
          error: 'Invalid rounds value in hash'
        };
      }

      // Convert version identifier if needed
      const jsVersion = version === '2y' ? '2b' : version;

      // Construct JavaScript bcrypt hash
      const jsHash = `$${jsVersion}$${rounds.toString().padStart(2, '0')}$${hashPart}`;

      return {
        hash: jsHash,
        rounds,
        success: true
      };

    } catch (error) {
      if (opts.strict) {
        if (error instanceof InvalidHashError) {
          throw error;
        }
        throw new InvalidHashError(error instanceof Error ? error.message : 'Unknown error occurred');
      }

      return {
        hash: '',
        rounds: opts.rounds,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Checks if a given string is a valid bcrypt hash in any format
   * Useful for validation before conversion
   * 
   * @param {string} hash - The hash to validate
   * @returns {boolean} True if valid, false otherwise
   * 
   * @example
   * ```typescript
   * const converter = new PhpBcryptConverter();
   * console.log(converter.isValidHash('$2y$10$...')); // true
   * console.log(converter.isValidHash('invalid')); // false
   * ```
   */
  public isValidHash(hash: string): boolean {
    return this.isValidPhpHash(hash);
  }

  /**
   * Gets the number of rounds from a hash without converting it
   * 
   * @param {string} hash - The hash to extract rounds from
   * @returns {number} Number of rounds, or default if extraction fails
   * 
   * @example
   * ```typescript
   * const converter = new PhpBcryptConverter();
   * console.log(converter.getRounds('$2y$12$...')); // 12
   * ```
   */
  public getRounds(hash: string): number {
    return this.extractRounds(hash);
  }
}

// Default export
export default PhpBcryptConverter;