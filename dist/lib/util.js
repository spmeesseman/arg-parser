"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegExp = exports.isString = exports.isNumeric = void 0;
function isNumeric(value) {
    return ((value !== null) && (value !== undefined) &&
        (value !== "") &&
        !isNaN(Number(value.toString())));
}
exports.isNumeric = isNumeric;
function isString(value) {
    return (value || value === "") && value instanceof String || typeof value === "string";
}
exports.isString = isString;
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(s) {
    s = s.toString();
    return (s && reHasRegExpChar.test(s)) ? s.replace(reRegExpChar, "\\$&") : s;
}
exports.escapeRegExp = escapeRegExp;
