/**
 * @file index.ts
 * @description Converts PHP bcrypt hashes to JavaScript bcrypt format
 * @author Your Name
 * @license MIT
 */

/**
 * Interface for configuration options
 */
interface ConversionOptions {
    /** Number of rounds used in the bcrypt hash (default: 10) */
    rounds?: number;
    /** Whether to throw error on invalid hash format (default: true) */
    strict?: boolean;
  }
  
  /**
   * Interface for conversion result
   */
  interface ConversionResult {
    /** The converted JavaScript bcrypt hash */
    hash: string;
    /** The number of rounds detected from the hash */
    rounds: number;
    /** Whether the conversion was successful */
    success: boolean;
    /** Any error message if conversion failed */
    error?: string;
  }
  
  /**
   * Error class for invalid hash formats
   */
  class InvalidHashError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'InvalidHashError';
    }
  }
  
  /**
   * Main class for converting PHP bcrypt hashes to JavaScript format
   */
  export class PhpBcryptConverter {
    private defaultOptions: Required<ConversionOptions> = {
      rounds: 10,
      strict: true
    };
  
    /**
     * Validates if the input hash is in correct PHP bcrypt format
     * @param hash - The PHP bcrypt hash to validate
     * @returns boolean indicating if hash is valid
     */
    private isValidPhpHash(hash: string): boolean {
      const phpBcryptPattern = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/;
      return phpBcryptPattern.test(hash);
    }
  
    /**
     * Extracts the number of rounds from a PHP bcrypt hash
     * @param hash - The PHP bcrypt hash
     * @returns number of rounds
     */
    private extractRounds(hash: string): number {
      const roundsStr = hash.split('$')[2];
      return parseInt(roundsStr, 10);
    }
  
    /**
     * Converts a PHP bcrypt hash to JavaScript bcrypt format
     * @param phpHash - The PHP bcrypt hash to convert
     * @param options - Configuration options for conversion
     * @returns ConversionResult object containing the converted hash and metadata
     * @throws InvalidHashError if hash format is invalid and strict mode is enabled
     */
    public convert(phpHash: string, options?: ConversionOptions): ConversionResult {
      const opts = { ...this.defaultOptions, ...options };
      
      try {
        // Validate input hash
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
  
        // Extract components
        const parts = phpHash.split('$');
        const version = parts[1];
        const rounds = this.extractRounds(phpHash);
        const hashPart = parts[3];
  
        // Convert version identifier
        let jsVersion = version;
        if (version === '2y') {
          jsVersion = '2b';
        }
  
        // Construct JavaScript bcrypt hash
        const jsHash = `$${jsVersion}$${rounds.toString().padStart(2, '0')}$${hashPart}`;
  
        return {
          hash: jsHash,
          rounds,
          success: true
        };
  
      } catch (error) {
        if (error instanceof InvalidHashError) {
          throw error;
        }
        return {
          hash: '',
          rounds: opts.rounds,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  }
  
  // Export types and main class
  export type {
    ConversionOptions,
    ConversionResult
  };
  
  export default PhpBcryptConverter;