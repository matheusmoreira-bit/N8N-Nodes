import {ILoadOptionsFunctions, INodePropertyOptions} from 'n8n-workflow';
import {DB} from '../../../src/db';
import {NodeErrors} from '../../../src/errors';
import {OnflyNodes} from '../../../src/OnflyNodes';
import {companyRepository} from '../../../src/db/repository/CompanyRepository';
import {extractWorkflowAndExecutionIdFromFunctions} from '../../../src/helpers';

export async function getCompanies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const returnData: INodePropertyOptions[] = [];
    try {
        await DB.getConnection();
        const companies = await companyRepository.orderByName();
        for (const company of companies) {
            returnData.push({
                name: company.name,
                value: company.id,
            });
        }
    } catch (err: unknown) {
        await NodeErrors.process({...extractWorkflowAndExecutionIdFromFunctions(this), node: OnflyNodes.SAP_B1, message: err});
    }
    return returnData;
}
