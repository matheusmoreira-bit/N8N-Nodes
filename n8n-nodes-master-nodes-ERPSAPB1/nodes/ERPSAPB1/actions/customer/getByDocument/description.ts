import { CustomerProperties } from '../../Interfaces';

export const customerGetByDocumentDescription: CustomerProperties = [
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
                    'customer',
                ],
                operation: [
                    'getByDocument',
                ],
            },
        },
    },
];
