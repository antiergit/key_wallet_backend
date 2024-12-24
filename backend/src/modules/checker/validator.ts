import { Joi } from 'express-validation';

export default class CheckerValidator {
    static refreshCode = {
        body: Joi.object({
            walletId: Joi.array().required()
        })
    }
    static updateStatus = {
        body: Joi.object({
            status: Joi.number().required(),
            id: Joi.number().required(), // 1 = access request id , 2 = trnx request id
            type: Joi.number().required() // 1 = access request , 2 = trnx request
        })
    }
}