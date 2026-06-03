import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const codigoProdutoOmie = this.getNodeParameter('codigoProdutoOmie', index) as string;
    const codigoProdutoIntegracao = this.getNodeParameter('codigoProdutoIntegracao', index) as string;
    const descricao = this.getNodeParameter('descricao', index) as string;
    const unidade = this.getNodeParameter('unidade', index) as string;
    const ncm = this.getNodeParameter('ncm', index) as string;

    const payload: IDataObject = {
        codigo_produto_omie: codigoProdutoOmie,
    };

    if (codigoProdutoIntegracao) {
        payload.codigo_produto_integracao = codigoProdutoIntegracao;
    }
    if (descricao) {
        payload.descricao = descricao;
    }
    if (unidade) {
        payload.unidade = unidade;
    }
    if (ncm) {
        payload.ncm = ncm;
    }

    const response = await api.updateItem(payload);
    return this.helpers.returnJsonArray([response]);
}
