"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToOmieFormat = dateToOmieFormat;
function dateToOmieFormat(value) {
    const trimmed = value.trim();
    const omieDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (omieDateMatch) {
        return trimmed;
    }
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        return `${day}/${month}/${year}`;
    }
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
//# sourceMappingURL=date.js.map