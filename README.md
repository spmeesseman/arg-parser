# Command Line Argument Parser

- [Command Line Argument Parser](#command-line-argument-parser)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Help Output](#help-output)
  - [Issues](#issues)
  - [LICENSE](#license)

## Introduction

Simple command line parser.  Specify and array of argument defintions and let arg-parser do the work.

## Getting Started

Run the following command to install arg-parser:

    npm install @spmeesseman/arg-parser

## Usage

Import the ArgParser class:

    const ArgParser = require("@spmeesseman/arg-parser").ArgParser;

Instantiate:

    const parser = new ArgParser({
        app: "app-publisher",
        banner, version,
        ignorePositional: [ "-p", "--profile" ]
    });

Parse:

    const opts = parser.parseArgs(cmdLineDefs);

The *cmdLineDefs* argument is an object that defines the command line optons for the application.  Each property value can be of type *ArgParserDefinition*, or, an array of properties. At this time, *ArgParserDefinition* has not been completely implemented, so please use an array type definition for each command line option, for example:

    branch: [
        true,                 // Can specify on command line
        "string",             // Value type
        "trunk",              // Default value
        "The branch to use."  // Help description (multi-line)
    ]

Multiple lines of help are just additional entries in the array:

    bugs: [
        true,
        "string",
        "",
        "Overrides the 'bugs' property of package.json when an NPM release is",
        "made, which is extracted for display on the project page of the NPM",
        "repository."
    ]

Alernatively, he *help* property of *ArgParserDefinition* can be used as of initial release, within the array definition:

    dryRun: [
        true,
        "boolean",
        false,
        [ "-d", "--dry-run" ],
        {
            help: "Run in dry/test mode, all changes are reverted.\n" +
                  "In dry-run mode, the following holds:\n" +
                  "    1) Installer is not released/published\n" +
                  "    2) Email notification will be sent only to $TESTEMAILRECIPIENT\n" +
                  "    3) Commit package/build file changes (svn) are not made\n" +
                  "    4) Version tag (svn) is not made\n" +
                  "Some local files may be changed in test mode (i.e. updated version\n" +
                  "numbers in build and package files).  These changes should be reverted\n" +
                  "to original state via SCM"
        }
    ]

Note that the *help* property of *ArgParserDefinition* is one string, as opposed to an array type definition, where each help line is an additional item in the array.

Both *ArgParserDefinition* objects and array definitions can be used within the same definitions object, it does not ave to be one or the other.

A compiled example of a definitionas object to be passed to *parseArgs()*:

    const argParserDefs =
    {
        branch: [
            true,                 // Can specify on command line
            "string",             // Value type
            "trunk",              // Default value
            "The branch to use."  // Help description (multi-line)
        ],
        bugs: [
            true,
            "string",
            "",
            "Overrides the 'bugs' property of package.json when an NPM release is",
            "made, which is extracted for display on the project page of the NPM",
            "repository."
        ],
        dryRun: [
            true,
            "boolean",
            false,
            [ "-d", "--dry-run" ],
            {
                help: "Run in dry/test mode, all changes are reverted.\n" +
                    "In dry-run mode, the following holds:\n" +
                    "    1) Installer is not released/published\n" +
                    "    2) Email notification will be sent only to $TESTEMAILRECIPIENT\n" +
                    "    3) Commit package/build file changes (svn) are not made\n" +
                    "    4) Version tag (svn) is not made\n" +
                    "Some local files may be changed in test mode (i.e. updated version\n" +
                    "numbers in build and package files).  These changes should be reverted\n" +
                    "to original state via SCM"
            }
        ]
    };

    const ArgParser = require("@spmeesseman/arg-parser").ArgParser;
    const parser = new ArgParser({
        app: "app-publisher",
        banner, version,
        ignorePositional: [ "-p", "--profile" ]
    });
    const opts = parser.parseArgs(cmdLineDefs);

All options passed on the command line can be access via the returned *opts* object of *parser.parseArgs()*.

## Help Output

Help is generated and formatted for each specified command line option definition, for example:

    writeLog            In addition to stdout, writes a log to LOCALAPPDATA\app-name\log

                        Type         : flag
                        Defaults to  : N
                        Command Line : --write-log

## Issues

Report issues and enhancements in the project's [Github Issue Tracker](https://github.com/spmeesseman/arg-parser/issues).

## LICENSE

Licensed under MIT, see [LICENSE](LICENSE.md)
