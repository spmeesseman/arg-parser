
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
