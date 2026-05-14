import {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';

import { PagCorpApi } from '../../../transport/PagCorpApi';

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toApiDate(value: string | undefined, fallback: () => Date): string {
    if (!value) {
        return formatDate(fallback());
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return formatDate(fallback());
    }

    return formatDate(parsedDate);
}

export async function getByAccount(
    this: IExecuteFunctions,
    api: PagCorpApi,
    itemIndex: number,
): Promise<INodeExecutionData[]> {
    const accountId = this.getNodeParameter('accountId', itemIndex) as string;
    const startDateValue = this.getNodeParameter('startDate', itemIndex, '') as string;
    const endDateValue = this.getNodeParameter('endDate', itemIndex, '') as string;
    const splitItems = this.getNodeParameter('splitItems', itemIndex, true) as boolean;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const startDate = toApiDate(startDateValue, () => firstDayOfMonth);
    const endDate = toApiDate(endDateValue, () => today);

    const expenses = await api.getExpensesByAccount({
        accountId,
        startDate,
        endDate,
    });

    if (splitItems) {
        return this.helpers.returnJsonArray(expenses.items);
    }

    const payload: IDataObject = {
        accountId,
        startDate,
        endDate,
        pagesFetched: expenses.pagesFetched,
        items: expenses.items,
        totalItems: expenses.items.length,
    };

    return this.helpers.returnJsonArray([payload]);
}
