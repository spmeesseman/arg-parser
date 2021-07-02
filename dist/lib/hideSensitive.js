"use strict";
const util_1 = require("./util");
const constants_1 = require("./constants");
function hideSensitive(env) {
    const toReplace = Object.keys(env).filter(envVar => /token|password|credential|secret|private/i.test(envVar) && env[envVar].trim().length >= constants_1.SECRET_MIN_SIZE);
    const regexp = new RegExp(toReplace.map(envVar => util_1.escapeRegExp(env[envVar])).join("|"), "g");
    return output => output && util_1.isString(output) && toReplace.length > 0 ? output.toString().replace(regexp, constants_1.SECRET_REPLACEMENT) : output;
}
;
module.exports = hideSensitive;
