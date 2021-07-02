"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayHelp = exports.parseArgs = void 0;
const process_1 = require("process"); // eslint-disable-line node/prefer-global/process
const util_1 = require("./util");
const util = __importStar(require("util"));
const hideSensitive = require("./hideSensitive");
let errors;
function parseArgs(argMap, apOpts) {
    if (!apOpts) {
        apOpts = {};
    }
    errors = [];
    //
    // Since the js port of argparse doesnt support the 'allowAbbrev' property, manually
    // parse the arguments.  Jeezuz these devs sometimes makes the simplest things so complicated.
    // Achieved half the functionality of the enture argparse library with a 100 line function.
    //
    const opts = doParseArgs(argMap, apOpts);
    try {
        //
        // Validate options
        //
        Object.entries(opts).forEach((o) => {
            const property = o[0];
            let value = o[1];
            if (property === "help" || property === "version") {
                return; // continue forEach()
            }
            if (!argMap[property]) {
                throwError(`Unsupported publishrc option specified: ${property}`, apOpts);
            }
            if (!argMap[property][0]) {
                throwError(`A publishrc option specified cannot be used on the command line: ${property}`, apOpts);
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
            const publishRcType = argMap[property][1].trim(), defaultValue = argMap[property][2];
            if (publishRcType === "flag") {
                if ((!value && defaultValue === "N") || (value && defaultValue === "Y")) {
                    delete opts[o[0]];
                    return; // continue forEach()
                }
                opts[o[0]] = value = value ? "Y" : "N";
            }
            else if (publishRcType === "boolean") {
                if ((!value && !defaultValue) || (value && defaultValue)) {
                    delete opts[o[0]];
                    return; // continue forEach()
                }
            }
            else if (publishRcType.startsWith("enum(")) {
                let enumIsValid = false, enumValues;
                const matches = publishRcType.match(/[ ]*enum\((.+)\)/);
                if (matches && matches.length > 1) // [0] is the whole match
                 { // [1] is the 1st capture group match
                    enumValues = matches[1];
                    const vStrs = enumValues.split("|");
                    if (!value) {
                        value = vStrs[0];
                    }
                    else {
                        for (const v in vStrs) {
                            if (value[0] === vStrs[v]) {
                                value = value[0];
                                enumIsValid = true;
                                break;
                            }
                        }
                    }
                }
                if (!enumIsValid) {
                    throwError(`Invalid publishrc option value specified: ${property}, must be: ${enumValues}`, apOpts);
                }
            }
        });
    }
    catch (error) {
        if (error.name !== "YError") {
            errors.push(hideSensitive(process_1.env)(util.inspect(error, { colors: true })));
        }
    }
    if (errors.length > 0) {
        opts.errors = [...errors];
    }
    return opts;
}
exports.parseArgs = parseArgs;
function displayHelp(argMap) {
    console.log("");
    console.log("usage:");
    console.log("   All publishrc property names are the camel cased equivalent of the lowercase");
    console.log("   command line options, for example:");
    console.log("");
    console.log("   The command line equivalent to the .publishrc property 'emailNotification' is:");
    console.log("");
    console.log("      --email-notification");
    console.log("");
    Object.entries(argMap).forEach((o) => {
        if (!o || !o[0]) {
            return;
        }
        let line = `  ${o[0]}`;
        const property = o[0], def = o[1];
        if (property.length < 22) {
            for (let i = property.length; i < 22; i++) {
                line += " ";
            }
        }
        else {
            line += "\n                        ";
        }
        if (def && def instanceof Array && def.length > 3) {
            const valueType = def[1], cmdLineArgs = getArgsFromProperty(property, argMap);
            let cmdLine = "", usage = "";
            if (def[3] instanceof String || typeof def[3] === "string") //  [
             { //    true,
                line += def[3]; //    "boolean",
                console.log(line); //    false,
                for (let i = 4; i < def.length; i++) { //    "Display help. This continues",
                    console.log(`                        ${def[i]}`); //    "to successuve lines with ','."
                } //  ]
            }
            else if (def.length > 4 && def[4] instanceof Object) //  [
             { //     true,
                const odef = def[4], //     "boolean"
                lines = odef.help.split("\n"); //       true,
                line += lines[0]; //     [ -h, ---help ],
                console.log(line); //     {
                for (let i = 1; i < lines.length; i++) { //       help: "Display help.  This continues" +
                    console.log(`                        ${lines[i]}`); //             "to successive lines with '+'."
                } //       usage: ""
                if (odef.usage) { //     }
                    usage = odef.usage; //  ]
                }
            }
            console.log("");
            if (valueType === "flag") {
                cmdLine = cmdLineArgs.join(", ");
                console.log("                        Type         : flag");
            }
            else if (valueType.startsWith("enum(")) {
                cmdLine = cmdLineArgs[0] + " <enum>";
                if (cmdLineArgs.length > 1) {
                    cmdLine = " ,  " + cmdLineArgs[1] + " <enum>";
                }
                console.log("                        Type         : enumeration");
                console.log("                        Allowed      : " + valueType.replace(/[\(\)]|enum\(/gi, "").replace(/\|/g, " | "));
            }
            else if (valueType.startsWith("string")) // string , string[], string|string[]
             {
                cmdLine = cmdLineArgs[0] + " <value>";
                if (cmdLineArgs.length > 1) {
                    cmdLine = " ,  " + cmdLineArgs[1] + " <value>";
                }
                console.log("                        Type         : " + valueType.replace(/\|/g, " | "));
            }
            else if (valueType === "number") {
                cmdLine = cmdLineArgs[0] + " <number>";
                if (cmdLineArgs.length > 1) {
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
                if (usage instanceof Array) {
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
exports.displayHelp = displayHelp;
function getArgsFromProperty(property, argMap) {
    const args = [];
    if (property) {
        let added = false;
        const mapArg = argMap[property][3], hasNewDef = argMap[property][4] instanceof Object;
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
function getPropertyFromArg(arg, argMap) {
    if (arg.startsWith("--")) {
        return arg.replace(/^[\-]{2}/, "").replace(/([\-])([a-z])/g, (x, y, z) => { return z.toUpperCase(); });
    }
    for (const a in argMap) {
        let value = argMap[a];
        if (value && value.length > 3) {
            const argStrings = value[3];
            if (argStrings instanceof Array) {
                if (argStrings.includes(arg)) {
                    return a;
                }
            }
        }
    }
}
function throwError(err, apOpts) {
    errors.push(err);
    if (apOpts.enforceConstraints) {
        throw new Error(err);
    }
}
function doParseArgs(argMap, apOpts) {
    const opts = {}, args = process.argv.slice(2);
    let lastProp, lastType, lastIsPositional, skipCompat = false;
    args.forEach((a) => {
        var _a, _b;
        if (a.startsWith("-")) { //
            // Backwards compat
            //
            if ((_a = apOpts.ignore) === null || _a === void 0 ? void 0 : _a.includes(a)) {
                return; // continue forEach()
            }
            if ((_b = apOpts.ignorePositional) === null || _b === void 0 ? void 0 : _b.includes(a)) {
                skipCompat = true;
                return; // continue forEach()
            }
            //
            const p = getPropertyFromArg(a, argMap);
            if (!p || !argMap[p]) {
                throwError(`Unsupported publishrc option specified: ${a}`, apOpts);
            }
            if (lastIsPositional) {
                if (lastType === "flag") { // flag types specified on cmd linew/ no positional just default to Y
                    opts[lastProp] = "Y";
                }
                else {
                    throwError(`Positional parameter not specified for: ${lastProp}`, apOpts);
                }
            }
            const valueType = argMap[p][1];
            // defaultValue = argMap[p][2];
            lastProp = p; // Record 'last', used for positionals
            lastType = valueType;
            lastIsPositional = valueType !== "boolean";
            skipCompat = false;
            if (!lastIsPositional) {
                opts[p] = true;
            }
        }
        else if (lastProp) {
            const valueType = argMap[lastProp][1];
            //
            // Backwards compat
            //
            if (skipCompat) {
                skipCompat = false;
                return; // continue forEach()
            }
            //
            if (valueType.includes("string")) {
                if (!opts[lastProp]) {
                    if (valueType.includes("string[]")) {
                        opts[lastProp] = [a];
                    }
                    else {
                        opts[lastProp] = a;
                    }
                }
                else if (valueType.includes("string[]")) {
                    opts[lastProp].push(a);
                }
                else {
                    throwError(`String type arguments can have only one positional parameter: ${lastProp}`, apOpts);
                }
            }
            else if (valueType.startsWith("enum")) {
                if (!opts[lastProp]) {
                    opts[lastProp] = a;
                }
                else {
                    throwError(`Enum type arguments can have only one positional parameter: ${lastProp}`, apOpts);
                }
            }
            else if (valueType.startsWith("flag")) {
                if (!opts[lastProp]) {
                    if (a !== "Y" && a !== "N") {
                        throwError(`Flag type arguments can have only one positional parameter: ${lastProp}`, apOpts);
                    }
                    opts[lastProp] = a;
                }
                else {
                    throwError("Flag type arguments can have only one positional parameter: Y/N", apOpts);
                }
            }
            else if (valueType.includes("number")) {
                if (util_1.isNumeric(a)) {
                    if (!opts[lastProp]) {
                        opts[lastProp] = Number(a);
                    }
                    else {
                        throwError(`Number type arguments can have only one positional parameter: ${lastProp}`, apOpts);
                    }
                }
                else {
                    throwError(`Positional parameter must be a number for property: ${lastProp}`, apOpts);
                }
            }
            else {
                throwError(`Positional parameter not supported for property: ${lastProp}`, apOpts);
            }
            lastIsPositional = undefined;
        }
    });
    if (lastIsPositional) {
        throwError(`Positional parameter not specified for '${lastProp}'`, apOpts);
    }
    return opts;
}
