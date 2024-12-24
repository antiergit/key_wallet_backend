import { DeviceTokenModel } from "../../models/index"

class DeviceTokenQueries {

    public deviceTokenModel: any = DeviceTokenModel;

    public async create(obj: any) {
        try {
            await this.deviceTokenModel.create(obj)
        } catch (err: any) {
            console.error("Error in DeviceTokenQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.deviceTokenModel.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in DeviceTokenQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.deviceTokenModel.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in DeviceTokenQueries findOne 🔥 ~ ~", err.message)
        }
    }
    public async findAll(attr: any, where: any, order: any) {
        try {
            let data: any = await this.deviceTokenModel.findAll({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in DeviceTokenQueries findAll 🔥 ~ ~", err.message)
        }
    }
}
const deviceTokenQueries = new DeviceTokenQueries();
export default deviceTokenQueries;