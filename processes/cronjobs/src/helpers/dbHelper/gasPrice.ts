import { GasPrice } from "../../models/model/index"

class GasPriceQueries {

    public gasPrice: any = GasPrice;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.gasPrice.GasPriceWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in gasPriceQueries 🔥 ~ ~", err)
        }
    }

}
const gasPriceQueries = new GasPriceQueries();
export default gasPriceQueries;