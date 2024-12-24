import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellyWebhooksQueries {

    public changellyWebhooksModal: any = Models.ChangellyWebhooksModel;


    public async changellyWebhooksCreate(obj: any) {
        try {
            let data: any = await this.changellyWebhooksModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyWebhooksCreate>>", err)
            await commonHelper.save_error_logs("changellyWebhooksCreate", err.message);
            return null;
        }
    }
    public async changellyWebhooksFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellyWebhooksModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyWebhooksFindOne>>", err)
            await commonHelper.save_error_logs("changellyWebhooksFindOne", err.message);
            return null;
        }
    }
    public async changellyWebhooksBulkCreate(obj: any) {
        try {
            let data: any = await this.changellyWebhooksModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellyWebhooksBulkCreate>>", err)
            await commonHelper.save_error_logs("changellyWebhooksBulkCreate", err.message);

            throw err;
        }
    }
    public async changellyWebhooksFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellyWebhooksModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellyWebhooksFindAll>>", err)
            await commonHelper.save_error_logs("changellyWebhooksFindAll", err.message);
            return null;
        }
    }


}

const changellyWebhooksQueries = new ChangellyWebhooksQueries();
export default changellyWebhooksQueries;
