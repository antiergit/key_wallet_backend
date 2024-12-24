// import { Request, Response, NextFunction } from "express";
// import jwtHelper from "../../helpers/common/jwt";
// import response from "../../helpers/response/response.helpers";
// var CryptoJS = require("crypto-js");
// import { config } from "../../config";
// import { GlblMessages } from "../../constants/global_enum";

// class AUTHVerify {
//   public async verifyToken(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { token, refreshToken }: { token: string, refreshToken: string } = req.body;
//       let Jwt: any = CryptoJS.AES.decrypt(token, config.ENCRYPT_SECRET);
//       let decryptJwt: any = Jwt.toString(CryptoJS.enc.Utf8);
//       let Refresh: any = CryptoJS.AES.decrypt(refreshToken, config.ENCRYPT_SECRET);
//       let decryptRefresh: any = Refresh.toString(CryptoJS.enc.Utf8);
//       if (decryptJwt && decryptRefresh) {
//         const bearerToken: any = decryptJwt.split(" ")[1];
//         const refreshToken: any = decryptRefresh.split(" ")[1];
//         const decodedDataJWT: any = jwtHelper.decodeToken(bearerToken);
//         const decodedDataRefresh: any = jwtHelper.decodeRefreshToken(refreshToken);
//         if (
//           decodedDataJWT &&
//           decodedDataRefresh &&
//           decodedDataJWT.userId == decodedDataRefresh.userId
//         ) {
//           req.userId = parseInt(decodedDataJWT.userId);
//         } else {
//           return response.error(res, {
//             data: {
//               message: GlblMessages.UNABLE_DECODE_DATA,
//               data: {},
//             },
//           });
//         }
//         next();
//       } else {
//         return response.error(res, {
//           data: {
//             message: GlblMessages.NO_TOKEN_DETECTED,
//             data: {},
//           },
//         });
//       }
//     } catch (err: any) {
//       console.error("Error in verifyToken ", err)
//       return response.error(res, {
//         data: {
//           message: GlblMessages.UNAUTHORIZED,
//           data: err,
//         },
//       });
//     }
//   };
// }
// const authVerification = new AUTHVerify();
// export default authVerification;
