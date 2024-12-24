import { CoinsModel } from "../../models/model";

class CoinQueries {

    public coins: any = CoinsModel;

    public async coins_create(obj: any) {
        try {
            let data: any = await this.coins.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in coins_create>>", err)
            throw err;
        }
    }
    public async coins_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await this.coins.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in coins_find_one>>", err)
            throw err;
        }
    }
    public async coins_find_all(where_clause: any) {
        try {
            let data: any = await this.coins.findAll({
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in coins_find_all>>", err)
            throw err;
        }
    }
    public async coins_update(set: any, where_clause: any) {
        try {
            let data: any = await this.coins.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in coins_update>>", err)
            throw err;
        }
    }

}

const coin_queries = new CoinQueries();
export default coin_queries;
