"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const date_1 = require("../../../utils/date");
const filters_1 = require("../../../utils/filters");
async function execute(api, index) {
    const returnAll = this.getNodeParameter('returnAll', index, true);
    const maxItems = this.getNodeParameter('maxItems', index, 0);
    const page = this.getNodeParameter('page', index, 1);
    const pageSize = this.getNodeParameter('pageSize', index);
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index);
    const orderDescending = this.getNodeParameter('orderDescending', index);
    const dateFrom = this.getNodeParameter('dateFrom', index);
    const dateTo = this.getNodeParameter('dateTo', index);
    const baixaBloqueada = this.getNodeParameter('baixaBloqueada', index, '');
    const bloqueado = this.getNodeParameter('bloqueado', index, '');
    const statusTitulo = this.getNodeParameter('statusTitulo', index, '');
    const dataPrevisaoFrom = this.getNodeParameter('dataPrevisaoFrom', index, '');
    const dataPrevisaoTo = this.getNodeParameter('dataPrevisaoTo', index, '');
    const params = {
        pagina: page,
        registros_por_pagina: pageSize,
        apenas_importado_api: onlyApiImported ? 'S' : 'N',
    };
    if (orderDescending) {
        params.ordem_descrescente = 'S';
    }
    if (dateFrom) {
        params.filtrar_por_data_de = (0, date_1.dateToOmieFormat)(dateFrom);
    }
    if (dateTo) {
        params.filtrar_por_data_ate = (0, date_1.dateToOmieFormat)(dateTo);
    }
    const results = await api.listAccountsPayable(params, returnAll, maxItems);
    const filteredResults = (0, filters_1.filterAccountsPayableResults)(results, {
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
//# sourceMappingURL=execute.js.map