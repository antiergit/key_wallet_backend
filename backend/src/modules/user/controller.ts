import { Request, Response } from "express";
import { Op } from "sequelize";
import jwtHelper from "../../helpers/common/jwt";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import * as Models from '../../models/model/index';
import userhelper from "./helper";
import { GlblBooleanEnum, GlblCode, CoinFamily, WalletName } from "../../constants/global_enum";
import { global_helper } from "../../helpers/common/global_helper";
import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import { address_book_queries, address_book_wallet_queries, coin_queries, device_token_queries, notification_queries, user_queries, wallet_queries } from '../../helpers/dbHelper/index'

class UserController implements OnlyControllerInterface {

  constructor() {
    this.initialize();
  }
  public initialize() { }

  public async createWallet(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user createWallet>>>", req.body)
      let { wallet_address, addressList, wallet_name, device_token, device_id, referral_code }: { wallet_address: string, addressList: any, wallet_name: string, device_token: string, device_id: string, referral_code: string } = req.body;

      if (referral_code) {
        /** check referral code is valid */
        await userhelper.referral_code_is_valid(referral_code, lang);
      }

      // Check whether same wallet address exist
      let checkAddressExists: any = null;

      if (wallet_address) {
        checkAddressExists = await wallet_queries.wallet_find_one(['user_id'], { wallet_address: wallet_address })
      }

      // If Wallet Address exist
      let userId: any = GlblBooleanEnum.false;

      let user_referral_code: string = '';

      if (checkAddressExists) {
        userId = checkAddressExists?.user_id;
        // Adding users all active coins to queue to update balance
        // try {
        //   await userhelper.adding_coins_to_queue(checkAddressExists?.user_id)
        // } catch (err: any) {
        //   console.error("Error in adding_coins_to_queue>>>> ", err)
        // }

        // Insert device id and referral code if not there
        if (device_id) {
          user_referral_code = await userhelper.old_user_generate_referral(device_id, userId)
        }
      } else {
        // Create New User
        let code_userId: any = await userhelper.create_new_user(device_id, wallet_name)

        if (device_id) { user_referral_code = code_userId.code; }

        userId = code_userId.user_id;
      }

      /** save referral data */
      if (referral_code) {
        /** check referral code already used */
        await userhelper.referral_already_used({ device_id: device_id, address: wallet_address, user_id: null }, lang);
        await userhelper.save_referral_code({ user_id: userId, referral_code: referral_code, device_id: device_id }, lang)
      }

      // Updating balance
      await userhelper.updating_balance(addressList, userId, req, wallet_name, lang)
      // await wallet_queries.wallet_update({ login_type: req.body.login_type }, { user_id: userId })


      let token: string;
      let refreshToken: string;

      token = await jwtHelper.createJSONWebToken(userId, device_token);

      refreshToken = await jwtHelper.createJSONRefreshToken(userId, device_token);

      if (device_token) { await userhelper.device_token_helper(device_token, userId, lang) }
      const newObject: any = { token, refreshToken, userId: userId, referral_code: user_referral_code, wallet_name: wallet_name };
      return response.success(res, {
        data: {
          status: true,
          data: newObject
        },
      });
    } catch (err: any) {
      console.error("Error in user > create wallet (2).", err)
      await commonHelper.save_error_logs("users_createWallet", err.message);
      return response.error(res, { data: {} });
    }
  }
  public async userLogout(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user userLogout>>>", req.body)
      const { deviceToken, deviceId, userIds, makerUserIds }:
        { deviceToken: string; deviceId: string, userIds: Array<number>, makerUserIds: Array<number> }
        = req.body;

      let userId: number = req.userId;
      // let userId: number = 5;


      let checkUserDeviceToken: any = await device_token_queries.device_token_find_one(["id"], { device_token: deviceToken, user_id: userId })

      if (checkUserDeviceToken) {
        await device_token_queries.device_token_destroy({ device_token: deviceToken, user_id: userId })
      }

      if (userIds && userIds.length > 0) {

        let users: any = await user_queries.user_find_all(
          ["user_id", "device_id"],
          { user_id: userIds },
          [['user_id', 'DESC']]
        )

        let updates = users.map((user: any) => {
          const { user_id, device_id } = user;

          if (device_id) {
            const deviceIds = device_id.split(',').filter((dId: any) => dId !== deviceId);
            return {
              user_id,
              device_id: deviceIds.join(',')
            };
          }
          return null;
        }).filter((update: any) => update !== null);
        for (const update of updates) {
          await user_queries.user_update(
            { device_id: update.device_id },
            { user_id: update.user_id }
          )
        }
      }
      if (makerUserIds && makerUserIds.length > 0) {

        await Models.MakerWalletsModel.update(
          { is_login: 0 },
          { where: { id: { [Op.in]: makerUserIds } } })
      }

      return response.success(res, {
        data: {
          status: true,
          data: {
            message: language[lang].LOGOUT
          },
        },
      });
    } catch (err: any) {
      console.error("Error in user > userLogout.", err)
      await commonHelper.save_error_logs("users_userLogout", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
  public async notificationList(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user notificationList>>>", req.body)
      let per_page: number = Number(req.body?.limit == undefined ? (req.body.limit = '10') : req.body.limit);
      let page: number = Number(req.body.page == undefined ? (req.body.page = '1') : req.body.page);
      let offset: number = (page - 1) * per_page;


      let notifications_data = await notification_queries.notifications_joint_find_all_count_all(
        ['wallet_address', 'amount', 'notification_type', 'tx_type', 'state', 'message', 'alert_price', 'fiat_type', 'coin_symbol', 'created_at'],
        ['coin_name', 'coin_symbol'],
        ['currency_code', 'currency_symbol'],
        { coin_family: { [Op.in]: req.body.coin_family } },
        // {
        //   [Op.or]: [{ wallet_address: { [Op.in]: req?.body?.addrsListKeys } },
        //   { to_user_id: req.userId }]
        // }, 
        { wallet_address: { [Op.in]: req?.body?.addrsListKeys } },
        per_page, offset
      )

      return response.success(res, {
        data: {
          success: true,
          data: notifications_data?.rows,
          meta: {
            page: page,
            pages: Math.ceil(notifications_data.count / per_page),
            perPage: per_page,
            total: notifications_data.count,
          },
          message: language[lang].SUCCESS
        }
      });
    } catch (err: any) {
      console.error("Error in user > notificationList.", err)
      await commonHelper.save_error_logs("users_notificationList", err.message);
      return response.error(res, { data: {} });
    }
  }
  public async addAddressBook(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user addAddressBook>>>", req.body)
      let user_id: number = req.userId;
      let { wallet_address, contact_name, address, coin_family, wallet_name } = req.body;

      let wallet_address_exist: any = await address_book_wallet_queries.address_book_wallets_with_address_book(
        ["address_book_id"],
        ["id"],
        { wallet_address: wallet_address, coin_family: coin_family },
        { address: address }
      )

      if (wallet_address_exist) {
        return response.error(res, {
          data: {
            code: GlblCode.ERROR_CODE,
            status: false,
            message: language[lang].SAME_WALLET_ADDRESS_EXIST
          }
        });
      }

      let address_book: any = await address_book_queries.address_books_find_one(['id', 'name', 'address'], { address: address, user_id: user_id, name: contact_name })

      if (!address_book) {
        address_book = await address_book_queries.address_book_create({ address: address, user_id: user_id, name: contact_name, created_at: new Date(), updated_at: new Date() })
      }
      let address_book_id = address_book?.id;

      let wallet_name_exist: number = await address_book_wallet_queries.address_book_wallet_get_count({ address_book_id: address_book_id, name: wallet_name })

      if (wallet_name_exist > GlblBooleanEnum.false) {
        return response.error(res, {
          data: {
            code: GlblCode.ERROR_CODE,
            status: false,
            message: language[lang].SAME_WALLET_NAME_EXIST
          }
        });
      }
      let name: any;
      if (!wallet_name) {
        name = await userhelper.wallet_name(address_book_id, coin_family, wallet_name)
      } else { name = wallet_name; }
      wallet_name = name;
      const addressValidity: any = await global_helper.validate_address(wallet_address, coin_family);
      if (!addressValidity) throw new Error(`${language[lang].INVALID_ADDRESS} (${coin_family})`);
      let total_wallets: any = await address_book_wallet_queries.address_book_wallets_find_all(["name"], { address_book_id: address_book_id })
      if (total_wallets.length == 10) {
        return response.error(res, {
          data: {
            code: GlblCode.ERROR_CODE,
            status: false,
            message: language[lang].MAX_LIMIT
          }
        });
      }
      await address_book_wallet_queries.address_book_wallet_create({ address_book_id: address_book_id, name: wallet_name, wallet_address: wallet_address, coin_family: coin_family })
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          message: language[lang].ADDRESS_BOOK_SAVED
        }
      });
    } catch (err: any) {
      console.error("Error in user > add_address_book.", err)
      await commonHelper.save_error_logs("users_add_address_book", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
  public async addressBook(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user addressBook>>>", req.body)
      let per_page: number = Number(req.body?.limit == undefined ? (req.body.limit = '10') : req.body.limit);
      let page: number = Number(req.body.page == undefined ? (req.body.page = '1') : req.body.page);
      let offset: number = (page - 1) * per_page;
      let search: any = req.body.search == undefined ? (req.body.search = "%%") : (req.body.search = "%" + req.body.search + "%");
      let set_order_by: string = req.body?.order_by == undefined || req.body?.order_by == "undefined" ? 'created_at' : req.body?.order_by as string;
      let set_order_type: string = req.body?.order_type == "undefined" || req.body?.order_type == undefined ? 'DESC' : req.body?.order_type as string;
      let { address, coin_family }: { address: string, coin_family: number } = req.body;
      let user_id: number = req.userId;

      let address_book_data: any = await address_book_queries.address_book_with_address_book_wallet_coins_joint(
        ['id', 'name', 'address', 'created_at'],
        ['id', 'address_book_id', 'wallet_address', 'name', 'coin_family', 'created_at'],
        { coin_family: coin_family, [Op.or]: [{ "$wallet_data.name$": { [Op.like]: search } }, { "$address_books.name$": { [Op.like]: search } }] },
        ["coin_image"],
        { is_token: GlblBooleanEnum.false },
        { address: address, user_id: user_id },
        per_page, offset, set_order_by, set_order_type
      )

      let address_book_data_number: any = await address_book_queries.address_book_count({ name: { [Op.like]: search }, address: address, user_id: user_id })

      return response.success(res, {
        data: {
          data: address_book_data,
          meta: {
            page: page,
            pages: Math.ceil(address_book_data_number / per_page),
            perPage: per_page,
            total: address_book_data_number,
          },
          code: GlblCode.SUCCESS,
          status: true,
          message: language[lang].GET_ADDRESS_BOOK
        }
      });
    } catch (err: any) {
      console.error('Error in user > address_book.', err);
      await commonHelper.save_error_logs("users_address_book", err.message);
      return response.error(res, {
        data: {
          data: [],
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      })
    }
  }
  public async getWalletName(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user getWalletName>>>", req.body)
      let { contact_name, coin_family, wallet_name, address }: { contact_name: string, coin_family: number, wallet_name: string, address: string } = req.body;
      let user_id: number = req.userId;

      let address_book: any = await address_book_queries.address_books_find_one(['id', 'name', 'address'], { address: address, user_id: user_id, name: contact_name })

      if (address_book) {
        let address_book_id: any = address_book?.id;
        let name: any = await userhelper.wallet_name(address_book_id, coin_family, wallet_name)
        wallet_name = name;
      } else {
        if (coin_family == CoinFamily.ETH) {
          wallet_name = WalletName.ETH
        } else if (coin_family == CoinFamily.BTC) {
          wallet_name = WalletName.BTC
        } else if (coin_family == CoinFamily.TRX) {
          wallet_name = WalletName.TRX
        } else if (coin_family == CoinFamily.BNB) {
          wallet_name = WalletName.BNB
        }
      }
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          wallet_name: wallet_name
        }
      });

    } catch (err: any) {
      console.error("Entered in user > get_wallet_name.", err)
      await commonHelper.save_error_logs("users_get_wallet_name", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
  public async search(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user search>>>", req.body)
      let user_id: number = req.userId;
      let search: any = req.body.search == undefined ? (req.body.search = "%%") : (req.body.search = "%" + req.body.search + "%");

      let address_book: any = await address_book_queries.address_books_find_all(['name'], { user_id: user_id, name: { [Op.like]: search } })

      if (!address_book) {
        address_book = null
      }
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          contact_name: address_book
        }
      });
    } catch (err: any) {
      console.error('Error in user > search.', err);
      await commonHelper.save_error_logs("users_search", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      })
    }
  }
  public async deleteAddressBookWalletAddress(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user deleteAddressBookWalletAddress>>>", req.body)
      const { id, address_book_id }: { id: number, address_book_id: number } = req.body;
      let address_book_wallet: number = await address_book_wallet_queries.address_book_wallet_get_count({ address_book_id: address_book_id })

      if (address_book_wallet == GlblBooleanEnum.false) {
        return response.error(res, {
          data: {
            code: GlblCode.ERROR_CODE,
            status: false,
            message: language[lang].NO_WALLET_ADDRESS_EXIST
          }
        });
      } else if (address_book_wallet == GlblBooleanEnum.true) {
        await address_book_wallet_queries.address_book_wallet_destroy({ id: id, address_book_id: address_book_id })
        await address_book_queries.address_book_destroy({ id: address_book_id })
      } else {
        await address_book_wallet_queries.address_book_wallet_destroy({ id: id, address_book_id: address_book_id })
      }

      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          message: language[lang].DELETED_ADDRESSBOOK_WALLET
        }
      });
    } catch (err: any) {
      console.error("Error in user > delete_address_book_wallet_address.", err)
      await commonHelper.save_error_logs("users_delete_address_book_wallet_address", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
  public async deleteAddressBook(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body user deleteAddressBook>>>", req.body)
      const { id }: { id: number } = req.body;
      let address_book: any = await address_book_queries.address_book_count({ id: id })
      if (address_book == GlblBooleanEnum.false) {
        return response.error(res, {
          data: {
            code: GlblCode.ERROR_CODE,
            status: false,
            message: language[lang].NO_ADDRESSBOOK_EXIST
          }
        });
      }
      await address_book_queries.address_book_destroy({ id: id })
      let address_book_wallet_data: number = await address_book_wallet_queries.address_book_wallet_get_count({ address_book_id: id })
      if (address_book_wallet_data > 0) {
        await address_book_wallet_queries.address_book_wallet_destroy({ address_book_id: id })
      }
      return response.success(res, {
        data: {
          code: GlblCode.SUCCESS,
          status: true,
          message: language[lang].ADDRESSBOOK_DELETED
        }
      });
    } catch (err: any) {
      console.error("Error in user > delete_address_book.", err)
      await commonHelper.save_error_logs("users_delete_address_book", err.message);
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
  public async announcementViewStatus(req: Request, res: Response) {
    try {
      console.log("req body user announcementViewStatus>>>", req.body)
      let key: number = req.body.key; // 0 or 1
      let data: any;
      let view_status: any;
      if (key == GlblBooleanEnum.true) { // if send 1 
        view_status = await Models.NotificationModel.findAll({
          attributes: ["notification_id", "view_status"],
          where: {
            wallet_address: { [Op.in]: req?.body?.addrsListKeys },
            [Op.or]: [{ view_status: 0 }, { view_status: null }]
          },
          raw: true
        })
        if (view_status.length !== 0) {
          data = {
            new_notifications: 1
          }
        } else {
          let ann_data: any = await Models.AnnouncementStatusModel.findOne({
            attributes: ["user_id"],
            where: {
              user_id: req.userId,
            },
            raw: true
          })
          if (ann_data) {
            let seen_data: any = await Models.AnnouncementStatusModel.findOne({
              attributes: ["user_id"],
              where: {
                user_id: req.userId,
                view_status: 1
              },
              raw: true
            })
            if (seen_data) {
              data = {
                new_notifications: 0
              }
            } else {
              data = {
                new_notifications: 1
              }
            }

          } else {
            data = {
              new_notifications: GlblBooleanEnum.false
            }
          }
        }

      } else {  // if send 0 it means all view status to be updated as 1
        await Models.NotificationModel.update({
          view_status: 1
        }, {
          where: {
            wallet_address: { [Op.in]: req?.body?.addrsListKeys },
            [Op.or]: [{ view_status: 0 }, { view_status: null }]
          },
        })
        await Models.AnnouncementStatusModel.update({
          view_status: 1
        }, {
          where: {
            user_id: req.userId
          },
        })
        data = {
          new_notifications: 0
        }
      }
      response.success(res, { data: data });

    } catch (err: any) {
      console.error("Error in announcement_view_status API", err)
      await commonHelper.save_error_logs("users_announcements", err.message);
      return response.error(res, { data: {} });
    }
  }
  /** get app languages */
  public async appLanguage(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      let data: any = await Models.AppLanguagesModel.findAll({
        attributes: ["name", "code", "image"],
        where: { status: "1" }
      })
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].SUCCESS,
        data: data
      });
    } catch (err: any) {
      console.error("Error in user > app_language", err)
      await commonHelper.save_error_logs("user_app_language", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG
        },
      });
    }
  }

  public async getWalletBalance(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      let coin_id = req.body.coin_id;
      let address = req.body.address;

      let coinData: any = await coin_queries.coin_find_one(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address", "token_type"], { coin_id });
      if (coinData) {
        let balDetails: any = await global_helper.get_wallet_balance(coinData, address);
        let balance: string = "0";
        if (balDetails.status) {
          balance = balDetails.balance;
        }

        return response.success(res, {
          data: {
            code: GlblCode.SUCCESS,
            status: true,
            balance
          }
        });
      }
      throw new Error(language[lang].CATCH_MSG);

    } catch (error) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }


  public async getTransactionStatus(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      let transaction = await userhelper.get_confirmation_status(req.body.txid, req.body.coin_symbol)
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].SUCCESS,
        data: transaction
      });
    } catch (error) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }

  public async get_balnce_of_tokens(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      const { address,coin_family }: { address: string,coin_family:any  } = req.body;
      let addressValidity: any = await global_helper.validate_address(address, coin_family);
      if (!addressValidity) throw new Error(`${language[lang].INVALID_ADDRESS}`);

      let coinData: any = await coin_queries.coin_find_one(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address", "token_type"], { coin_family: coin_family, is_token: 0 })

      if(coinData){
          // balance of coin
          let balDetails: any = await global_helper.get_wallet_balance(coinData, address);
          let balance: string = "0";
          if (balDetails.status) {
              balance = balDetails.balance;
          }

          return res.status(GlblCode.SUCCESS).send({
            status: true,
            code: GlblCode.SUCCESS,
            message: language[lang].SUCCESS,
            data: balance
          });

        }

    
    } catch (error) {
      return response.error(res, {
        data: {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].CATCH_MSG
        }
      });
    }
  }
}

export const userController = new UserController();
