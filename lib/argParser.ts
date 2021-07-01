import { env, stderr } from "process"; // eslint-disable-line node/prefer-global/process
import { isNumeric } from "./util";
import * as util from "util";
import gradient from "gradient-string";
import chalk from "chalk";
import hideSensitive = require("./hideSensitive");


export interface ArgParserOptions
{
    app: string;
    banner?: string;
    version?: string;
    enforceConstraints?: boolean;
    ignore?: string[];
    ignorePositional?: string[];
}

export interface ArgParserDefinition
{
    argument: string | string[]
    default: string | string[] | boolean | number;
    help: string;
    isCmdLine: boolean;
    type: string;
}


export class ArgParser
{
    apOpts: ArgParserOptions;

    /**
     * Instantiates an argument parser
     * @param [options] Parser options
     * @param [options.app] App name
     * @param [options.banner]
     * A banner to be displayed when the console starts up, using chalk and gradient
     */
    constructor(options?: ArgParserOptions)
    {
        this.apOpts = options;
        if (this.apOpts.enforceConstraints === undefined) {
            this.apOpts.enforceConstraints = true;
        }
    }

    parseArgs(argMap: any)
    {
        return _parseArgs(argMap, this.apOpts);
    }
}


function _parseArgs(argMap: any, apOpts?: ArgParserOptions): any
{
    if (!apOpts) {
        apOpts = {
            app: "App"
        };
    }
    if (!apOpts.app) {
        apOpts.app = "App";
    }
    if (!apOpts.banner) {
        apOpts.app = "Command Line Help by ArgParser";
    }
    if (!apOpts.version) {
        apOpts.app = "0.0.0";
    }

    const argMapExt = { ... {
        help: [
            true,
            "boolean",
            false,
            [ "-h", "--help" ],
            {
                dest: "help",
                action: "storeTrue",
                help: "Display help."
            }
        ],
        verbose: [
            true,
            "boolean",
            false,
            [ "--verbose" ],
            {
                help: "Enable additional log output."
            }
        ],
        version: [
            true,
            "boolean",
            false,
            [ "-v", "--version" ],
            {
                help: "Display the current app-publisher version."
            }
        ]
    }, ... argMap};

    //
    // Since the js port of argparse doesnt support the 'allowAbbrev' property, manually
    // parse the arguments.  Jeezuz these devs sometimes makes the simplest things so complicated.
    // Achieved half the functionality of the enture argparse library with a 100 line function.
    //
    const opts = doParseArgs(argMapExt, apOpts);

    try { //
         // If user specified '-h' or --help', then just display help and exit
        //
        if (opts.help)
        {
            displayIntro(apOpts?.banner);
            displayHelp(argMapExt);
            process.exit(0);
        }

        //
        // If user specified '--version', then just display version and exit
        //
        if (opts.version)
        {
            displayIntro(apOpts?.banner);
            console.log(chalk.bold(gradient("cyan", "pink").multiline(
`----------------------------------------------------------------------------
${apOpts.app} Version :  ${apOpts.version}
----------------------------------------------------------------------------
`, {interpolation: "hsv"})));
            process.exit(0);
        }

        if (apOpts.enforceConstraints)
        {
            //
            // Validate options
            //
            Object.entries(opts).forEach((o) =>
            {
                const property: string = o[0];
                let value: string | string[] = o[1] as (string | string[]);

                if (property === "help" || property === "version") {
                    return; // continue forEach()
                }

                if (!argMapExt[property])
                {
                    throw new Error(`Unsupported publishrc option specified: ${property}`);
                }

                if (!argMapExt[property][0])
                {
                    throw new Error(`A publishrc option specified cannot be used on the command line: ${property}`);
                }

                //
                // Remove properties from the object that were not explicitly specified
                //
                if (value === null) {
                    delete opts[o[0]];
                    return; // continue forEach()
                }

                // if (value instanceof Array)
                // {
                //     value = o.toString();
                // }

                const publishRcType = argMapExt[property][1].trim(),
                      defaultValue = argMapExt[property][2];

                if (publishRcType === "flag")
                {
                    if ((!value && defaultValue === "N") || (value && defaultValue === "Y")) {
                        delete opts[o[0]];
                        return; // continue forEach()
                    }
                    opts[o[0]] = value = value ? "Y" : "N";
                }
                else if (publishRcType === "boolean")
                {
                    if ((!value && !defaultValue) || (value && defaultValue)) {
                        delete opts[o[0]];
                        return; // continue forEach()
                    }
                }
                else if (publishRcType.startsWith("enum("))
                {
                    let enumIsValid = false, enumValues: string;
                    const matches = publishRcType.match(/[ ]*enum\((.+)\)/);
                    if (matches && matches.length > 1) // [0] is the whole match
                    {                                  // [1] is the 1st capture group match
                        enumValues = matches[1];
                        const vStrs = enumValues.split("|");
                        if (!value) {
                            value = vStrs[0];
                        }
                        else {
                            for (const v in vStrs)
                            {
                                if (value[0] === vStrs[v]) {
                                    value = value[0];
                                    enumIsValid = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!enumIsValid)
                    {
                        throw new Error(`Invalid publishrc option value specified: ${property}, must be: ${enumValues}`);
                    }
                }
            });
        }

        if (opts.verbose) // even if it's a stdout type task
        {
            displayIntro(apOpts?.banner);
            console.log(gradient("cyan", "pink").multiline(
`----------------------------------------------------------------------------
Current Command Line Options
----------------------------------------------------------------------------
`, {interpolation: "hsv"}));
            console.log(JSON.stringify(opts, undefined, 2));
        }
    }
    catch (error)
    {
        if (error.name !== "YError") {
            stderr.write(hideSensitive(env)(util.inspect(error, {colors: true})));
        }
    }

    return opts;
}


function displayIntro(banner: string)
{
    if (banner) {
        console.log(chalk.bold(gradient("cyan", "pink").multiline(banner, {interpolation: "hsv"})));
    }
}


function displayHelp(argMap: any)
{
    console.log(gradient("cyan", "pink").multiline(
`----------------------------------------------------------------------------
Detailed Help
----------------------------------------------------------------------------
        `, {interpolation: "hsv"}));
    console.log("");
    console.log("usage:");
    console.log("   All publishrc property names are the camel cased equivalent of the lowercase");
    console.log("   command line options, for example:");
    console.log("");
    console.log("   The command line equivalent to the .publishrc property 'emailNotification' is:");
    console.log("");
    console.log("      --email-notification");
    console.log("");

    Object.entries(argMap).forEach((o) =>
    {
        if (!o || !o[0]) { return; }
        let line = `  ${o[0]}`;
        const property =  o[0],
            def = o[1];

        if (property.length < 22)
        {
            for (let i = property.length; i < 22; i++) {
                line += " ";
            }
        }
        else {
            line += "\n                        ";
        }

        if (def && def instanceof Array && def.length > 3)
        {
            const valueType: string = def[1] as string,
                cmdLineArgs = getArgsFromProperty(property, argMap);
            let cmdLine = "", usage: string | string[] = "";

            if (def[3] instanceof String || typeof def[3] === "string")   //  [
            {                                                             //    true,
                line += def[3];                                           //    "boolean",
                console.log(line);                                        //    false,
                for (let i = 4; i < def.length; i++) {                    //    "Display help. This continues",
                    console.log(`                        ${def[i]}`);     //    "to successuve lines with ','."
                }                                                         //  ]
            }
            else if (def.length > 4 && def[4] instanceof Object)          //  [
            {                                                             //     true,
                const odef = def[4],                                      //     "boolean"
                    lines = odef.help.split("\n");                      //       true,
                line += lines[0];                                         //     [ -h, ---help ],
                console.log(line);                                        //     {
                for (let i = 1; i < lines.length; i++) {                  //       help: "Display help.  This continues" +
                    console.log(`                        ${lines[i]}`);   //             "to successive lines with '+'."
                }                                                         //       usage: ""
                if (odef.usage) {                                         //     }
                    usage = odef.usage;                                   //  ]
                }
            }
            console.log("");
            if (valueType === "flag")
            {
                cmdLine = cmdLineArgs.join(", ");
                console.log("                        Type         : flag");
            }
            else if (valueType.startsWith("enum("))
            {
                cmdLine = cmdLineArgs[0] + " <enum>";
                if (cmdLineArgs.length > 1){
                    cmdLine = " ,  " + cmdLineArgs[1] + " <enum>";
                }
                console.log("                        Type         : enumeration");
                console.log("                        Allowed      : " + valueType.replace(/[\(\)]|enum\(/gi, "").replace(/\|/g, " | "));
            }
            else if (valueType.startsWith("string")) // string , string[], string|string[]
            {
                cmdLine = cmdLineArgs[0] + " <value>";
                if (cmdLineArgs.length > 1){
                    cmdLine = " ,  " + cmdLineArgs[1] + " <value>";
                }
                console.log("                        Type         : " + valueType.replace(/\|/g, " | "));
            }
            else if (valueType === "number")
            {
                cmdLine = cmdLineArgs[0] + " <number>";
                if (cmdLineArgs.length > 1){
                    cmdLine = " ,  " + cmdLineArgs[1] + " <number>";
                }
                console.log("                        Type         : " + valueType);
            }
            else { // boolean
                cmdLine = cmdLineArgs.join(", ");
                console.log("                        Type         : " + valueType);
            }

            console.log("                        Defaults to  : " + def[2].toString());
            console.log("                        Command Line : " + cmdLine);
            if (usage) {
                if (usage instanceof Array)
                {
                    console.log("                        Usage        : " + usage[0]);
                    for (let i = 1; i < usage.length; i++) {
                        console.log("                                       " + usage[i]);
                    }
                }
                else {
                    console.log("                        Usage        : " + usage);
                }
            }
            console.log("");
        }
        else {
            console.log(line);
            console.log("");
        }
    });
}


function getArgsFromProperty(property: string, argMap: any): string[]
{
    const args: string[] = [];
    if (property)
    {
        let added = false;
        const mapArg: string | string[] = argMap[property][3],
              hasNewDef = argMap[property][4] instanceof Object;
        if (hasNewDef && mapArg.length > 0) {
            if (mapArg instanceof Array) {
                for (const mArg of mapArg) {
                    if (mArg.startsWith("-")) {
                        args.push(mArg);
                        added = true;
                    }
                    else {
                        console.log("!!! Invalid argument specified in " + property + " mapping !!!");
                    }
                }
            }
            else {
                if (mapArg.startsWith("-")) {
                    args.push(mapArg);
                    added = true;
                }
                else {
                    console.log("!!! Invalid argument specified in " + property + " mapping !!!");
                }
            }
        }
        if (!added) {
            args.push("--" + property.replace(/(?:^|\.?)([A-Z])/g, (x, y) => { return "-" + y.toLowerCase(); }));
        }
    }
    return args;
}


function getPropertyFromArg(arg: string, argMap: any): string | undefined
{
    if (arg.startsWith("--")) {
        return arg.replace(/^[\-]{2}/, "").replace(/([\-])([a-z])/g, (x, y, z) => { return z.toUpperCase(); });
    }
    for (const a in argMap)
    {
        let value = argMap[a];
        if (value && value.length > 3)
        {
            const argStrings = value[3];
            if (argStrings instanceof Array)
            {
                if (argStrings.includes(arg)) {
                    return a;
                }
            }
        }
    }
}


function doParseArgs(argMap: any, apOpts?: ArgParserOptions): any
{
    const opts: any = {},
        args = process.argv.slice(2);
    let lastProp: string,
        lastType: string,
        lastIsPositional: boolean,
        skipCompat = false;

    args.forEach((a) =>
    {
        if (a.startsWith("-"))
        {   //
            // Backwards compat
            //
            if (apOpts.ignore?.includes(a)) {
                return; // continue forEach()
            }
            if (apOpts.ignorePositional?.includes(a)) {
                skipCompat = true;
                return; // continue forEach()
            }
            //
            const p = getPropertyFromArg(a, argMap);
            if (!p || !argMap[p])
            {
                throw new Error(`Unsupported publishrc option specified: ${a}`);
            }
            if (lastIsPositional)
            {
                if (lastType === "flag")
                {   // flag types specified on cmd linew/ no positional just default to Y
                    opts[lastProp] = "Y";
                }
                else {
                    throw new Error(`Positional parameter not specified for: ${lastProp}`);
                }
            }

            const valueType = argMap[p][1];
                // defaultValue = argMap[p][2];

            lastProp = p;               // Record 'last', used for positionals
            lastType = valueType;
            lastIsPositional = valueType !==  "boolean";
            skipCompat = false;

            if (!lastIsPositional)
            {
                opts[p] = true;
            }
        }
        else if (lastProp)
        {
            const valueType = argMap[lastProp][1];
            //
            // Backwards compat
            //
            if (skipCompat) {
                skipCompat = false;
                return; // continue forEach()
            }
            //
            if (valueType.includes("string"))
            {
                if (!opts[lastProp]) {
                    if (valueType.includes("string[]")) {
                        opts[lastProp] = [ a ];
                    }
                    else {
                        opts[lastProp] = a;
                    }
                }
                else if (valueType.includes("string[]")) {
                    opts[lastProp].push(a);
                }
                else {
                    throw new Error(`String type arguments can have only one positional parameter: ${lastProp}`);
                }
            }
            else if (valueType.startsWith("enum"))
            {
                if (!opts[lastProp]) {
                    opts[lastProp] = a;
                }
                else {
                    throw new Error(`Enum type arguments can have only one positional parameter: ${lastProp}`);
                }
            }
            else if (valueType.startsWith("flag"))
            {
                if (!opts[lastProp]) {
                    if (a !== "Y" && a !== "N") {
                        throw new Error(`Flag type arguments can have only one positional parameter: ${lastProp}`);
                    }
                    opts[lastProp] = a;
                }
                else {
                    throw new Error("Flag type arguments can have only one positional parameter: Y/N");
                }
            }
            else if (valueType.includes("number"))
            {
                if (isNumeric(a)) {
                    if (!opts[lastProp]) {
                        opts[lastProp] = Number(a);
                    }
                    else {
                        throw new Error(`Number type arguments can have only one positional parameter: ${lastProp}`);
                    }
                }
                else
                {
                    throw new Error(`Positional parameter must be a number for property: ${lastProp}`);
                }
            }
            else
            {
                throw new Error(`Positional parameter not supported for property: ${lastProp}`);
            }
            lastIsPositional = undefined;
        }
    });

    if (lastIsPositional)
    {
        throw new Error(`Positional parameter not specified for '${lastProp}'`);
    }

    return opts;
}
