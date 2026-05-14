"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByAccount = getByAccount;
function formatDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function toApiDate(value, fallback) {
    if (!value) {
        return formatDate(fallback());
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return formatDate(fallback());
    }
    return formatDate(parsedDate);
}
async function getByAccount(api, itemIndex) {
    const accountId = this.getNodeParameter('accountId', itemIndex);
    const startDateValue = this.getNodeParameter('startDate', itemIndex, '');
    const endDateValue = this.getNodeParameter('endDate', itemIndex, '');
    const splitItems = this.getNodeParameter('splitItems', itemIndex, true);
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
    const payload = {
        accountId,
        startDate,
        endDate,
        pagesFetched: expenses.pagesFetched,
        items: expenses.items,
        totalItems: expenses.items.length,
    };
    return this.helpers.returnJsonArray([payload]);
}
