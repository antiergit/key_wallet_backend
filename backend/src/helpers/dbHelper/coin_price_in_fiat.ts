import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';

class CoinPriceInFiatQueries {

    public async coin_price_in_fiat_create(obj: any) {
        try {
            let data: any = await Models.CoinPriceInFiatModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in coin_price_in_fiat_create>>", err)
            await commonHelper.save_error_logs("coin_price_in_fiat_create", err.message);
            return null;
        }
    }
    public async coin_price_in_fiat_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CoinPriceInFiatModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in coin_price_in_fiat_find_one>>", err)
            await commonHelper.save_error_logs("coin_price_in_fiat_find_one", err.message);
            return null;
        }
    }
    public async coinPriceInFiatFindAll(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CoinPriceInFiatModel.findAll({
                attributes: attr,
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in coinPriceInFiatFindAll>>", err)
            await commonHelper.save_error_logs("coinPriceInFiatFindAll", err.message);
            return null;
        }
    }
    public async coin_price_in_fiat_bulk_create(obj: any) {
        try {
            let data: any = await Models.CoinPriceInFiatModel.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in coin_price_in_fiat_bulk_create>>", err)
            await commonHelper.save_error_logs("coin_price_in_fiat_bulk_create", err.message);

            throw err;
        }
    }

}

const coin_price_in_fiat_queries = new CoinPriceInFiatQueries();
export default coin_price_in_fiat_queries;
