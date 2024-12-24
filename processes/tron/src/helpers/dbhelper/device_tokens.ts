import { DeviceTokenModel } from "../../models/model";

class DeviceTokenQueries {

    public device_tokens: any = DeviceTokenModel;

    public async device_tokens_create(obj: any) {
        try {
            let data: any = await this.device_tokens.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in device_tokens_create>>", err)
            throw err;
        }
    }
    public async device_tokens_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await this.device_tokens.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in device_tokens_find_one>>", err)
            throw err;
        }
    }
    public async device_tokens_find_all(where_clause: any) {
        try {
            let data: any = await this.device_tokens.findAll({
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in device_tokens_find_all>>", err)
            throw err;
        }
    }
    public async device_tokens_update(set: any, where_clause: any) {
        try {
            let data: any = await this.device_tokens.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in device_tokens_update>>", err)
            throw err;
        }
    }
    public async device_tokens_with_limit(attr: any, where_clause: any, order: any, limit: number) {
        try {
            let data: any = await this.device_tokens.findAll({
                attributes: attr,
                where: where_clause,
                order: order,
                limit: limit,
                raw: true

            })
            return data;
        } catch (err: any) {
            console.error(`Error in device_tokens_with_limit>>>`, err);
            return false;
        }
    }

}

const device_token_queries = new DeviceTokenQueries();
export default device_token_queries;
