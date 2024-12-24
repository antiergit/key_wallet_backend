import { Request, Response, NextFunction } from "express";
import jwtHelper from "../helpers/common/jwt";
import response from "../helpers/response/response.helpers";
var CryptoJS = require("crypto-js");
import { config } from "../config";
import userhelper from "../modules/user/helper";
import { language } from "../constants";

class JWTVerify {
   public async verifyToken(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      let lang: any = req.headers['content-language'] || 'en';
      try {
         const encryptedJWT: any = req.headers["authorization"];
         let Jwt: any = CryptoJS.AES.decrypt(encryptedJWT, config.ENCRYPT_SECRET);
         let bearerHeader: any = Jwt.toString(CryptoJS.enc.Utf8);
         if (typeof bearerHeader !== "undefined") {
            const bearerToken: string = bearerHeader.split(" ")[1];
            const decodedData: any = jwtHelper.decodeToken(bearerToken);

            if (jwtHelper.verify(bearerToken)) {
               // next();
            } else {
               let currentTimestamp: any = new Date().getTime() / 1000;
               let tokenIsExpired: any = decodedData.exp < currentTimestamp;
               if (decodedData && tokenIsExpired) {
                  return response.error(res, {
                     data: {
                        code: 409,
                        message: language[lang].SESSION_EXPIRED,
                        data: {},
                     },
                  });
               } else {
                  return response.error(res, {
                     data: {
                        message: language[lang].SESSION_EXPIRED,
                        data: {},
                     },
                  });
               }
            }
            console.log("decodedData decodedData :", decodedData);
            req.device_token = decodedData.device_token
            if (decodedData && decodedData.userId) {
               req.userId = parseInt(decodedData.userId);
               // next();
            } else {
               req.userId = parseInt(decodedData.userId);
               // next()
               // return response.error(res, {
               //    data: {
               //       message: "Unable to decode data",
               //       data: {},
               //    },
               // });
            }
            next();
         } else {
            return response.error(res, {
               data: {
                  message: language[lang].NO_TOKEN,
                  data: {},
               },
            });
         }
      } catch (err: any) {
         console.error("ERROR IN JWT VERIFY")
         return response.error(res, {
            data: {
               message: language[lang].UNAUTHORIZED_ACCESS,
               data: err,
            },
         });
      }
   }
}

const jwtVerification = new JWTVerify();
export default jwtVerification;
