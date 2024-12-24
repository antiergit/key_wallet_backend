import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellySupportedCrossChainCoinQueries {

    public changellySupportedCrossChainCoinModal: any = Models.ChangellySupportedCrossChainCoinsModel;


    public async changellySupportedCrossChainCoinsCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedCrossChainCoinModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoinsCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedCrossChainCoinsCreate", err.message);
            return null;
        }
    }
    public async changellySupportedCrossChainCoinsFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedCrossChainCoinModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoinsFindOne>>", err)
            await commonHelper.save_error_logs("changellySupportedCrossChainCoinsFindOne", err.message);
            return null;
        }
    }
    public async changellySupportedCrossChainCoinsBulkCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedCrossChainCoinModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoinsBulkCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedCrossChainCoinsBulkCreate", err.message);

            throw err;
        }
    }
    public async changellySupportedCrossChainCoinsFindAll(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedCrossChainCoinModal.findAll({
                attributes: attr,
                where: where_clause,
                order: [['name', 'ASC']]
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoinsFindAll>>", err)
            await commonHelper.save_error_logs("changellySupportedCrossChainCoinsFindAll", err.message);
            return null;
        }
    }
    public async changellySupportedCrossChainCoinsUpdate(set: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedCrossChainCoinModal.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoinsUpdate>>", err)
            await commonHelper.save_error_logs("changellySupportedCrossChainCoinsUpdate", err.message);
            throw err;
        }
    }

}

const changellySupportedCrossChainCoinQueries = new ChangellySupportedCrossChainCoinQueries();
export default changellySupportedCrossChainCoinQueries;
