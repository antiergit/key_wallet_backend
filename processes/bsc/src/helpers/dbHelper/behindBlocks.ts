import { BehindBlockModel } from "../../models/index"

class BehindBlockQueries {

    public behindBlock: any = BehindBlockModel;

    public async create(obj: any) {
        try {
            await this.behindBlock.create(obj)
        } catch (err: any) {
            console.error("Error in BehindBlockQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.behindBlock.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in BehindBlockQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.behindBlock.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in BehindBlockQueries findOne 🔥 ~ ~", err.message)
        }
    }
}
const behindBlockQueries = new BehindBlockQueries();
export default behindBlockQueries;