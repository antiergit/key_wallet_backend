import { CoinsModel, WalletModel } from "../../models/model";

class WalletQueries {

    public wallet: any = WalletModel;
    public coin: any = CoinsModel;

    public async wallet_create(obj: any) {
        try {
            let data: any = await this.wallet.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            throw err;
        }
    }
    public async wallet_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await this.wallet.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_find_one>>", err)
            throw err;
        }
    }
    public async wallet_find_all(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await this.wallet.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_find_all>>", err)
            throw err;
        }
    }
    public async wallet_update(set: any, where_clause: any) {
        try {
            let data: any = await this.wallet.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_update>>", err)
            throw err;
        }
    }
    public async wallet_with_coins_joint(attr1: any, where_clause1: any, attr2: any, order: any) {
        try {
            let data: any = await this.wallet.findAll({
                attributes: attr1,
                where: where_clause1,
                include: [{
                    model: this.coin,
                    attributes: attr2,
                    as: "coin_data",
                    required: true
                }],
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_with_coins_joint>>", err)
            throw err;
        }
    }

}

const wallet_queries = new WalletQueries();
export default wallet_queries;
