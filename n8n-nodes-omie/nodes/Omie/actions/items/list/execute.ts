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
    const codigoItemOmie = this.getNodeParameter('codigoItemOmie', index) as string;
    const descricao = this.getNodeParameter('descricao', index) as string;

    const params: IDataObject = {
        pagina: page,
        registros_por_pagina: pageSize,
    };

    if (onlyApiImported) {
        params.apenas_importado_api = 'S';
    }
    if (codigoItemOmie) {
        params.codigo_produto_omie = codigoItemOmie;
    }
    if (descricao) {
        params.descricao = descricao;
    }

    const results = await api.listItems(params);
    return this.helpers.returnJsonArray(results);
}
