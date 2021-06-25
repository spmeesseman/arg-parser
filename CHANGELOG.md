# ARG-PARSER CHANGE LOG

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
