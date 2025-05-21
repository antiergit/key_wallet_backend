import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import { wallet_queries } from "../../helpers/dbHelper";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import { checkerHelper } from "./helper";
import * as Models from '../../models/model/index';
import { makerHelper } from "../maker/helper";
import { Op } from "sequelize";

class CheckerController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }

    public async checkerCodes(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        // const userId = 1;
        const userId = req.userId;

        try {
            console.log("Entered into checkerCodes");

            const checkCodesPresent = await wallet_queries.walletJoinCoins(
                ['wallet_id', 'checker_code', 'user_id', 'wallet_address'],
                { user_id: userId },
                ['coin_id', 'coin_name', 'coin_symbol'],
                { is_token: 0, coin_status: 1 }
            );

            if (checkCodesPresent.length > 0) {
                if (checkCodesPresent[0].checker_code == null) {
                    console.log("Maker code is null, generating new codes");
                    await Promise.all(checkCodesPresent.map(async (record: any) => {
                        const code = await checkerHelper.getMakerCode();
                        await wallet_queries.wallet_update({ checker_code: code }, { wallet_id: record.wallet_id });
                        record.checker_code = code;
                    }));
                } else {
                    console.log("Maker code already exists");
                }
            }

            return response.success(res, {
                data: {
                    status: true,
                    data: checkCodesPresent,
                },
            });
        } catch (err: any) {
            console.error("Error in checkerCodes:", err.message);
            await commonHelper.save_error_logs("checkerCodes", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async refreshCode(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        const walletIds = req.body.walletId;
        console.log("req body checker refreshCode >>>", req.body)

        try {
            console.log("Entered into refreshCode");

            const respObj = await Promise.all(walletIds.map(async (walletId: any) => {
                const code = await checkerHelper.getMakerCode();
                await wallet_queries.wallet_update({ checker_code: code }, { wallet_id: walletId });
                return { wallet_id: walletId, checker_code: code };
            }));

            return response.success(res, {
                data: {
                    status: true,
                    data: respObj,
                },
            });

        } catch (err: any) {
            console.error("Error in refreshCode:", err.message);
            await commonHelper.save_error_logs("refreshCode", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async getRequests(req: Request, res: Response) {
        let lang: string = req.headers["content-language"] || "en";
        let userId: number = req.userId;
        // let userId: number = 5;
        let fiatType: string = (req.params.fiatType).toString();
        let coinFamily: number[] = (req.params.coinFamily).split(',').map(Number);
        try {
            console.log("Entered into getRequests");

            let makerWalletsData: any = await Models.MakerWalletsModel.findAll({
                attributes: ['id', 'device_token', 'wallet_address', 'wallet_name', 'user_id', 'coin_family', 'device_id', 'status', 'fiat_currency', 'theme', 'created_at', 'updated_at'],
                where: { user_id: userId, status: 0, coin_family: { [Op.in]: coinFamily } },
                order: [['id', 'DESC']],
                raw: true,
                logging: console.log
            })
            let trnxRequests: any = await Models.MakerTrnxRequestsModel.findAll({
                attributes: ["id", "type", "maker_user_id", "user_id", "coin_id", "from_address", "to_address", "crypto_amount", "wallet_name", "trnx_fee", "status", ['token_one_amount', 'tokenOneAmount'], ['token_one', 'tokenOne'], ['token_second', 'tokenSecond'], ['saved_slippage', 'savedSlippage'], ['gasless_toggle', 'gaslessToggle']],
                where: { user_id: userId, status: "pending" },
                include: [{
                    model: Models.WalletModel,
                    attributes: ['balance'],
                    where: { user_id: userId, coin_family: { [Op.in]: coinFamily } },
                    as: "maker_request_backend_wallet_data"
                }, {
                    model: Models.CoinsModel,
                    attributes: ['coin_name', 'coin_symbol', 'is_token', 'decimals', 'coin_family', 'coin_image', 'token_address'],
                    as: "maker_request_coins_data",
                    include: [
                        {
                            model: Models.CoinPriceInFiatModel,
                            as: "fiat_price_data",
                            attributes: [
                                "value",
                                "price_change_24h",
                                "fiat_type",
                                "price_change_percentage_24h",
                            ],
                            where: {
                                fiat_type: fiatType,
                            },
                            required: false,
                        }]
                },
                {
                    model: Models.MakerWalletsModel,
                    attributes: ['wallet_address', 'wallet_name', 'coin_family'],
                    as: 'maker_request_wallet_data'
                }],
                order: [['id', 'DESC']],
                logging: console.log
            })


            return response.success(res, {
                data: {
                    success: true,
                    data: {
                        accessRequests: makerWalletsData,
                        trnxRequests: trnxRequests

                    },
                    message: language[lang].SUCCESS
                }
            });

        } catch (err: any) {
            console.error("Error in getRequests:", err.message);
            await commonHelper.save_error_logs("getRequests", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async updateStatus(req: Request, res: Response) {
        let lang: string = req.headers["content-language"] || "en";
        let status: number = req.body.status; // 1 Accept, 2 Reject
        let id: number = req.body.id;
        let type: number = req.body.type;

        let checkerUserId: number = req.userId;
        // let checkerUserId: number = 1;
        console.log("req body checker updateStatus >>>", req.body)
        try {
            console.log("Entered into updateStatus");
            let title: string = '';
            let message: string = '';
            let makerUserId: number = 0;
            let sendNotification: number = 0;
            let checkRequestExist: any;


            if (type == 1) { // Wallet Access Request
                console.log("Entered into Access Request")

                checkRequestExist = await Models.MakerWalletsModel.findOne({
                    attributes: ["id"],
                    where: { id: id },
                    raw: true
                });

                if (checkRequestExist) {
                    sendNotification = 1;
                    makerUserId = id;

                    await Models.MakerWalletsModel.update(
                        { status: status },
                        { where: { id: id } });

                    message =
                        (status == 1) ? language[lang].ACCESSED_SUCCESSFULLY
                            : language[lang].ACCESS_DECLINED;

                    title =
                        (status == 1) ? language[lang].ACCESSED_SUCCESSFULLY_TITTLE
                            : language[lang].ACCESS_DECLINED_TITTLE;
                }
            } else if (type == 2) { // Transacttion Access Request

                checkRequestExist = await Models.MakerTrnxRequestsModel.findOne({
                    attributes: ["id"],
                    where: { id: id },
                    raw: true
                });

                if (checkRequestExist) {
                    sendNotification = 1;

                    await Models.MakerTrnxRequestsModel.update(
                        { status: (status == 1) ? 'confirmed' : 'failed' },
                        { where: { id: id } })

                    let trnxRequestData: any = await Models.MakerTrnxRequestsModel.findOne({
                        attributes: ['crypto_amount', 'maker_user_id', 'token_one_amount', 'type'],
                        where: { id: id },
                        include: [{
                            model: Models.CoinsModel,
                            attributes: ['coin_name', 'coin_symbol'],
                            as: "maker_request_coins_data"
                        }]
                    })

                    makerUserId = trnxRequestData.maker_user_id;

                    message =
                        (status == 1) ? language[lang].ACCESSED_SUCCESSFULLY
                            : language[lang].ACCESS_DECLINED;

                    title =
                        (status == 1) ? language[lang].TRNX_SIGNED_TITLE
                            : language[lang].TRNX_REJECTED_TITLE;

                    let cryptoAmt: any;

                    if (trnxRequestData.type == 'Swap') {
                        cryptoAmt = trnxRequestData.token_one_amount
                    } else {
                        cryptoAmt = trnxRequestData.crypto_amount
                    }

                    message = (status == 1)
                        ? language[lang].TRNX_APPROVED(cryptoAmt, (trnxRequestData.maker_request_coins_data.coin_symbol).toUpperCase())
                        : language[lang].TRNX_REJECTED(cryptoAmt, (trnxRequestData.maker_request_coins_data.coin_symbol).toUpperCase());

                }
            }
            else if (type == 3) { // Transacttion Signed Approval Request

                checkRequestExist = await Models.MakerTrnxRequestsModel.findOne({
                    attributes: ["id"],
                    where: { id: id },
                    raw: true
                });

                if (checkRequestExist) {
                    sendNotification = 1;

                    await Models.MakerTrnxRequestsModel.update(
                        { status: (status == 1) ? 'confirmed' : 'failed' },
                        { where: { id: id } })

                    let trnxRequestData: any = await Models.MakerTrnxRequestsModel.findOne({
                        attributes: ['crypto_amount', 'maker_user_id', 'token_one_amount', 'type'],
                        where: { id: id },
                        include: [{
                            model: Models.CoinsModel,
                            attributes: ['coin_name', 'coin_symbol'],
                            as: "maker_request_coins_data"
                        }]
                    })

                    makerUserId = trnxRequestData.maker_user_id;

                    message =
                        (status == 1) ? language[lang].ACCESSED_SUCCESSFULLY
                            : language[lang].ACCESS_DECLINED;

                    title =
                        (status == 1) ? language[lang].TRNX_SIGNED_APPROVAL_TITLE
                            : language[lang].TRNX_REJECTED_APPROVAL_TITLE;

                    let cryptoAmt: any;

                    if (trnxRequestData.type == 'Swap') {
                        cryptoAmt = trnxRequestData.token_one_amount
                    } else {
                        cryptoAmt = trnxRequestData.crypto_amount
                    }

                    message = (status == 1)
                        ? language[lang].TRNX_APPROVAL_APPROVED(cryptoAmt, (trnxRequestData.maker_request_coins_data.coin_symbol).toUpperCase())
                        : language[lang].TRNX_APPROVAL_REJECTED(cryptoAmt, (trnxRequestData.maker_request_coins_data.coin_symbol).toUpperCase());

                }
            }
            if (checkRequestExist == null) {
                console.log("Entered into checkRequestExist null");
                return response.success(res, {
                    data: {
                        status: true,
                        message: language[lang].REQUEST_SESSION_EXPIRED
                    },
                });
            }

            if (sendNotification == 1) {
                await makerHelper.insertNotification(makerUserId, checkerUserId, 'checkerToMaker', message, 1, title)
                return response.success(res, {
                    data: {
                        status: true,
                        message: message
                    },
                });
            } else {
                await commonHelper.save_error_logs("updateStatus", 'sendNotification ==0 ');
                return response.error(res, {
                    data: {
                        message: language[lang].CATCH_MSG,
                    },
                });
            }

        } catch (err: any) {
            console.error("Error in updateStatus:", err.message);
            await commonHelper.save_error_logs("updateStatus", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
}
export const checkerController = new CheckerController();
