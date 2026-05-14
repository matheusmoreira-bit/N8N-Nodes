import { SupplierProperties } from '../../Interfaces';

export const supplierGetByDocumentDescription: SupplierProperties = [
    {
        displayName: 'Número do Documento',
        name: 'document',
        type: 'string',
        default: '',
        required: true,
        description: 'Documentos aceitos: CPF ou CNPJ (com ou sem máscara).',
        displayOptions: {
            show: {
                resource: [
                    'supplier',
                ],
                operation: [
                    'getByDocument',
                ],
            },
        },
    },
];
