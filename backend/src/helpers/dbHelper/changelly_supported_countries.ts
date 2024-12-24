import { Sequelize } from 'sequelize';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class ChangellySupportedCountriesQueries {

    public changellySupportedCountriesModal: any = Models.ChangellySupportedCountriesModel;


    public async changellySupportedCountriesCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedCountriesModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCountriesCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedCountriesCreate", err.message);
            return null;
        }
    }
    public async changellySupportedCountriesFindOne(attr: any, where_clause: any) {
        try {
            let data: any = await this.changellySupportedCountriesModal.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCountriesFindOne>>", err)
            await commonHelper.save_error_logs("changellySupportedCountriesFindOne", err.message);
            return null;
        }
    }
    public async changellySupportedCountriesBulkCreate(obj: any) {
        try {
            let data: any = await this.changellySupportedCountriesModal.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCountriesBulkCreate>>", err)
            await commonHelper.save_error_logs("changellySupportedCountriesBulkCreate", err.message);

            throw err;
        }
    }
    public async changellySupportedCountriesFindAll(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.changellySupportedCountriesModal.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in changellySupportedCountriesFindAll>>", err)
            await commonHelper.save_error_logs("changellySupportedCountriesFindAll", err.message);
            return null;
        }
    }


}

const changellySupportedCountriesQueries = new ChangellySupportedCountriesQueries();
export default changellySupportedCountriesQueries;
