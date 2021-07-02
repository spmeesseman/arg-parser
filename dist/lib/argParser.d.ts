export interface ArgParserOptions {
    enforceConstraints?: boolean;
    ignore?: string[];
    ignorePositional?: string[];
}
export interface ArgParserDefinition {
    argument: string | string[];
    default: string | string[] | boolean | number;
    help: string;
    isCmdLine: boolean;
    type: string;
}
export declare function parseArgs(argMap: any, apOpts: ArgParserOptions): any;
export declare function displayHelp(argMap: any): void;
