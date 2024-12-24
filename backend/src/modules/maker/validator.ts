import { Joi } from 'express-validation';

export default class MakerValidator {
    static createAccount = {
        body: Joi.object({
            walletName: Joi.string().required(),
            deviceId: Joi.string().required(),
            walletAddress: Joi.string().required(),
            checkerCode: Joi.string().required(),
            deviceToken: Joi.string().required(),
            coinFamily: Joi.number().required()
        })
    }
    static notifications = {
        body: Joi.object({
            limit: Joi.number().optional(),
            page: Joi.number().optional(),
            makerUserId: Joi.number().required()
        })
    }
    static getDetails = {
        body: Joi.object({
            makerUserIds: Joi.array().required(),
            status: Joi.number().optional()
        })
    }
    static getToken = {
        body: Joi.object({
            userId: Joi.number().required(),
            deviceToken: Joi.string().required(),
            makerUserIds: Joi.array().optional()
        })
    }
    static editDetails = {
        body: Joi.object({
            key: Joi.number().required(),
            value: Joi.string().required(),
            makerUserId: Joi.number().required()
        })
    }
    static makeTrnxRequest = {
        body: Joi.object({
            makerUserId: Joi.number().required(),
            coinId: Joi.number().required(),
            coinSymbol: Joi.string().allow('').required(),
            fromAddress: Joi.string().allow('').required(),
            toAddress: Joi.string().allow('').required(),
            cryptoAmount: Joi.string().allow('').required(),
            walletName: Joi.string().allow('').required(),

            trnxFee: Joi.number().required(),
            ////////////////////////////////////////////
            tokenOneAmount: Joi.string().optional(),
            tokenOne: Joi.object().optional(),
            tokenSecond: Joi.object().optional(),
            savedSlippage: Joi.number().optional(),
            gaslessToggle: Joi.boolean().optional(),
            type: Joi.string().optional()
        })
    }
}