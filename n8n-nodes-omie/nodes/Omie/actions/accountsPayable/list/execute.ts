import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';
import { dateToOmieFormat } from '../../../utils/date';
import { filterAccountsPayableResults } from '../../../utils/filters';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const returnAll = this.getNodeParameter('returnAll', index, true) as boolean;
    const maxItems = this.getNodeParameter('maxItems', index, 0) as number;
    const page = this.getNodeParameter('page', index, 1) as number;
    const pageSize = this.getNodeParameter('pageSize', index) as number;
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index) as boolean;
    const orderDescending = this.getNodeParameter('orderDescending', index) as boolean;
    const dateFrom = this.getNodeParameter('dateFrom', index) as string;
    const dateTo = this.getNodeParameter('dateTo', index) as string;
    const baixaBloqueada = this.getNodeParameter('baixaBloqueada', index, '') as string;
    const bloqueado = this.getNodeParameter('bloqueado', index, '') as string;
    const statusTitulo = this.getNodeParameter('statusTitulo', index, '') as string;
    const dataPrevisaoFrom = this.getNodeParameter('dataPrevisaoFrom', index, '') as string;
    const dataPrevisaoTo = this.getNodeParameter('dataPrevisaoTo', index, '') as string;

    const params: IDataObject = {
        pagina: page,
        registros_por_pagina: pageSize,
        apenas_importado_api: onlyApiImported ? 'S' : 'N',
    };

    if (orderDescending) {
        params.ordem_descrescente = 'S';
    }
    if (dateFrom) {
        params.filtrar_por_data_de = dateToOmieFormat(dateFrom);
    }
    if (dateTo) {
        params.filtrar_por_data_ate = dateToOmieFormat(dateTo);
    }

    const results = await api.listAccountsPayable(params, returnAll, maxItems);
    const filteredResults = filterAccountsPayableResults(results, {
        baixaBloqueada,
        bloqueado,
        statusTitulo,
        dataVencimentoFrom: dateFrom,
        dataVencimentoTo: dateTo,
        dataPrevisaoFrom,
        dataPrevisaoTo,
    });

    return this.helpers.returnJsonArray(filteredResults);
}
