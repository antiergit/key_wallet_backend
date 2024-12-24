import { Request, Response, NextFunction } from "express";
import jwtHelper from '../../helpers/common/jwt';
var CryptoJS = require("crypto-js");
import { config } from "../../config";
import redisClient from "../../helpers/common/redis";
import { GlblCode, GlblMessages } from './../../constants/global_enum';
import { Messages } from "./auth/enum";
import { adminQueries } from "../../helpers/dbHelper";
import jwt from 'jsonwebtoken';
import commonHelper from "../../helpers/common/common.helpers";


class AdminMiddleware {
    public async checkLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const encryptedJWT: any = req.headers["authorization"];

            let Jwt: any = CryptoJS.AES.decrypt(encryptedJWT, config.ENCRYPT_SECRET);
            let bearerHeader: any = Jwt.toString(CryptoJS.enc.Utf8);

            if (typeof bearerHeader !== "undefined") {
                const bearerToken: string = bearerHeader.split(" ")[1];

                console.log("encryptedJWT>>", encryptedJWT)

                if (jwtHelper.verify(bearerToken)) {

                    const decodedData: any = jwtHelper.decodeToken(bearerToken);

                    req.body.adminId = parseInt(decodedData);

                    if (decodedData && req.body.adminId) {
                        let adminData: any = await adminQueries.adminFindOne(
                            ["id", "username", "email", "password", "mobile_no", "google2fa_secret", "google2fa_status", "jwt_token", "login_status", "jwt_token", "created_at", "updated_at"],
                            { id: req.body.adminId, active: 1 },
                            [['id', 'DESC']])

                        console.log("to uppercae>>>", (adminData.email).toUpperCase())
                        await redisClient.getKeyValuePair(config.ADMIN_TOKEN, (adminData.email).toUpperCase())

                        if (adminData) {
                            req.body.adminDetails = adminData;
                            req.body.user_email = adminData.email;
                        } else {
                            return res.status(GlblCode.ERROR_CODE).send({
                                message: Messages.UNABLE_DECODE,
                                status: false,
                                code: GlblCode.ERROR_CODE,
                                data: [],
                            });
                        }
                    } else {
                        return res.status(GlblCode.ERROR_CODE).send({
                            message: Messages.UNABLE_DECODE,
                            status: false,
                            code: GlblCode.ERROR_CODE,
                            data: [],
                        });
                    }
                } else {
                    return res.status(GlblCode.INVALID_TOKEN).send({
                        message: GlblMessages.INVALID_TOKEN,
                        status: false,
                        code: GlblCode.INVALID_TOKEN,
                        data: [],
                    });
                }
                next();
            } else {
                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.TOKEN_NOT_FOUND,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: [],
                });
            }
        } catch (err: any) {
            console.error("Error in checkLogin of admin", err)
            return res.status(GlblCode.INVALID_TOKEN).send({
                message: GlblMessages.INVALID_TOKEN,
                status: false,
                code: GlblCode.INVALID_TOKEN,
                data: {},
            });
        }
    }

    public async generateToken(user_id: number) {
        try {
            const token: any = jwt.sign({ user_id: user_id }, config.JWT_SECRET, { expiresIn: "30d" });
            const set_token: string = `JWT ${token}`
            const encrypt_token: any = await commonHelper.encryptDataRSA(set_token);
            return encrypt_token;
        } catch (err: any) {
            console.error("Error in generateToken.", err)
            throw err;
        }
    }

}

const adminMiddleware = new AdminMiddleware();
export default adminMiddleware;
