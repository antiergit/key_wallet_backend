import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class GasPricesQueries {

    public async gas_prices_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.GasPriceModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in gas_prices_find_one>>", err)
            await commonHelper.save_error_logs("gas_prices_find_one", err.message);
            throw err;
        }
    }

}

const gas_prices_queries = new GasPricesQueries();
export default gas_prices_queries;
