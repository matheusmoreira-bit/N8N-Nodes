import { AttachmentsProperties } from '../../Interfaces';

export const attachmentsCreateDescription: AttachmentsProperties = [
    {
        displayName: 'Chave do arquivo binário',
        name: 'binaryKey',
        type: 'string',
        default: '',
        required: true,
        description: 'O nome da chave em que o arquivo binário do n8n se encontra.',
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'create',
                ],
            },
        },
    },
    {
        displayName: 'Número da Nota Fiscal de Entrada',
        name: 'docEntry',
        type: 'number',
        default: '',
        required: true,
        description: 'O campo DocEntry do PurchaseInvoices.',
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'create',
                ],
            },
        },
    },
    {
        displayName: 'Enviar como esboço',
        name: 'useDraft',
        type: 'boolean',
        default: false,
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'create',
                ],
                resource: [
                    'attachments',
                ],
            },
        },
        description: 'Se o anexo será atribuido a Drafts ou PurchaseDownPayments.',
    },
];
