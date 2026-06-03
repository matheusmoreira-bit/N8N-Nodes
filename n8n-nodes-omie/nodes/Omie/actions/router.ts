import {
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';

import * as accountsPayable from './accountsPayable';
import * as suppliers from './suppliers';
import * as items from './items';
import * as payments from './payments';
import { OmieApi } from '../transport/OmieApi';

export async function router(this: IExecuteFunctions, api: OmieApi): Promise<INodeExecutionData[]> {
    const inputItems = this.getInputData();
    const operationResult: INodeExecutionData[] = [];

    for (let i = 0; i < inputItems.length; i++) {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        try {
            if (resource === 'accountsPayable') {
                if (operation === 'list') {
                    operationResult.push(...await accountsPayable.listExecute.call(this, api, i));
                } else if (operation === 'settle') {
                    operationResult.push(...await accountsPayable.settleExecute.call(this, api, i));
                } else {
                    throw new Error(`Operação '${operation}' não suportada para contas a pagar.`);
                }
            } else if (resource === 'supplier') {
                if (operation === 'list') {
                    operationResult.push(...await suppliers.listExecute.call(this, api, i));
                } else if (operation === 'update') {
                    operationResult.push(...await suppliers.updateExecute.call(this, api, i));
                } else {
                    throw new Error(`Operação '${operation}' não suportada para fornecedores.`);
                }
            } else if (resource === 'item') {
                if (operation === 'list') {
                    operationResult.push(...await items.listExecute.call(this, api, i));
                } else if (operation === 'update') {
                    operationResult.push(...await items.updateExecute.call(this, api, i));
                } else {
                    throw new Error(`Operação '${operation}' não suportada para itens.`);
                }
            } else if (resource === 'payment') {
                if (operation === 'list') {
                    operationResult.push(...await payments.listExecute.call(this, api, i));
                } else if (operation === 'settle') {
                    operationResult.push(...await payments.settleExecute.call(this, api, i));
                } else {
                    throw new Error(`Operação '${operation}' não suportada para pagamentos.`);
                }
            } else {
                throw new Error(`Recurso '${resource}' não está implementado.`);
            }
        } catch (err: any) {
            if (this.continueOnFail()) {
                operationResult.push({ json: inputItems[i].json, error: err });
            } else {
                throw err;
            }
        }
    }

    return operationResult;
}
