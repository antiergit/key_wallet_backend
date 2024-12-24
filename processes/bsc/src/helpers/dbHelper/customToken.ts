import { CustomTokenModel } from "../../models/index"

class CustomTokenQueries {

    public customTokenModel: any = CustomTokenModel;

    public async create(obj: any) {
        try {
            await this.customTokenModel.create(obj)
        } catch (err: any) {
            console.error("Error in CustomTokenQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.customTokenModel.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in CustomTokenQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.customTokenModel.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in CustomTokenQueries findOne 🔥 ~ ~", err.message)
        }
    }
}
const customTokenQueries = new CustomTokenQueries();
export default customTokenQueries;