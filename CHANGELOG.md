# ARG-PARSER CHANGE LOG

## Version 1.1.15 (July 2nd, 2021)

### Refactoring

- typed build

## Version [1.1.14](https://github.com/spmeesseman/arg-parser/compare/v1.1.13...v1.1.14) (July 1st, 2021)

### Refactoring

- remove unused 'app' property from ArgParserOpts def

## Version [1.1.13](https://github.com/spmeesseman/arg-parser/compare/v1.1.12...v1.1.13) (July 1st, 2021)

### Bug Fixes

- main import points to wrong directory

### Refactoring

- remove types files

## Version [1.1.12](https://github.com/spmeesseman/arg-parser/compare/v1.1.11...v1.1.12) (July 1st, 2021)

### Refactoring

- include type files in release
- include types in build
- remove class wrapper, import and call parseArgs directly

## Version [1.1.12](https://github.com/spmeesseman/arg-parser/compare/v1.1.11...v1.1.12) (July 1st, 2021)

### Refactoring

- include types in build
- remove class wrapper, import and call parseArgs directly

## Version [1.1.11](https://github.com/spmeesseman/arg-parser/compare/v1.1.10...v1.1.11) (July 1st, 2021)

### Refactoring

- take out --help, --version, and --verbose internal handling

## Version [1.1.10](https://github.com/spmeesseman/arg-parser/compare/v1.1.9...v1.1.10) (July 1st, 2021)

### Refactoring

- default enforce constraint to true

## Version [1.1.9](https://github.com/spmeesseman/arg-parser/compare/v1.1.8...v1.1.9) (July 1st, 2021)

### Bug Fixes

- positional parameter validation does not turn off with enforceConstraints: false

## Version [1.1.8](https://github.com/spmeesseman/arg-parser/compare/v1.1.7...v1.1.8) (July 1st, 2021)

### Refactoring

- remove console logging

## Version [1.1.7](https://github.com/spmeesseman/arg-parser/compare/v1.1.6...v1.1.7) (July 1st, 2021)

### Documentation

- **Readme:** add personalized badges
- **Readme:** update badges

### Refactoring

- throw on invalid argument as opposed to exiting process

## Version 1.1.6 (June 25th, 2021)

### Documentation

- **Readme:** initial writing

### Features

- specify 'usage' as an array in addition to string

### Bug Fixes

- defined single dash "short" arguments do not work
- displaying help is showing err message'invalid argument specified...'
- doesnt read args params specified in arg mapping
- last release breaks args using old def format
- multi-line usage doesnt line up verticallywhen output

### Refactoring

- usage array print first item on top line

### Build System

- add publishrc app-publisher config file
