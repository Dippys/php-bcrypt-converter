# php-bcrypt-converter

A TypeScript package for converting PHP bcrypt hashes to JavaScript bcrypt format. This package helps maintain compatibility between PHP and JavaScript applications that use bcrypt hashing.

[![npm version](https://badge.fury.io/js/php-bcrypt-converter.svg)](https://badge.fury.io/js/php-bcrypt-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Convert PHP bcrypt hashes (`$2y$`) to JavaScript format (`$2b$`)
- Preserve hash rounds and salt
- Full TypeScript support
- Comprehensive error handling
- Configurable strict mode
- 100% test coverage

## Installation

```bash
npm install php-bcrypt-converter
# or
yarn add php-bcrypt-converter
```

## Usage

### Basic Usage

```typescript
import PhpBcryptConverter from 'php-bcrypt-converter';

const converter = new PhpBcryptConverter();

// Convert a PHP bcrypt hash
const result = converter.convert('$2y$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

if (result.success) {
  console.log(result.hash);    // '$2b$10$abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  console.log(result.rounds);  // 10
} else {
  console.error(result.error);
}
```

### With Options

```typescript
const options = {
  rounds: 12,     // Default rounds if needed
  strict: false   // Don't throw errors for invalid hashes
};

const result = converter.convert(phpHash, options);
```

### Error Handling

```typescript
// Strict mode (default)
try {
  const result = converter.convert(invalidHash);
} catch (error) {
  console.error('Invalid hash format');
}

// Non-strict mode
const result = converter.convert(invalidHash, { strict: false });
if (!result.success) {
  console.error(result.error);
}
```

## API Reference

### PhpBcryptConverter Class

#### constructor()

Creates a new instance of the converter.

#### convert(phpHash: string, options?: ConversionOptions): ConversionResult

Converts a PHP bcrypt hash to JavaScript format.

##### Parameters:

- `phpHash`: The PHP bcrypt hash to convert
- `options` (optional): Configuration options
  - `rounds`: Default number of rounds (default: 10)
  - `strict`: Whether to throw errors for invalid hashes (default: true)

##### Returns:

A `ConversionResult` object containing:
- `hash`: The converted JavaScript bcrypt hash
- `rounds`: Number of rounds detected from the hash
- `success`: Whether the conversion was successful
- `error`: Error message if conversion failed (only in non-strict mode)

## Types

```typescript
interface ConversionOptions {
  rounds?: number;
  strict?: boolean;
}

interface ConversionResult {
  hash: string;
  rounds: number;
  success: boolean;
  error?: string;
}
```

## Development

### Setup

```bash
git clone https://github.com/Dippys/php-bcrypt-converter.git
cd php-bcrypt-converter
npm install
```

### Running Tests

```bash
npm test
npm run test:watch  # Run tests in watch mode
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENCE](https://github.com/Dippys/php-bcrypt-converter/blob/main/LICENCE) file for details.

## Acknowledgments

- Inspired by the need for PHP/JavaScript bcrypt compatibility
- Built with TypeScript for type safety and better developer experience

## Support

For support, please open an issue in the GitHub repository.
