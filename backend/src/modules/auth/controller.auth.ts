import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import jwtHelper from "../../helpers/common/jwt";
import { config } from "../../config";
import CryptoJS from "react-native-crypto-js";
// import redisClient from "../../helpers/common/redis";
import { GlblBooleanEnum, GlblCode, GlblMessages } from "../../constants/global_enum";
// import userhelper from "../user/helper";
// import * as Models from '../../models/model/index';
import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";


class AuthController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }

  public initialize() { }

  public async generateNewTokens(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body auth generateNewTokens >>>", req.body)
      let refreshToken: any = req.body.refreshToken;
      let Refresh: any = CryptoJS.AES.decrypt(
        refreshToken,
        config.ENCRYPT_SECRET || ""
      );
      let decryptRefresh: any = Refresh.toString(CryptoJS.enc.Utf8);
      const decryptRefresh1: any = decryptRefresh.split(" ")[1];
      let token: any = jwtHelper.decodeRefreshToken(decryptRefresh1);
      if (!token) {
        let data = {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].UNABLE_DECODE,
        };
        return res.status(data.code).send(data);
      }
      // let already_exist: any = await Models.JwtsModel.findOne({
      //   attributes: ["device_token_id", "token", "refresh"],
      //   where: {
      //     device_token_id: key_in_redis,
      //     token: req.body.token,
      //     refresh: req.body.refreshToken
      //   },
      //   raw: true
      // })
      // if(already_exist){
      let jwt_token: any = await jwtHelper.createJSONWebToken(Number(token.userId) || GlblBooleanEnum.false, token.device_token);
      let refreshToken1: any = await jwtHelper.createJSONRefreshToken(
        Number(token.userId) || GlblBooleanEnum.false,
        token.device_token
      );
      // await userhelper.setting_token_in_db(token.device_token, token.userId, jwt_token, refreshToken1)
      let data = {
        token: jwt_token,
        refreshToken: refreshToken1,
        code: GlblCode.SUCCESS,
        status: true,
        message: language[lang].SUCCESS
      };
      return res.status(data.code).send(data);
    } catch (err: any) {
      console.error("Error in generateNewTokens api.", err)
      await commonHelper.save_error_logs("auth_generateNewTokens", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG
      };
      return res.status(data.code).send(data);
    }
  };
}

export const authController = new AuthController();
