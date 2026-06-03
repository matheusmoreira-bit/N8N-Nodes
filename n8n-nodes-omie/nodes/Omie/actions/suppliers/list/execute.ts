import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const page = this.getNodeParameter('page', index) as number;
    const pageSize = this.getNodeParameter('pageSize', index) as number;
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index) as boolean;
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index) as string;
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index) as string;

    const params: IDataObject = {
        pagina: page,
        registros_por_pagina: pageSize,
    };

    if (onlyApiImported) {
        params.apenas_importado_api = 'S';
    }
    if (cpfCnpj) {
        params.cpf_cnpj = cpfCnpj;
    }
    if (nomeFantasia) {
        params.nome_fantasia = nomeFantasia;
    }

    const results = await api.listSuppliers(params);
    return this.helpers.returnJsonArray(results);
}
