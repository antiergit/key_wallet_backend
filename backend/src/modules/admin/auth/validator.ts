import { Joi } from 'express-validation';

export default class adminValidator {
    static login = {
        body: Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    }
    static googleAuthEnabledisable = {
        body: Joi.object({
            googleSecretKey: Joi.string().required(),
            password: Joi.string().required(),
            action: Joi.number().required(),
            token: Joi.string().required()
        })
    }
    static google2faVerify = {
        body: Joi.object({
            token: Joi.string().required()
        })
    }
    static changePassword = {
        body: Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
            confirmPassword: Joi.string().required()

        })
    }
}