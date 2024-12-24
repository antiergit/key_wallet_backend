import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import { GlblBooleanEnum, GlblCode, GlblMessages } from "../../../constants/global_enum";
import { language } from "../../../constants";
import { adminErrQueries, adminQueries } from "../../../helpers/dbHelper";
import { Messages } from './enum';
import bcrypt from 'bcryptjs';
import redisClient from "../../../helpers/common/redis";
import { config } from "../../../config";
import jwtHelper from "../../../helpers/common/jwt";
import speakeasy from 'speakeasy';
import QRCode from "qrcode";
import adminMiddleware from "../middleware";

class AuthController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }

    public async login(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("Entered into login of admin")
            let { email, password }: { email: string, password: string } = req.body;

            let checkEmailExist: any = await adminQueries.adminFindOne(
                ["id", "email", "password", "login_status"],
                { email: email, active: 1 },
                [['id', 'DESC']]);

            if (!checkEmailExist) {

                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.NO_EMAIL_EXIST,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                });
            }

            let checkPassword: any = await bcrypt.compare(
                password,
                checkEmailExist.password
            );

            if (checkPassword == false) {
                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.INCORRECT_PASS,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                });
            }
            if (checkEmailExist.login_status == 1) {
                console.log("delete old login token")
                await redisClient.delKey(config.ADMIN_TOKEN, (checkEmailExist.email).toUpperCase())
            }

            let jwtToken: any = await jwtHelper.create_json_web_token(checkEmailExist.id);

            await adminQueries.adminUpdate(
                { login_status: GlblBooleanEnum.true, jwt_token: jwtToken },
                { id: checkEmailExist.id });

            await redisClient.set_hash_table(config.ADMIN_TOKEN, checkEmailExist.email, jwtToken)

            let adminData: any = await adminQueries.adminFindOne(
                ["id", "username", "email", "mobile_no", "google2fa_secret", "google2fa_status", "login_status", "jwt_token"],
                { id: checkEmailExist.id, active: 1 },
                [['id', 'DESC']]);

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: adminData
            });

        } catch (err: any) {
            console.error("Error in login of admin", err);
            await adminErrQueries.adminErrLogsCreate({ fx_name: "admin_login", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }

    };

    public async logout(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            await adminQueries.adminUpdate(
                { login_status: GlblBooleanEnum.false },
                { id: req.body.adminId });

            console.log("user_email>>>", req.body.user_email)

            await redisClient.delKey(config.ADMIN_TOKEN, req.body.user_email)

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: Messages.LOGOUT
            });

        } catch (err: any) {
            console.error("Error in admin logout API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "admin_logout", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async googleAuthStatus(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const adminId: number = req.body.adminId;

            let getStatus: any = await adminQueries.adminFindOne(
                ["google2fa_status"],
                { id: adminId, active: 1 },
                [['id', 'DESC']]);

            if (getStatus) {
                return res.status(GlblCode.SUCCESS).send({
                    message: GlblMessages.SUCCESS,
                    status: true,
                    code: GlblCode.SUCCESS,
                    data: getStatus.google2fa_status
                });
            }
            else {
                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.AUTH_FAILED,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                });
            }

        } catch (err: any) {
            console.error("Error in googleAuthStatus API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "googleAuthStatus", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async googleAuthSecretkey(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            let label: string = "Novatide Admin";
            const adminId: number = req.body.adminId;
            let secretKey: string;
            if (req.body.adminDetails.google2fa_secret != null) {
                secretKey = req.body.adminDetails.google2fa_secret;
            } else {
                let secret: any = speakeasy.generateSecret({ length: 20 });
                secretKey = secret.base32;
                await adminQueries.adminUpdate(
                    { google2fa_secret: secretKey },
                    { id: adminId }
                );
            }
            let url: any = await speakeasy.otpauthURL({
                secret: secretKey,
                encoding: 'base32',
                label: label,
                algorithm: "sha1",
            });

            return QRCode.toDataURL(url, function (err: any, image_data: any) {
                return res.status(GlblCode.SUCCESS).send({
                    message: GlblMessages.SUCCESS,
                    status: true,
                    code: GlblCode.SUCCESS,
                    data: { google_secret_key: secretKey, qr_code: image_data, google2fa_status: req.body.adminDetails.google2fa_status }
                });
            });

        } catch (err: any) {
            console.error("Error in googleAuthSecretkey API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "googleAuthSecretkey", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async googleAuthEnabledisable(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            let data: any;
            const adminId: number = req.body.adminId;
            const { password, action, token, googleSecretKey }: { password: string, action: number, token: string, googleSecretKey: string } = req.body;
            console.log("req googleSecretKey", googleSecretKey)

            let adminData: any = await adminQueries.adminFindOne(
                ["password", "google2fa_secret"],
                { id: adminId, active: 1 },
                [['id', 'DESC']]);

            let msg = action == GlblBooleanEnum.true ? "Google Auth Enabled." : "Google Auth Disabled.";
            let checkPassword: any = await bcrypt.compare(
                password,
                adminData.password
            );
            if (checkPassword == false) {
                data = {
                    message: Messages.INCORRECT_PASS,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
                return res.status(data.code).send(data);
            }
            let secretBase32: any = adminData.google2fa_secret;
            let verified: any = speakeasy.totp.verify({
                secret: secretBase32,
                encoding: 'base32',
                token: token,
                window: 2,
                algorithm: "sha1"
            });
            if (typeof verified === "undefined") {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                }
            } else if (verified === null) {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            } else if (verified == false) {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            } else if (verified == true) {
                await adminQueries.adminUpdate(
                    { google2fa_status: action },
                    { id: adminId });
                data = {
                    message: GlblMessages.SUCCESS,
                    status: true,
                    code: GlblCode.SUCCESS,
                    data: msg
                };
            } else {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            }
            return res.status(data.code).send(data);
        } catch (err: any) {
            console.error("Error in googleAuthEnabledisable API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "googleAuthEnabledisable", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async google2faVerify(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { token }: any = req.body;

            let adminData: any = await adminQueries.adminFindOne(
                ["id", "username", "email", "google2fa_status", "google2fa_secret"],
                { id: req.body.adminId, active: 1 },
                [['id', 'DESC']]);

            let data: any;
            let secretBase32: any = adminData.google2fa_secret;
            var verified: any = speakeasy.totp.verify({
                secret: secretBase32,
                encoding: 'base32',
                token: token,
                window: 2,
                algorithm: "sha1"
            });
            if (typeof verified === "undefined") {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            } else if (verified === null) {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            } else if (verified == false) {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            } else if (verified == true) {
                let jwt_token: string = await adminMiddleware.generateToken(adminData.id);
                let final_data = { id: adminData.id, user: adminData.username, email: adminData.email, token: jwt_token, google2fa_status: adminData.google2fa_status }

                data = {
                    message: GlblMessages.SUCCESS,
                    status: true,
                    code: GlblCode.SUCCESS,
                    data: final_data
                };

            } else {
                data = {
                    message: Messages.INVALID_2FA,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                };
            }
            return res.status(data.code).send(data);
        } catch (err: any) {
            console.error("Error in google2faVerify API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "google2faVerify", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async changePassword(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { oldPassword, newPassword, confirmPassword }: { oldPassword: string, newPassword: string, confirmPassword: string } = req.body;

            if (newPassword != confirmPassword) {
                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.INVALID_OLD_PASS,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                });
            }
            const adminId: number = req.body.adminId;
            const encryptedPassword: string = await bcrypt.hash(newPassword, 10);
            let adminPassword: any = await adminQueries.adminFindOne(
                ["password"],
                { id: adminId, active: 1 },
                [['id', 'DESC']]);

            let checkPassword: any = await bcrypt.compare(
                oldPassword,
                adminPassword.password
            );

            if (checkPassword == false) {
                return res.status(GlblCode.ERROR_CODE).send({
                    message: Messages.INVALID_OLD_PASS,
                    status: false,
                    code: GlblCode.ERROR_CODE,
                    data: {}
                });
            }
            await adminQueries.adminUpdate({ password: encryptedPassword }, { id: adminId })

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: Messages.PASSWORD_CHANGED
            });
        } catch (err: any) {
            console.error("Error in changePassword API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "changePassword", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async encryptPassowrd(req: Request, res: Response) {
        try {
            const { password }: { password: string } = req.body;
            const newPassword: string = await bcrypt.hash(password, 10);
            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: newPassword
            });
        } catch (err: any) {
            console.error("Error in encryptPassowrd API", err)
            return res.status(GlblCode.ERROR_CODE).send({
                message: GlblMessages.CATCH_MSG,
                status: false,
                code: GlblCode.ERROR_CODE,
                data: {}
            });
        }
    }
}

export const authController = new AuthController();
