import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class SwapSettingQueries {

    public async swapSettingsFindOne(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await Models.SwapSettingsModel.findOne({
                attributes: attr,
                where: where_clause,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in swapSettingsFindOne>>", err)
            await commonHelper.save_error_logs("swapSettingsFindOne", err.message);
            throw err;
        }
    }

    public async swapSettingsUpdate(set: any, where_clause: any) {
        try {
            let data: any = await Models.SwapSettingsModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in swapSettingsUpdate>>", err)
            await commonHelper.save_error_logs("swapSettingsUpdate", err.message);
            throw err;
        }
    }
}

const swapSettingQueries = new SwapSettingQueries();
export default swapSettingQueries;
