export function extractDigitsFromString(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).replace(/\D/g, '');
}

export function applyDigitMask(value: string, mask: string): string | undefined {
    const digits = extractDigitsFromString(value);
    const expectedDigits = (mask.match(/0/g) ?? []).length;

    if (!digits.length || digits.length !== expectedDigits) {
        return undefined;
    }

    let digitIndex = 0;
    return mask.replace(/0/g, () => digits[digitIndex++] ?? '');
}
