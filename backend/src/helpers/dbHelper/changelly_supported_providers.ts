import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellySupportedProvidersQueries {

    public changellySupportedProvidersModal: any = Models.ChangellySupportedProvidersModel;


    public async changellySupportedProvidersCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedProvidersModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedProvidersCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedProvidersCreate", err.message);
            return null;
        }
    }
    public async changellySupportedProvidersFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedProvidersModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedProvidersFindOne>>", err)
            await commonHelper.save_error_logs("changellySupportedProvidersFindOne", err.message);
            return null;
        }
    }
    public async changellySupportedProvidersBulkCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedProvidersModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedProvidersBulkCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedProvidersBulkCreate", err.message);

            throw err;
        }
    }
    public async changellySupportedProvidersFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellySupportedProvidersModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedProvidersFindAll>>", err)
            await commonHelper.save_error_logs("changellySupportedProvidersFindAll", err.message);
            return null;
        }
    }


}

const changellySupportedProvidersQueries = new ChangellySupportedProvidersQueries();
export default changellySupportedProvidersQueries;
