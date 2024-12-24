import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class DeviceTokensQueries {

    public async device_token_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.DeviceTokenModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in device_token_find_one>>", err)
            await commonHelper.save_error_logs("device_token_find_one", err.message);
            throw err;
        }
    }
    public async device_token_find_all(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await Models.DeviceTokenModel.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in device_token_find_all >>", err)
            await commonHelper.save_error_logs("device_token_find_all", err.message);
            throw err;
        }
    }
    public async device_token_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.DeviceTokenModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in device_token_update>>", err)
            await commonHelper.save_error_logs("device_token_update", err.message);
            throw err;
        }
    }
    public async device_token_create(obj: any) {
        try {
            let data: any = await Models.DeviceTokenModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in device_token_create>>", err)
            await commonHelper.save_error_logs("device_token_create", err.message);
            throw err;
        }
    }
    public async device_token_destroy(where_clause: any) {
        try {
            await Models.DeviceTokenModel.destroy({ where: where_clause })
        } catch (err: any) {
            console.error("Error in device_token_destroy>>", err)
            await commonHelper.save_error_logs("device_token_destroy", err.message);
            throw err;
        }
    }

}

const device_token_queries = new DeviceTokensQueries();
export default device_token_queries;
