import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellySupportedOnOffRampsQueries {

    public changellySupportedOnOffRampsModal: any = Models.ChangellySupportedOnOffRampsModel;


    public async changellySupportedOnOffRampsCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedOnOffRampsModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedOnOffRampsCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedOnOffRampsCreate", err.message);
            return null;
        }
    }
    public async changellySupportedOnOffRampsFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedOnOffRampsModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedOnOffRampsFindOne>>", err)
            await commonHelper.save_error_logs("changellySupportedOnOffRampsFindOne", err.message);
            return null;
        }
    }
    public async changellySupportedOnOffRampsBulkCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedOnOffRampsModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedOnOffRampsBulkCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedOnOffRampsBulkCreate", err.message);

            throw err;
        }
    }
    public async changellySupportedOnOffRampsFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellySupportedOnOffRampsModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedOnOffRampsFindAll>>", err)
            await commonHelper.save_error_logs("changellySupportedOnOffRampsFindAll", err.message);
            return null;
        }
    }


}

const changellySupportedOnOffRampsQueries = new ChangellySupportedOnOffRampsQueries();
export default changellySupportedOnOffRampsQueries;
