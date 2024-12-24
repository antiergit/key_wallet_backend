import { TrnxHistoryModel } from "../../models/model/index";

class TrnxHistoryQueries {

    public trnxHistory: any = TrnxHistoryModel;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.trnxHistory.TrnxHistoryWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in TrnxHistoryQueries 🔥 ~ ~", err)
        }
    }

    public async destroy(whereClause: any) {
        try {
            console.log("destroy in TrnxHistoryQueries where", whereClause)
            await this.trnxHistory.TrnxHistoryWrite.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in destroy in TrnxHistoryQueries 🔥 ~ ~", err)
        }
    }

    public async findAndCountAll(attributes: any, whereClause: any, order: any) {
        try {
            let data: any = await this.trnxHistory.TrnxHistoryRead.findAndCountAll({
                attributes: attributes,
                where: whereClause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in destroy in TrnxHistoryQueries 🔥 ~ ~", err)
        }
    }

    public async findOne(attributes: any, whereClause: any) {
        try {
            let data: any = await this.trnxHistory.TrnxHistoryRead.findOne({
                attributes: attributes,
                where: whereClause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in findOne in TrnxHistoryQueries 🔥 ~ ~", err)
        }
    }

    public async create(obj: any) {
        try {
            let data: any = await this.trnxHistory.TrnxHistoryWrite.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in create in TrnxHistoryQueries 🔥 ~ ~", err)
        }
    }

}
const trnxHistoryQueries = new TrnxHistoryQueries();
export default trnxHistoryQueries;