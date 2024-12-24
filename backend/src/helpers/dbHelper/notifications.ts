import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';
import { Op } from "sequelize";


class NotificationQueries {

    public async notification_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.NotificationModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in notification_find_one>>", err)
            await commonHelper.save_error_logs("notification_find_one", err.message);
            throw err;
        }
    }
    public async notification_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.NotificationModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in notification_update>>", err)
            await commonHelper.save_error_logs("notification_update", err.message);
            throw err;
        }
    }
    public async notification_create(obj: any) {
        try {
            let data: any = await Models.NotificationModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in notification_create>>", err)
            await commonHelper.save_error_logs("notification_create", err.message);
            throw err;
        }
    }

    // Joints
    public async notifications_joint_find_all_count_all(attr1: any, attr2: any, attr3: any, where1: any, where2: any, per_page: number, offset: number) {
        try {
            let data: any = await Models.NotificationModel.findAndCountAll({
                attributes: attr1,
                include: [{
                    model: Models.CoinsModel,
                    attributes: attr2,
                    as: "coin_data",
                    where: where1,
                    required: true
                }, {
                    model: Models.CurrencyFiatModel,
                    attributes: attr3,
                    as: "currency_data",
                    required: false
                }],
                where: where2,
                limit: per_page,
                offset: offset,
                order: [['created_at', 'DESC']],
            });
            return data;
        } catch (err: any) {
            console.error("Error in notifications_joint_find_all_count_all>>", err)
            await commonHelper.save_error_logs("notifications_joint_find_all_count_all", err.message);
            throw err;
        }
    }

}

const notification_queries = new NotificationQueries();
export default notification_queries;
