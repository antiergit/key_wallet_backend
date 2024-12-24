import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class UserQueries {

    public async user_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.UsersModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in user_find_one>>", err)
            await commonHelper.save_error_logs("user_find_one", err.message);
            throw err;
        }
    }
    public async user_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.UsersModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in user_update>>", err)
            await commonHelper.save_error_logs("user_update", err.message);
            throw err;
        }
    }
    public async user_create(obj: any) {
        try {
            let data: any = await Models.UsersModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in user_create>>", err)
            await commonHelper.save_error_logs("user_create", err.message);
            throw err;
        }
    }
    public async user_find_all(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await Models.UsersModel.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in user_find_all>>", err)
            await commonHelper.save_error_logs("user_find_all", err.message);
            throw err;
        }
    }
    public async usersJoinWalletsJoinCoins(attr1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let data: any = await Models.UsersModel.findAll({
                attributes: attr1,
                include: [{
                    model: Models.WalletModel,
                    attributes: attr2,
                    where: where2,
                    as: 'user_wallet_relation',
                    required: true,
                    include: [{
                        model: Models.CoinsModel,
                        attributes: attr3,
                        where: where3,
                        required: true,
                    }]
                }],
                order: [['user_id', 'DESC']]
            })
            return data;
        } catch (err: any) {
            console.error("Error in usersJoinWalletsJoinCoins>>", err)
            await commonHelper.save_error_logs("usersJoinWalletsJoinCoins", err.message);
            throw err;
        }
    }

    public async usersJoinWallets(attr1: any, attr2: any, where2: any) {
        try {
            let data: any = await Models.UsersModel.findOne({
                attributes: attr1,
                include: [{
                    model: Models.WalletModel,
                    attributes: attr2,
                    where: where2,
                    as: 'user_wallet_rel',
                    required: true,
                }],
                order: [['user_id', 'DESC']],
                logging: console.log
            })
            return data;
        } catch (err: any) {
            console.error("Error in usersJoinWallets>>", err)
            await commonHelper.save_error_logs("usersJoinWallets", err.message);
            throw err;
        }
    }

    public async usersJoinWalletsJoinCoinsToGetFiat(attr1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let data: any = await Models.UsersModel.findAll({
                attributes: attr1,
                include: [{
                    model: Models.WalletModel,
                    attributes: attr2,
                    where: where2,
                    as: 'user_wallet_relation',
                    required: true,
                    include: [{
                        model: Models.CoinsModel,
                        attributes: attr3,
                        where: where3,
                        required: true,
                        include: [{
                            model: Models.CoinPriceInFiatModel,
                            attributes: ["value"],
                            as: "fiat_price_data"
                        }]
                    }]
                }],
            })
            return data;
        } catch (err: any) {
            console.error("Error in usersJoinWalletsJoinCoins>>", err)
            await commonHelper.save_error_logs("usersJoinWalletsJoinCoins", err.message);
            throw err;
        }
    }

}

const user_queries = new UserQueries();
export default user_queries;
