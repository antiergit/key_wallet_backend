import { CurrencyFiat } from "../../models/model/index"

class CurrencyQueries {

    public currencyFiats: any = CurrencyFiat;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.currencyFiats.CurrencyFiatWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in CurrencyQueries update 🔥 ~ ~", err.message)
        }
    }

    public async findAndCountAll(attr: any, whereClause: any, order: any, limit: any, offset: any) {
        try {
            let data: any = await this.currencyFiats.CurrencyFiatRead.findAndCountAll({
                attributes: attr,
                where: whereClause,
                order: order,
                limit: limit,
                offset: offset
            })
            return data;
        } catch (err: any) {
            console.error("Error in CurrencyQueries findAndCountAll 🔥 ~ ~", err.message)
        }
    }

}
const currencyQueries = new CurrencyQueries();
export default currencyQueries;