export function parseSelectedFields(selectMode: string, selectFieldsRaw: string): string[] | undefined {
    if (selectMode !== 'custom') {
        return undefined;
    }

    const fields = selectFieldsRaw
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field.length > 0);

    if (!fields.length) {
        throw new Error('Informe ao menos um campo em "Campos ($select)" quando o modo for lista customizada.');
    }

    return fields;
}
