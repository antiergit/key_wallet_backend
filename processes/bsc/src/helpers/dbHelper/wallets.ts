import { CoinsModel, WalletModel } from "../../models/index"

class WalletQueries {

    public Wallet: any = WalletModel;

    public async create(obj: any) {
        try {
            await this.Wallet.create(obj)
        } catch (err: any) {
            console.error("Error in WalletQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.Wallet.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in WalletQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async update(setClause: any, whereClause: any) {
        try {
            await this.Wallet.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in WalletQueries update 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.Wallet.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in WalletQueries findOne 🔥 ~ ~", err.message)
        }
    }

    public async walletJoinCoins(attr1: any, where1: any, attr2: any, where2: any) {
        try {
            let data: any = await this.Wallet.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: CoinsModel,
                    attributes: attr2,
                    as: "coin_data",
                    where: where2,
                    required: true
                }]
            })
            return data;
        } catch (err: any) {
            console.error("Error in WalletQueries walletJoinCoins 🔥 ~ ~", err.message)
        }
    }
}
const walletQueries = new WalletQueries();
export default walletQueries;