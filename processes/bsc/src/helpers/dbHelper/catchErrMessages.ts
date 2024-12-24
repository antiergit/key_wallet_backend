import { CatchErrorMsgsModel } from "../../models/index"

class CatchErrMsgQueries {

    public catchErrMsgBlock: any = CatchErrorMsgsModel;

    public async create(obj: any) {
        try {
            await this.catchErrMsgBlock.create(obj)
        } catch (err: any) {
            console.error("Error in CatchErrMsgQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.catchErrMsgBlock.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in CatchErrMsgQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.catchErrMsgBlock.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in CatchErrMsgQueries findOne 🔥 ~ ~", err.message)
        }
    }
}
const catchErrMsgQueries = new CatchErrMsgQueries();
export default catchErrMsgQueries;