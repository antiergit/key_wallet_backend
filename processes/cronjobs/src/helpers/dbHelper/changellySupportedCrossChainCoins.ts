import { ChangellySupportedCrossChainCoinsModel } from "../../models/model/index"

class ChangellyCrossChainCoinQueries {

    public changellyCrossChainCoins: any = ChangellySupportedCrossChainCoinsModel;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.changellyCrossChainCoins.ChangellySupportedCrossChainCoinsModelWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in ChangellyCrossChainCoinQueries update 🔥 ~ ~", err.message)
        }
    }

    public async findAndCountAll(attr: any, whereClause: any, order: any, limit: any, offset: any) {
        try {
            let data: any = await this.changellyCrossChainCoins.ChangellySupportedCrossChainCoinsModelRead.findAndCountAll({
                attributes: attr,
                where: whereClause,
                order: order,
                limit: limit,
                offset: offset
            })
            return data;
        } catch (err: any) {
            console.error("Error in ChangellyCrossChainCoinQueries findAndCountAll 🔥 ~ ~", err.message)
        }
    }

    public async findOne(attr: any, whereClause: any) {
        try {
            let data: any = await this.changellyCrossChainCoins.ChangellySupportedCrossChainCoinsModelRead.findOne({
                attributes: attr,
                where: whereClause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in ChangellyCrossChainCoinQueries findOne 🔥 ~ ~", err.message)
        }
    }

    public async create(obj: any) {
        try {
            await this.changellyCrossChainCoins.ChangellySupportedCrossChainCoinsModelWrite.create(obj)
        } catch (err: any) {
            console.error("Error in update in ChangellyCrossChainCoinQueries create 🔥 ~ ~", err.message)
        }
    }
    public async bulkCreate(obj: any) {
        try {
            await this.changellyCrossChainCoins.ChangellySupportedCrossChainCoinsModelWrite.bulkCreate(
                obj,
                {returning: true}
                )
        } catch (err: any) {
            console.error("Error in update in ChangellyCrossChainCoinQueries bulkCreate 🔥 ~ ~", err.message)
        }
    }

}
const changellyCrossChainCoinQueries = new ChangellyCrossChainCoinQueries();
export default changellyCrossChainCoinQueries;