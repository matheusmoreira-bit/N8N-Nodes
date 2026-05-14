import {IExecuteFunctions, INodeExecutionData} from 'n8n-workflow';

import {ERPSAPB1Api} from '../../../transport/ERPSAPB1Api';
import {BlueTransactionReporter} from '../../../../../src/reports/BlueTransactionReporter';
import {OnflyNodes} from '../../../../../src/OnflyNodes';
import {extractDateFromDateTime, getDateInFutureDays} from '../../../../../src/date';
import {ICreatedJournalEntry, IDynamicFieldValue, ILineEntries} from '../../../transport/Interfaces';
import {ERPSAPB1Parser} from '../../../transport/ERPSAPB1Parser';
import {ProcessError} from '../../../../../src/db/entity/ProcessError';

export async function transaction(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const companyId = this.getNodeParameter('companyId', 0) as number;

    const reporter = new BlueTransactionReporter<ICreatedJournalEntry>(OnflyNodes.SAP_B1, this, companyId);

    reporter.onflyIdExtractor = (index: number) => this.getNodeParameter('transactionId', index) as number;

    reporter.outputProvider = async (index: number) => {
        const transactionId = this.getNodeParameter('transactionId', index) as number,
            bplId = this.getNodeParameter('bplId', index, null) as number,
            referenceDateTime = new Date(this.getNodeParameter('referenceDate', index) as string),
            referenceDate = extractDateFromDateTime(referenceDateTime),
            dueDate = getDateInFutureDays(referenceDateTime, this.getNodeParameter('dueDays', index) as number),
            journalMemo = this.getNodeParameter('journalMemo', index) as string,
            lineEntries = this.getNodeParameter('lineEntries', index, {}) as ILineEntries,
            {dynamicFields} = this.getNodeParameter('dynamicFields', index) as Partial<IDynamicFieldValue>;

        const template = ERPSAPB1Parser.getJournalEntryTemplate(bplId, {ReferenceDate: referenceDate, DueDate: dueDate, TaxDate: dueDate, Memo: journalMemo}, lineEntries);

        if (dynamicFields) {
            ERPSAPB1Parser.setDynamicFields(template, dynamicFields);
        }

        const journalEntry = await api.createJournalEntry(template);

        if (journalEntry instanceof ProcessError) {
            return journalEntry;
        }

        journalEntry.onflyId = transactionId;

        return journalEntry;
    };

    const report = await reporter.getReport('ExternalId', {'Identificador Onfly': 'onflyId', 'Data': 'ReferenceDate', 'LC SAP': 'Number', 'Texto': 'Memo'});

    return this.helpers.returnJsonArray(report);
}
