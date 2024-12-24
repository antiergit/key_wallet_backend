import { CoinFamily, Fiat_Currency, GlblBooleanEnum, GlblCode } from '../../constants/global_enum'
import * as Models from './../../models/index'
import { Messages } from './enum';
import { Op, Sequelize } from 'sequelize';
import rabbitMq from '../../helpers/common/rabbitMq';
import { global_helper } from '../../helpers/common/global_helper';
import redisClient from '../../helpers/common/redis';
// import AWS from 'aws-sdk';
import { config } from "../../config";
import dbHelper, { wallet_queries, user_queries, coin_queries, device_token_queries, address_book_wallet_queries } from '../../helpers/dbHelper/index'
import commonHelper from '../../helpers/common/common.helpers';
import { language } from '../../constants';


// AWS.config.update({
//     accessKeyId: config.S3_ACCESSID,
//     secretAccessKey: config.S3_SECRETKEY,
//     region: config.REGION
// })
// const s3 = new AWS.S3();

class userHelper {
    constructor() { }
    public async adding_coins_to_queue(queueName: string, data: any) {
        try {
            await rabbitMq.assertQueue(queueName)
            await rabbitMq.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in adding_coins_to_queue>>>", err)
            await commonHelper.save_error_logs("adding_coins_to_queue", err.message);
            return null;
        }
    }
    public async old_user_generate_referral(device_id: any, userId: any) {
        try {
            let user_exist: any = await user_queries.user_find_one(["referral_code", "device_id"], { user_id: userId })
            let referral_code: any;
            let where_clause: any;
            if (user_exist.referral_code == null) {
                let code: any = await userhelper.generate_referral_code();
                where_clause = { referral_code: code, };
                referral_code = code;
            } else {
                referral_code = user_exist.referral_code;
            }
            if (user_exist.device_id == null) {
                where_clause = {
                    ...where_clause, device_id: device_id
                }
            } else {
                if (user_exist.device_id.includes(device_id)) {
                    console.log("same device id exist for that user")
                } else {
                    console.log("same device_id not exist")
                    where_clause = {
                        ...where_clause, device_id: Sequelize.fn('CONCAT', Sequelize.col('device_id'), ',', device_id)
                    };
                }
            }
            if (where_clause) {
                await user_queries.user_update(where_clause, { user_id: userId })
            }
            return referral_code;
        } catch (err: any) {
            console.error("Error in old_user_generate_referral>>>>", err)
            await commonHelper.save_error_logs("old_user_generate_referral", err.message);
            return 0;
        }
    }
    public async generate_referral_code() {
        try {
            const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code: string = '';
            for (let i: number = GlblBooleanEnum.false; i < 8; i++) {
                const randomIndex: any = Math.floor(Math.random() * characters.length);
                code += characters.charAt(randomIndex);
            }
            return code;
        } catch (err: any) {
            console.error("Error in user > generate_referral_code.", err)
            await commonHelper.save_error_logs("generate_referral_code", err.message);
            return err;
        }
    }
    public async create_new_user(device_id: any, user_name: string) {
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            let code: any = await userhelper.generate_referral_code();
            let obj: any = {
                user_name: user_name,
                request_rejected: 0,
                // email: email,
                gp_referred: 0,
                pre_fran_referred: 0,
                fran_referred: 0,
                mas_fran_referred: 0,
                referral_count: GlblBooleanEnum.false,
                referral_code: code,
                referral_type_id: 1,
                device_id: device_id ? device_id : null,
                created_at: currentUTCDate,
                updated_at: currentUTCDate
            }
            let userData: any = await user_queries.user_create(obj)
            let user_id: any = userData.user_id
            return { code, user_id }
        } catch (err: any) {
            console.error("Error in create_new_user>>", err)
            await commonHelper.save_error_logs("create_new_user", err.message);
            return false;
        }
    }
    public async updating_balance(addressList: any, userId: number, req: any, wallet_name: string, lang: string) {
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            for await (const wallet of addressList) {
                if (!wallet.address) continue;

                let address: string = wallet.address;
                let symbol: string = wallet.symbol;
                let coin_family: number = wallet.coin_family;

                let addressValidity: any = await global_helper.validate_address(address, coin_family);
                if (!addressValidity) throw new Error(`${language[lang].INVALID_ADDRESS} (${symbol.toUpperCase()})`);

                // let token_data: any = null;

                // Getting USDT token data default
                // if (coin_family == config.STATIC_COIN_FAMILY.TRX) {
                //     token_data = await coin_queries.coin_find_one(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address"], { coin_family: coin_family, coin_symbol: "USDT" })
                // }

                // Getting Coin data 
                let coinData: any = await coin_queries.coin_find_one(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address", "token_type"], { coin_family: coin_family, coin_symbol: symbol })
                if (coinData) {
                    // balance of coin
                    let balDetails: any = await global_helper.get_wallet_balance(coinData, address);
                    let balance: string = "0";
                    if (balDetails.status) {
                        balance = balDetails.balance;
                    }
                    // let tokenBalance: any;

                    // balance of token
                    // if (coin_family == config.STATIC_COIN_FAMILY.TRX && token_data) {
                    //     tokenBalance = await global_helper.get_wallet_balance(token_data, address);
                    // }

                    let ifWalletExists: any = await wallet_queries.wallet_find_one(["wallet_id"], { wallet_address: address, coin_id: coinData.coin_id, user_id: userId })
                    if (ifWalletExists) {
                        await wallet_queries.wallet_update(
                            { wallet_name: wallet_name, status: GlblBooleanEnum.true },
                            { wallet_id: ifWalletExists.wallet_id })
                    } else {
                        let obj: any = {
                            user_id: userId,
                            wallet_name: wallet_name,
                            wallet_address: address,
                            default_wallet: GlblBooleanEnum.true,
                            status: GlblBooleanEnum.true,
                            // login_type: req.body.login_type,
                            // social_id: req.body.social_id,
                            coin_id: coinData.coin_id,
                            balance: balDetails.status ? balDetails.balance : "0",
                            coin_family: coin_family,
                            is_private_wallet: req.body.isPrivateKey,
                            created_at: currentUTCDate,
                            updated_at: currentUTCDate,
                        }
                        // Creating wallet for that blockchain (coin)
                        await wallet_queries.wallet_create(obj)

                        // Creating wallet for that blockchain (tokne - USDT)

                        // if (coin_family == config.STATIC_COIN_FAMILY.TRX) {
                        //     let obj2 = obj;
                        //     obj2.coin_id = token_data.coin_id;
                        //     obj2.balance = tokenBalance || 0;
                        //     await wallet_queries.wallet_create(obj2)
                        // }
                        await redisClient.update_wallet_address_list(wallet.coin_family, address, userId, wallet_name);
                    }
                    if (balDetails.status == false) {
                        await this.adding_coins_to_queue(config.BACKEND_WALLET_ADDRESSES,
                            {
                                coin_data: {
                                    coin_id: coinData.coin_id,
                                    coin_family: coinData.coin_family,
                                    is_token: coinData.is_token,
                                    token_address: coinData.token_address,
                                    token_type: coinData.token_type
                                }, wallet_address: address, queue_count: 0
                            })
                    }
                }
            }
        } catch (err: any) {
            console.error("Error in updating_balance>>>", err)
            await commonHelper.save_error_logs("updating_balance", err.message);
            return false;
        }
    }
    public async device_token_helper(device_token: any, userId: number, lang: string) {
        try {
            let checkUserDeviceToken: any = await device_token_queries.device_token_find_one(["status"], { device_token: device_token, user_id: userId })
            if (!checkUserDeviceToken) {
                await device_token_queries.device_token_create({
                    device_token: device_token,
                    user_id: userId,
                    status: GlblBooleanEnum.true,
                    language: lang,
                    fiat_currency: Fiat_Currency.USD,
                    push: 1
                })
            } else {
                await device_token_queries.device_token_update({ status: GlblBooleanEnum.true }, { device_token: device_token, user_id: userId })
            }
            return true;
        } catch (err: any) {
            console.error("Error in device_token_helper>>>", err)
            await commonHelper.save_error_logs("device_token_helper", err.message);
            return false;
        }
    }
    public async wallet_name(address_book_id: number, coin_family: number, wallet_name: string) {
        try {
            let check_name: any = await address_book_wallet_queries.address_book_wallets_find_all(["name"], { address_book_id: address_book_id, coin_family: coin_family })

            if (check_name.length == GlblBooleanEnum.false) {
                if (wallet_name.length == GlblBooleanEnum.false && coin_family == CoinFamily.ETH) {
                    wallet_name = 'Eth'
                } else if (wallet_name.length == GlblBooleanEnum.false && coin_family == CoinFamily.BTC) {
                    wallet_name = 'Btc'
                } else if (wallet_name.length == GlblBooleanEnum.false && coin_family == CoinFamily.TRX) {
                    wallet_name = 'Trx'
                } else if (wallet_name.length == GlblBooleanEnum.false && coin_family == CoinFamily.BNB) {
                    wallet_name = 'Bnb'
                }
            } else if (check_name.length > GlblBooleanEnum.false) {
                for (let i = GlblBooleanEnum.false; i < check_name.length; i++) {
                    let p: any = check_name[i].name.substring(3, check_name[i].name.length)
                    p = parseInt(p)
                    if (coin_family == CoinFamily.ETH) {
                        if (check_name[i].name == 'Eth') {
                            wallet_name = `Eth${i + 1}`
                        } else if (check_name[i].name == `Eth${i}`) {
                            wallet_name = `Eth${i + 1}`
                        } else {
                            if (p >= 1) {
                                wallet_name = `Eth${p + 1}`
                            }
                        }
                    } else if (coin_family == CoinFamily.BTC) {
                        if (check_name[i].name == 'Btc') {
                            wallet_name = `Btc${i + 1}`
                        } else if (check_name[i].name == `Btc${i}`) {
                            wallet_name = `Btc${i + 1}`
                        } else {
                            if (p >= 1) {
                                wallet_name = `Btc${p + 1}`
                            }
                        }
                    } else if (coin_family == CoinFamily.TRX) {
                        if (check_name[i].name == 'Trx') {
                            wallet_name = `Trx${i + 1}`
                        } else if (check_name[i].name == `Trx${i}`) {
                            wallet_name = `Trx${i + 1}`
                        } else {
                            if (p >= 1) {
                                wallet_name = `Trx${p + 1}`
                            }
                        }
                    } else if (coin_family == CoinFamily.BNB) {
                        if (check_name[i].name == 'Bnb') {
                            wallet_name = `Bnb${i + 1}`
                        } else if (check_name[i].name == `Bnb${i}`) {
                            wallet_name = `Bnb${i + 1}`
                        } else {
                            if (p >= 1) {
                                wallet_name = `Bnb${p + 1}`
                            }
                        }
                    }
                }
            }
            return wallet_name;
        } catch (err: any) {
            console.error("Error in finding default wallet_name>>>>", err)
            await commonHelper.save_error_logs("wallet_name", err.message);
            return wallet_name;
        }
    }

    public async generateTicketId() {
        try {
            const alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let firstTwoLetters: any = alphabet.slice(0, 2)
            const randomNum: any = Math.floor(Math.random() * 10000)
            const ticketId: any = `${firstTwoLetters}-${randomNum}`;
            return ticketId;

        } catch (err: any) {
            console.error("Error in generateTicketId>>>>", err)
            throw err;
        }
    }

    public async referral_already_used(data: any, lang: string) {
        try {
            let { device_id, wallet_address, user_id }: { device_id: string, wallet_address: string | null, user_id: number | 0 } = data;
            /** check device id already used */
            let device_check: any = await dbHelper.checkIfuserReferred({ to_device_id: device_id })
            if (device_check) {
                throw new Error(`${language[lang].REFERRED_ALREADY_USED})`)
            } else {
                /** check user/wallet address already used  or not*/
                if (wallet_address) {
                    let wallet_check: any = await dbHelper.find_one_wallet_table(["email", "user_id", "wallet_id"], { wallet_address: wallet_address });

                    user_id = wallet_check ? wallet_check.user_id : 0
                }

                if (user_id > 0) {
                    let user_took_reward: any = await dbHelper.checkIfuserReferred({ referrer_to: user_id })
                    if (user_took_reward) {
                        throw new Error(`${language[lang].REFERRED_ALREADY_USED})`)
                    }
                }
            }
        } catch (err: any) {
            console.error("Error in check_referral_already_exist.", err)
            await commonHelper.save_error_logs("check_referral_already_exist", err.message);
            throw err;
        }
    }
    public async referral_code_is_valid(referral_code: string, lang: string) {
        try {
            let user_exist: any = await user_queries.user_find_one(["referral_code", "device_id"], { referral_code: referral_code });
            if (user_exist == null) {
                throw new Error(`${language[lang].INVALID_REFERRAL_CODE})`)
            }
        } catch (error) {
            await commonHelper.save_error_logs("check_referral_code_exist", error);
            return { status: false, data: null };
        }
        //referral_code
    }
    public async save_referral_code(data: any, lang: string) {
        try {
            let { user_id, referral_code, device_id }: { user_id: number, referral_code: string, device_id: string } = data;
            let referrer_from_data: any = await dbHelper.get_referrer_from_data(referral_code)
            if (referrer_from_data && referrer_from_data.referral_code.toString() === referral_code.toString()) {
                if (referrer_from_data.user_id != user_id) {
                    let referral_to_data: any = await dbHelper.get_user_data(user_id)
                    if (referral_to_data) {
                        let referral_data = {
                            referrer_from: referrer_from_data.user_id,
                            referrer_to: referral_to_data.user_id,
                            used_referral_code: referral_code,
                            to_device_id: device_id
                        }
                        await dbHelper.save_referral_data(referral_data);
                    }
                }
            } else {
                throw new Error(`${language[lang].INVALID_CODE})`)
            }

        } catch (err: any) {
            console.error("Error in update_referral_code>>", err)
            await commonHelper.save_error_logs("update_referral_code", err.message);
            throw err;
        }
    }
    // public async setting_token_in_db(device_token: string, userId: number, token: string, refreshToken: string) {
    //     try {
    //         let already_exist: any = await Models.JwtsModel.findOne({
    //             attributes: ["user_id", "device_token"],
    //             where: {
    //                 device_token_id: `${device_token}_${userId}`
    //             },
    //             raw: true
    //         })
    //         if (already_exist) {
    //             await Models.JwtsModel.update({ token: token, refresh: refreshToken }, { where: { device_token_id: `${device_token}_${userId}` } })
    //         } else {
    //             await Models.JwtsModel.create({
    //                 user_id: userId,
    //                 device_token: device_token,
    //                 device_token_id: `${device_token}_${userId}`,
    //                 token: token,
    //                 refresh: refreshToken
    //             })
    //         }

    //     } catch (err: any) {
    //         console.error("Error in setting_token_in_db>>", err)
    //         return err;
    //     }
    // }
    // public async deleting_token_from_db(device_token_id: string) {
    //     try {
    //         let already_exist: any = await Models.JwtsModel.findOne({
    //             attributes: ["user_id", "device_token"],
    //             where: {
    //                 device_token_id: device_token_id
    //             },
    //             raw: true
    //         })
    //         if (already_exist) {
    //             await Models.JwtsModel.destroy({ where: { device_token_id: device_token_id } })
    //         }
    //     } catch (err: any) {
    //         console.error("Error in deleting_token_from_db>>>", err)
    //         return err;
    //     }
    // }
    // public async getting_token_from_db(device_token_id: string) {
    //     try {
    //         let already_exist: any = await Models.JwtsModel.findOne({
    //             attributes: ["token", "refresh"],
    //             where: {
    //                 device_token_id: device_token_id
    //             },
    //             raw: true
    //         })
    //         if (already_exist) {
    //             return already_exist.token
    //         }
    //         return true;
    //     } catch (err: any) {
    //         console.error("Error in getting_token_from_db>>>", err)
    //         return err;
    //     }
    // }
}

const userhelper = new userHelper();
export default userhelper;
