import { DeviceTokenModel, MakerWalletsModel, UsersModel } from "../../models/model/index"

class UserQueries {

    public userModel: any = UsersModel;

    public async userJoinDeviceTokenJoinMAkerWallets(attr1: any, where1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let data: any = await this.userModel.UsersModelRead.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: DeviceTokenModel.DeviceTokenModelRead,
                    attributes: attr2,
                    where: where2,
                    as: 'user_device_token_data',
                    required: false,
                    limit: 10,
                    order: [['updated_at', 'DESC']]
                }, {
                    model: MakerWalletsModel.MakerWalletsRead,
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