import { NotificationModel } from "../../models/index"

class NotificationQueries {

    public notificationModel: any = NotificationModel;

    public async create(obj: any) {
        try {
            await this.notificationModel.create(obj)
        } catch (err: any) {
            console.error("Error in NotificationQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.notificationModel.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in NotificationQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.notificationModel.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in NotificationQueries findOne 🔥 ~ ~", err.message)
        }
    }

    public async count(whereClause: any) {
        try {
            let data: any = await this.notificationModel.count({ where: whereClause })
            return data;
        } catch (err: any) {
            console.error("Error in NotificationQueries count 🔥 ~ ~", err.message)
        }
    }
}
const notificationQueries = new NotificationQueries();
export default notificationQueries;