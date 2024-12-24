import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import { GlblBooleanEnum, GlblCode, GlblMessages } from "../../../constants/global_enum";
import { language } from "../../../constants";
import { adminErrQueries, coin_queries, user_queries, wallet_queries } from "../../../helpers/dbHelper";
import commonHelper from "../../../helpers/common/common.helpers";
import { Op } from "sequelize";


class UserController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }

    public async getUsersListByCoinFamily(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("Entered into getUsersListByCoinFamily")
            let coinFamily: number = req.body.coinFamily;
            let search: any =
                req.body.search == undefined
                    ? (req.body.search = "%%")
                    : (req.body.search = "%" + req.body.search + "%");
            let limit: number = Number(req.body.limit == undefined ? (req.body.limit = "25") : req.body.limit);
            let page: number = Number(req.body.page == undefined ? (req.body.page = "1") : req.body.page);
            let offset: number = (page - GlblBooleanEnum.true) * limit;

            console.log("search >>>", search)
            let usersListing: any = await user_queries.usersJoinWalletsJoinCoins(
                ['user_id', ['user_name', 'name']],
                ['wallet_address', 'wallet_name', 'balance', 'coin_id', 'coin_family'],
                { status: 1, coin_Family: coinFamily, wallet_address: { [Op.like]: search } },
                ['coin_id', 'coin_name', 'coin_symbol', 'coin_image'],
                { coin_status: 1 }
            )
            let totalCount: number = usersListing ? usersListing.length : 0;
            let totalBal: number = 0;

            let usersListingToGetFiat: any = await user_queries.usersJoinWalletsJoinCoinsToGetFiat(
                ['user_id', ['user_name', 'name']],
                ['wallet_address', 'wallet_name', 'balance', 'coin_id', 'coin_family'],
                { status: 1, coin_Family: coinFamily },
                ['coin_id', 'coin_name', 'coin_symbol', 'coin_image'],
                { coin_status: 1 }
            )

            for (let i: number = 0; i < usersListingToGetFiat.length; i++) {
                for (let j: number = 0; j < usersListingToGetFiat[i].user_wallet_relation.length; j++) {
                    if (usersListingToGetFiat[i].user_wallet_relation[j].coin.fiat_price_data) {
                        totalBal = totalBal + (usersListingToGetFiat[i].user_wallet_relation[j].coin.fiat_price_data.value * usersListingToGetFiat[i].user_wallet_relation[j].balance)
                    }
                }
            }
            usersListing = await commonHelper.implement_pagination(usersListing, limit, offset)

            let totalUsers: any = await wallet_queries.walletCount({ status: 1 })

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: {
                    users: usersListing,
                    meta: {
                        page: page,
                        pages: Math.ceil(totalCount / limit),
                        perPage: limit,
                        total: totalCount
                    },
                    total_user: totalUsers ? totalUsers.length : 0,
                    total_balance: totalBal

                }
            });
        } catch (err: any) {
            console.error("Error in getUsersListByCoinFamily API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "getUsersListByCoinFamily", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

}

export const userController = new UserController();
