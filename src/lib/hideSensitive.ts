
import { isString, escapeRegExp } from "./util";
import { SECRET_REPLACEMENT, SECRET_MIN_SIZE } from "./constants";

function hideSensitive(env: any) {
  const toReplace = Object.keys(env).filter(
    envVar => /token|password|credential|secret|private/i.test(envVar) && env[envVar].trim().length >= SECRET_MIN_SIZE);

  const regexp = new RegExp(toReplace.map(envVar => escapeRegExp(env[envVar])).join("|"), "g");
  return output =>
    output && isString(output) && toReplace.length > 0 ? output.toString().replace(regexp, SECRET_REPLACEMENT) : output;
};

export = hideSensitive;
