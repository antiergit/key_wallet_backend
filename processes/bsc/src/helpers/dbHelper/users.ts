import { DeviceTokenModel, MakerWalletsModel, UsersModel } from "../../models/index"

class UserQueries {

    public userModel: any = UsersModel;

    public async create(obj: any) {
        try {
            await this.userModel.create(obj)
        } catch (err: any) {
            console.error("Error in UserQueries create 🔥 ~ ~", err.message)
        }
    }
    public async destroy(whereClause: any) {
        try {
            await this.userModel.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in UserQueries destroy 🔥 ~ ~", err.message)
        }
    }
    public async findOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.userModel.findOne({
                attributes: attr,
                where: where,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in UserQueries findOne 🔥 ~ ~", err.message)
        }
    }
    public async userJoinDeviceTokenJoinMAkerWallets(attr1: any, where1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let data: any = await this.userModel.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: DeviceTokenModel,
                    attributes: attr2,
                    where: where2,
                    as: 'user_device_token_data',
                    required: false,
                    limit: 10,
                    order: [['updated_at', 'DESC']]
                }, {
                    model: MakerWalletsModel,
                    attributes: attr3,
                    where: where3,
                    as: 'user_maker_wallet_data',
                    required: false
                }]
            })
            return data;
        } catch (err: any) {
            console.error("Error in UserQueries userJoinDeviceTokenJoinMAkerWallets 🔥 ~ ~", err.message)
        }
    }
}
const userQueries = new UserQueries();
export default userQueries;