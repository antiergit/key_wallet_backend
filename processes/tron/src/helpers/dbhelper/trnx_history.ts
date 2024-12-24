import { TrnxHistoryModel } from "../../models/model";

class TrnxHistoryQueries {

    public trnx_history: any = TrnxHistoryModel;

    public async trnx_history_create(obj: any) {
        try {
            let data: any = await this.trnx_history.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in trnx_history_create>>", err)
            throw err;
        }
    }
    public async trnx_history_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await this.trnx_history.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in trnx_history_find_one>>", err)
            throw err;
        }
    }
    public async trnx_history_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await this.trnx_history.findAll({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in trnx_history_find_all>>", err)
            throw err;
        }
    }
    public async trnx_history_update(set: any, where_clause: any) {
        try {
            let data: any = await this.trnx_history.update( set , { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in trnx_history_update>>", err)
            throw err;
        }
    }

}

const trnx_history_queries = new TrnxHistoryQueries();
export default trnx_history_queries;
