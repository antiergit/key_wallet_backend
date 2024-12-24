import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellyOnOffRampOrdersQueries {

    public changellyOnOffRampOrdersModal: any = Models.ChangellyOnOffRampOrdersModel;


    public async changellyOnOffRampOrdersCreate(obj: any) {
        try {
            let data: any = await this.changellyOnOffRampOrdersModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyOnOffRampOrdersCreate>>", err)
            await commonHelper.save_error_logs("changellyOnOffRampOrdersCreate", err.message);
            return null;
        }
    }
    public async changellyOnOffRampOrdersUpdate(set: any, where: any) {
        try {
            await this.changellyOnOffRampOrdersModal.update(set, { where: where })
        } catch (err: any) {
            console.error("Error in changellyOnOffRampOrdersUpdate>>", err)
            await commonHelper.save_error_logs("changellyOnOffRampOrdersUpdate", err.message);
            return null;
        }
    }
    public async changellyOnOffRampOrdersFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellyOnOffRampOrdersModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyOnOffRampOrdersFindOne>>", err)
            await commonHelper.save_error_logs("changellyOnOffRampOrdersFindOne", err.message);
            return null;
        }
    }
    public async changellyOnOffRampOrdersBulkCreate(obj: any) {
        try {
            let data: any = await this.changellyOnOffRampOrdersModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyOnOffRampOrdersBulkCreate>>", err)
            await commonHelper.save_error_logs("changellyOnOffRampOrdersBulkCreate", err.message);

            throw err;
        }
    }
    public async changellyOnOffRampOrdersFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellyOnOffRampOrdersModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyOnOffRampOrdersFindAll>>", err)
            await commonHelper.save_error_logs("changellyOnOffRampOrdersFindAll", err.message);
            return null;
        }
    }


}

const changellyOnOffRampOrdersQueries = new ChangellyOnOffRampOrdersQueries();
export default changellyOnOffRampOrdersQueries;
