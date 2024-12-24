import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellyDetailsQueries {

    public changellyDetailsModal: any = Models.ChangellyDetailsModel;


    public async changellyDetailsCreate(obj: any) {
        try {
            let data: any = await this.changellyDetailsModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyDetailsCreate>>", err)
            await commonHelper.save_error_logs("changellyDetailsCreate", err.message);
            return null;
        }
    }
    public async changellyDetailsFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellyDetailsModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyDetailsFindOne>>", err)
            await commonHelper.save_error_logs("changellyDetailsFindOne", err.message);
            return null;
        }
    }
    public async changellyDetailsBulkCreate(obj: any) {
        try {
            let data: any = await this.changellyDetailsModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyDetailsBulkCreate>>", err)
            await commonHelper.save_error_logs("changellyDetailsBulkCreate", err.message);

            throw err;
        }
    }
    public async changellyDetailsFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellyDetailsModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyDetailsFindAll>>", err)
            await commonHelper.save_error_logs("changellyDetailsFindAll", err.message);
            return null;
        }
    }


}

const changellyDetailsQueries = new ChangellyDetailsQueries();
export default changellyDetailsQueries;
