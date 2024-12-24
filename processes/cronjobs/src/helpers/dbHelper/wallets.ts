import { Wallets } from "../../models/model/index"

class WalletQueries {

    public wallet: any = Wallets;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.wallet.WalletWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in WalletQueries update 🔥 ~ ~", err)
        }
    }

    public async findAndCountAll(attr: any, whereClause: any, order: any, limit: any, offset: any) {
        try {
            let data: any = await this.wallet.WalletRead.findAndCountAll({
                attributes: attr,
                where: whereClause,
                order: order,
                limit: limit,
                offset: offset
            })
            return data;
        } catch (err: any) {
            console.error("Error in WalletQueries findAndCountAll 🔥 ~ ~", err)
        }
    }
    public async findOne(attr: any, whereClause: any) {
        try {
            let data: any = await this.wallet.WalletRead.findOne({
                attributes: attr,
                where: whereClause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in WalletQueries findOne 🔥 ~ ~", err)
        }
    }
    public async create(obj: any) {
        try {
            await this.wallet.WalletWrite.create(obj)
        } catch (err: any) {
            console.error("Error in create in WalletQueries 🔥 ~ ~", err)
        }
    }

}
const walletQueries = new WalletQueries();
export default walletQueries;