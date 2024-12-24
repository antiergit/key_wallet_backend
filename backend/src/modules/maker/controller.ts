import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import { user_queries, wallet_queries } from "../../helpers/dbHelper";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import { makerHelper } from "./helper";
import * as Models from '../../models/model/index';
import jwtHelper from "../../helpers/common/jwt";
import { Op } from "sequelize";


class MakerController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }

    public async createAccount(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        const { walletAddress, checkerCode, walletName, deviceId, deviceToken, coinFamily }:
            { walletAddress: string, checkerCode: string, walletName: string, deviceId: string, deviceToken: string, coinFamily: number } = req.body;

        try {
            console.log("req body maker createAccount >>>", req.body)
            const checkCodeExist = await user_queries.usersJoinWallets(
                ['user_id', 'device_id'],
                ['wallet_id', 'wallet_address', 'wallet_name', 'coin_family'],
                { checker_code: checkerCode }
            );

            if (!checkCodeExist) {
                return response.error(res, { data: { message: language[lang].INVALID_CHECKER_CODE } });
            }

            const { user_wallet_rel: walletRel, user_id: userId, device_id: existingDeviceIds } = checkCodeExist;

            if (walletRel.coin_family !== coinFamily) {
                console.log("Invalid coin family >>> ", coinFamily, "db coin family >>", walletRel.coin_family)
                return response.error(res, { data: { message: language[lang].INVALID_WALLET_ADDRESS } });
            }

            if (walletRel.wallet_address.toUpperCase() !== walletAddress.toUpperCase()) {
                console.log("Invalid db walletRel.wallet_address.toUpperCase() >>> ", walletRel.wallet_address.toUpperCase(), " walletAddress.toUpperCase() >>", walletAddress.toUpperCase())

                return response.error(res, { data: { message: language[lang].INVALID_WALLET_ADDRESS } });
            }

            if (existingDeviceIds) {
                if (existingDeviceIds.includes(deviceId)) {
                    return response.error(res, { data: { message: language[lang].INVALID_DEVICE_ID } });
                }
            }

            let dataExist: any = await Models.MakerWalletsModel.findOne({
                attributes: ['id'],
                where: {
                    wallet_address: walletAddress,
                    coin_family: coinFamily,
                    device_id: deviceId,
                    user_id: userId,
                    status: 0
                },
                raw: true
            })
            if (dataExist) {
                return response.error(res, { data: { message: language[lang].REQUEST_EXIST } });
            }

            const newWallet = await Models.MakerWalletsModel.create({
                device_token: deviceToken,
                wallet_address: walletAddress,
                wallet_name: walletName,
                user_id: userId,
                coin_family: coinFamily,
                device_id: deviceId,
                status: 0,
                fiat_currency: 'usd',
                theme: 'dark',
                created_at: new Date(),
                updated_at: new Date()
            });

            const token = await jwtHelper.createJSONWebToken(userId, deviceToken);
            const refreshToken = await jwtHelper.createJSONRefreshToken(userId, deviceToken);

            const newObject = {
                token,
                refreshToken,
                userId,
                walletName,
                walletAddress,
                coinFamily,
                makerUserId: newWallet.id
            };
            // let blockchain: string =
            //     (coinFamily == 1) ? 'BNB'
            //         : (coinFamily == 2) ? 'ETH'
            //             : (coinFamily == 3) ? 'BTC'
            //                 : 'TRX';

            let tittle: string = language[lang].ASKING_FOR_ACCESS_TITTLE;
            let message: string = language[lang].ASKING_FOR_ACCESS;

            await makerHelper.insertNotification(newWallet.id, userId, 'makerToChecker', message, 1, tittle);

            return response.success(res, {
                data: {
                    status: true,
                    data: newObject
                },
            });

        } catch (err: any) {
            console.error("Error in createAccount:", err.message);
            await commonHelper.save_error_logs("createAccount", err.message);
            return response.error(res, { data: { message: language[lang].CATCH_MSG } });
        }
    }
    public async notifications(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body maker notifications >>>", req.body)

        let perPage: number = Number(req.body?.limit == undefined ? (req.body.limit = '10') : req.body.limit);
        let page: number = Number(req.body.page == undefined ? (req.body.page = '1') : req.body.page);
        let offset: number = (page - 1) * perPage;
        let makerUserId: number = req.body.makerUserId;
        let checkerUserId: number = req.userId;

        let whereClause: any;
        if (makerUserId > 0) {
            whereClause = { maker_user_id: makerUserId, type: 'checkerToMaker', notification_status: 1 }
        } else {
            whereClause = { checker_user_id: checkerUserId, type: 'makerToChecker', notification_status: 1 }
        }
        try {

            let notificationData: any = await Models.MakerCheckerNotificationModel.findAndCountAll({
                attributes: ['id', 'maker_user_id', 'checker_user_id', 'type', 'message', 'view_status', 'status', 'notification_status', 'created_at', 'updated_at'],
                where: whereClause,
                include: [{
                    model: Models.MakerWalletsModel,
                    attributes: ['wallet_address', 'wallet_name'],
                    as: 'notification_maker_wallet_data'
                }
                    // , {
                    //     model: Models.MakerTrnxRequestsModel,
                    //     attributes: [["id", "trnxRequestId"], "maker_user_id", "user_id", "coin_id", "from_address", "to_address", "coin_details", "crypto_amount", "wallet_name", "trnx_fee", "status"],
                    //     as: 'notification_maker_request_data',
                    //     include: [{
                    //         model: Models.CoinsModel,
                    //         attributes: ['coin_name', 'coin_symbol'],
                    //         as: "maker_request_coins_data"
                    //     }]

                    // }
                ],
                limit: perPage,
                offset: offset,
                order: [['created_at', 'DESC']],
            });
            return response.success(res, {
                data: {
                    success: true,
                    data: notificationData?.rows,
                    meta: {
                        page: page,
                        pages: Math.ceil(notificationData.count / perPage),
                        perPage: perPage,
                        total: notificationData.count,
                    },
                    message: language[lang].SUCCESS
                }
            });
        } catch (err: any) {
            console.error("Error in notifications:", err.message);
            await commonHelper.save_error_logs("notifications", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async getDetails(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let makerUserIds: any = req.body.makerUserIds;
        try {
            console.log("req body maker getDetails >>>", req.body)
            let status: number | undefined = req.body.status;
            let whereClause: any;
            if (status) {
                whereClause = { id: { [Op.in]: makerUserIds }, status: 1 }
            } else {
                whereClause = { id: { [Op.in]: makerUserIds } }
            }
            let makerWalletsData: any = await Models.MakerWalletsModel.findAll({
                attributes: ['id', 'device_token', 'wallet_address', 'wallet_name', 'user_id', 'coin_family', 'device_id', 'status', 'fiat_currency', 'theme', 'created_at', 'updated_at'],
                where: whereClause,
                order: [['id', 'DESC']]
            })

            return response.success(res, {
                data: {
                    success: true,
                    data: makerWalletsData,
                    message: language[lang].SUCCESS
                }
            });
        } catch (err: any) {
            console.error("Error in getDetails:", err.message);
            await commonHelper.save_error_logs("getDetails", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async getToken(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body maker getToken >>>", req.body)
        let userId: number = req.body.userId;
        let deviceToken: string = req.body.deviceToken;
        let makerUserIds: Array<number> = req.body.makerUserIds;
        try {
            let token: string = await jwtHelper.createJSONWebToken(userId, deviceToken);
            let refreshToken: string = await jwtHelper.createJSONRefreshToken(userId, deviceToken);

            if (makerUserIds && makerUserIds.length > 0) {

                await Models.MakerWalletsModel.update(
                    { is_login: 1 },
                    { where: { id: { [Op.in]: makerUserIds } } })
            }


            return response.success(res, {
                data: {
                    success: true,
                    data: {
                        token: token,
                        refreshToken: refreshToken
                    },
                    message: language[lang].SUCCESS
                }
            });
        } catch (err: any) {
            console.error("Error in getToken:", err.message);
            await commonHelper.save_error_logs("getToken", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async editDetails(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body maker editDetails >>>", req.body)
        let key: number = req.body.key; // 1 wallet_name,2 fiat_currency,3 theme
        let value: string = req.body.value; // wallet_name,fiat_currency, dark || light
        let makerUserId: number = req.body.makerUserId;
        try {

            let setClause: any = (key == 1) ? { wallet_name: value } : (key == 2) ? { fiat_currency: value } : { theme: value }

            await Models.MakerWalletsModel.update(
                setClause,
                { where: { id: makerUserId } })

            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS
                }
            });
        } catch (err: any) {
            console.error("Error in editDetails:", err.message);
            await commonHelper.save_error_logs("editDetails", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async makeTrnxRequest(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body maker makeTrnxRequest >>>", req.body)
        let { makerUserId, coinId, fromAddress, toAddress, cryptoAmount, walletName, trnxFee, coinSymbol }:
            { makerUserId: number, coinId: number, fromAddress: string, toAddress: string, cryptoAmount: string, walletName: string, trnxFee: number, coinSymbol: string } = req.body;

        let userId: number = req.userId;
        // let userId: number = 5;
        try {

            let walletData: any = await wallet_queries.wallet_find_one(
                ["balance"],
                { user_id: userId, coin_id: coinId }
            )

            if (walletData) {

                if (Number(cryptoAmount) < Number(walletData.balance)) {
                    console.log("balance is more thn cryptoAmount")
                    let obj: any = {
                        maker_user_id: makerUserId,
                        type: req.body.type ? req.body.type : 'Withdraw',
                        user_id: userId,
                        coin_id: coinId,
                        wallet_name: walletName,
                        trnx_fee: trnxFee,
                        status: 'pending',
                        token_one_amount: req.body.tokenOneAmount ? req.body.tokenOneAmount : null,
                        token_one: req.body.tokenOne ? JSON.stringify(req.body.tokenOne) : null,
                        token_second: req.body.tokenSecond ? JSON.stringify(req.body.tokenSecond) : null,
                        saved_slippage: req.body.savedSlippage ? req.body.savedSlippage : null,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                    if (req.body.type == 'Swap') {
                        obj.gasless_toggle = req.body.gaslessToggle
                        obj.from_address = null
                        obj.to_address = null
                        obj.crypto_amount = null
                    } else {
                        obj.from_address = fromAddress
                        obj.to_address = toAddress
                        obj.crypto_amount = cryptoAmount
                    }
                    let newTrnxRequest: any = await Models.MakerTrnxRequestsModel.create(obj)
                    let title: string = language[lang].TRNX_REQUEST_TITLE
                    let message: string = language[lang].TRANSACTION_REQUEST_SENT


                    await makerHelper.insertNotification(makerUserId, userId, 'makerToChecker', message, 1, title);

                    return response.success(res, {
                        data: {
                            status: true,
                            data: message
                        },
                    });

                } else {
                    console.log("balance is less thn cryptoAmount Number(cryptoAmount)", Number(cryptoAmount), "Number(walletData.balance)", Number(walletData.balance))
                    return response.error(res, {
                        data: {
                            status: false,
                            message: language[lang].ETH_INSUFFICIENT(coinSymbol)
                        },
                    });
                }
            } else {
                console.error("Error in makeTrnxRequest >> Wallet Data Does not exist");

                await commonHelper.save_error_logs("makeTrnxRequest", `Wallet Data does not exist userId ${userId},coinId ${coinId}`);

                return response.error(res, { data: { message: language[lang].CATCH_MSG } });
            }
        } catch (err: any) {
            console.error("Error in makeTrnxRequest:", err.message);
            await commonHelper.save_error_logs("makeTrnxRequest", err.message);
            return response.error(res, { data: { message: language[lang].CATCH_MSG } });
        }
    }

    public async makeTrnxApprovalRequest(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body maker makeTrnxApprovalRequest >>>", req.body)
        let { makerUserId, coinId, fromAddress, toAddress, cryptoAmount, walletName, trnxFee, coinSymbol }:
            { makerUserId: number, coinId: number, fromAddress: string, toAddress: string, cryptoAmount: string, walletName: string, trnxFee: number, coinSymbol: string } = req.body;

        let userId: number = req.userId;
        // let userId: number = 5;
        try {

            let walletData: any = await wallet_queries.wallet_find_one(
                ["balance"],
                { user_id: userId, coin_id: coinId }
            )

            if (walletData) {

                if (Number(cryptoAmount) < Number(walletData.balance)) {
                    console.log("balance is more thn cryptoAmount")
                    let obj: any = {
                        maker_user_id: makerUserId,
                        type: req.body.type ? req.body.type : 'Approval',
                        user_id: userId,
                        coin_id: coinId,
                        wallet_name: walletName,
                        trnx_fee: trnxFee,
                        status: 'pending',
                        token_one_amount: req.body.tokenOneAmount ? req.body.tokenOneAmount : null,
                        token_one: req.body.tokenOne ? JSON.stringify(req.body.tokenOne) : null,
                        token_second: req.body.tokenSecond ? JSON.stringify(req.body.tokenSecond) : null,
                        saved_slippage: req.body.savedSlippage ? req.body.savedSlippage : null,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                    if (req.body.type == 'Swap') {
                        obj.gasless_toggle = req.body.gaslessToggle
                        obj.from_address = null
                        obj.to_address = null
                        obj.crypto_amount = null
                    } else {
                        obj.from_address = fromAddress
                        obj.to_address = toAddress
                        obj.crypto_amount = cryptoAmount
                    }
                    let newTrnxRequest: any = await Models.MakerTrnxRequestsModel.create(obj)
                    let title: string = language[lang].TRNX_APPROVAL_REQUEST_TITLE
                    let message: string = language[lang].TRNX_APPROVAL_REQUEST_TITLE


                    await makerHelper.insertNotification(makerUserId, userId, 'makerToChecker', message, 1, title);

                    return response.success(res, {
                        data: {
                            status: true,
                            data: message
                        },
                    });

                } else {
                    console.log("balance is less thn cryptoAmount Number(cryptoAmount)", Number(cryptoAmount), "Number(walletData.balance)", Number(walletData.balance))
                    return response.error(res, {
                        data: {
                            status: false,
                            message: language[lang].ETH_INSUFFICIENT(coinSymbol)
                        },
                    });
                }
            } else {
                console.error("Error in makeTrnxRequest >> Wallet Data Does not exist");

                await commonHelper.save_error_logs("makeTrnxRequest", `Wallet Data does not exist userId ${userId},coinId ${coinId}`);

                return response.error(res, { data: { message: language[lang].CATCH_MSG } });
            }
        } catch (err: any) {
            console.error("Error in makeTrnxRequest:", err.message);
            await commonHelper.save_error_logs("makeTrnxRequest", err.message);
            return response.error(res, { data: { message: language[lang].CATCH_MSG } });
        }
    }



}
export const makerController = new MakerController();