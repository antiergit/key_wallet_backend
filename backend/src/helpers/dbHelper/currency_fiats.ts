import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class CurrencyFiatQueries {

    public async currency_fiat_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CurrencyFiatModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in currency_fiat_find_one>>", err)
            await commonHelper.save_error_logs("currency_fiat_find_one", err.message);
            throw err;
        }
    }
    public async currency_fiat_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.CurrencyFiatModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in currency_fiat_update>>", err)
            await commonHelper.save_error_logs("currency_fiat_update", err.message);
            throw err;
        }
    }
    public async currency_fiat_create(obj: any) {
        try {
            let data: any = await Models.CurrencyFiatModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in currency_fiat_create>>", err)
            await commonHelper.save_error_logs("currency_fiat_create", err.message);
            throw err;
        }
    }
    public async currency_fiat_destroy(where_clause: any) {
        try {
            await Models.CurrencyFiatModel.destroy({ where: where_clause })
        } catch (err: any) {
            console.error("Error in currency_fiat_destroy>>", err)
            await commonHelper.save_error_logs("currency_fiat_destroy", err.message);
            throw err;
        }
    }
    public async currency_fiat_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CurrencyFiatModel.findAll({
                attributes: attr,
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in currency_fiat_find_all>>", err)
            await commonHelper.save_error_logs("currency_fiat_find_all", err.message);
            return null;
        }
    }

}

const currency_fiat_queries = new CurrencyFiatQueries();
export default currency_fiat_queries;
