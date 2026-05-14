import { GeneralProperties } from '../../Interfaces';

export const generalBlanketAgreementDescription: GeneralProperties = [
    {
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar filtro',
        default: {},
        options: [
            {
                displayName: 'Código',
                name: 'code',
                type: 'number',
                default: 1,
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                    {
                        name: 'Aprovado',
                        value: 'asApproved',
                    },
                    {
                        name: 'Pausado',
                        value: 'asOnHold',
                    },
                    {
                        name: 'Terminado',
                        value: 'asTerminated',
                    },
                ],
                default: 'asApproved',
            },
            {
                displayName: 'Código do BP',
                name: 'bpCode',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Código do Projeto',
                name: 'projectCode',
                type: 'string',
                default: '',
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                ],
            },
        },
    },
    {
        displayName: 'Metadados de Origem',
        name: 'originMetadata',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
