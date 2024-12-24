import { NotificationModel } from "../../models/model/index"

class NotificationQueries {

    public notificationModel: any = NotificationModel;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.notificationModel.NotificationModelWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in NotificationQueries update 🔥 ~ ~", err.message)
        }
    }

    public async findAndCountAll(attr: any, whereClause: any, order: any, limit: any, offset: any) {
        try {
            let data: any = await this.notificationModel.NotificationModelRead.findAndCountAll({
                attributes: attr,
                where: whereClause,
                order: order,
                limit: limit,
                offset: offset
            })
            return data;
        } catch (err: any) {
            console.error("Error in NotificationQueries findAndCountAll 🔥 ~ ~", err.message)
        }
    }

    public async findOne(attr: any, whereClause: any) {
        try {
            let data: any = await this.notificationModel.NotificationModelRead.findOne({
                attributes: attr,
                where: whereClause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in NotificationQueries findOne 🔥 ~ ~", err.message)
        }
    }

    public async create(obj: any) {
        try {
            await this.notificationModel.NotificationModelWrite.create(obj)
        } catch (err: any) {
            console.error("Error in update in NotificationQueries create 🔥 ~ ~", err.message)
        }
    }

}
const notificationQueries = new NotificationQueries();
export default notificationQueries;