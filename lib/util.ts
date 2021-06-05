
export function isNumeric(value: string | number): boolean
{
   return ((value !== null) && (value !== undefined) &&
           (value !== "") &&
           !isNaN(Number(value.toString())));
}


export function isString(value: any): value is string
{
    return (value || value === "") && value instanceof String || typeof value === "string";
}


const reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExpChar = RegExp(reRegExpChar.source);

export function escapeRegExp(s: any)
{
    s = s.toString();
    return (s && reHasRegExpChar.test(s)) ? s.replace(reRegExpChar, "\\$&") : s;
}
