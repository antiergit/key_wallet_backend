import { CoinPriceInFiat, Coins } from "../../models/model/index"

class CoinPriceInFiatQueries {

    public coinPriceInFiat: any = CoinPriceInFiat;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.coinPriceInFiat.CoinPriceInFiatWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in CoinPriceInFiatQueries update 🔥 ~ ~", err.message)
        }
    }

    public async findAndCountAll(attr: any, whereClause: any, order: any, limit: any, offset: any) {
        try {
            let data: any = await this.coinPriceInFiat.CoinPriceInFiatRead.findAndCountAll({
                attributes: attr,
                where: whereClause,
                order: order,
                limit: limit,
                offset: offset
            })
            return data;
        } catch (err: any) {
            console.error("Error in CoinPriceInFiatQueries findAndCountAll 🔥 ~ ~", err.message)
        }
    }

    public async findOne(attr: any, whereClause: any) {
        try {
            let data: any = await this.coinPriceInFiat.CoinPriceInFiatRead.findOne({
                attributes: attr,
                where: whereClause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in CoinPriceInFiatQueries findOne 🔥 ~ ~", err.message)
        }
    }

    public async create(obj: any) {
        try {
            await this.coinPriceInFiat.CoinPriceInFiatWrite.create(obj)
        } catch (err: any) {
            console.error("Error in update in CoinPriceInFiatQueries create 🔥 ~ ~", err.message)
        }
    }

}
const coinPriceInFiatQueries = new CoinPriceInFiatQueries();
export default coinPriceInFiatQueries;