import { DebugProperties } from '../../Interfaces';

export const debugGetInvoiceDescription: DebugProperties = [
    {
        displayName: 'Número do documento',
        name: 'docNum',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: [
                    'debug',
                ],
                operation: [
                    'getInvoice',
                ],
            },
        },
    },
];
