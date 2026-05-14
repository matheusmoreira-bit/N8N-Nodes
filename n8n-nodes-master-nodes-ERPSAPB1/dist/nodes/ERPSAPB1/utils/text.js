"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDigitsFromString = extractDigitsFromString;
exports.applyDigitMask = applyDigitMask;
function extractDigitsFromString(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).replace(/\D/g, '');
}
function applyDigitMask(value, mask) {
    var _a;
    const digits = extractDigitsFromString(value);
    const expectedDigits = ((_a = mask.match(/0/g)) !== null && _a !== void 0 ? _a : []).length;
    if (!digits.length || digits.length !== expectedDigits) {
        return undefined;
    }
    let digitIndex = 0;
    return mask.replace(/0/g, () => { var _a; return (_a = digits[digitIndex++]) !== null && _a !== void 0 ? _a : ''; });
}
