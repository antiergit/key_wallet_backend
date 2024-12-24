import { CoinsModel } from "../../models/index"

class CoinQueries {

    public coin: any = CoinsModel;

    public async create(obj: any) {
        try {
            await this.coin.create(obj)
        } catch (err: any) {
            console.error("Error in CoinQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.coin.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in CoinQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.coin.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in CoinQueries findOne 🔥 ~ ~", err.message)
        }
    }
    public async findAll(attr: any, where: any, order: any) {
        try {
            let data: any = await this.coin.findAll({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in CoinQueries findAll 🔥 ~ ~", err.message)
        }
    }
}
const coinQueries = new CoinQueries();
export default coinQueries;