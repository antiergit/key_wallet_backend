import { Joi } from 'express-validation';

export default class Swap_validator {
    static price_validate = {
        body: Joi.object({
            sellToken: Joi.string().required(),
            buyToken: Joi.string().required(),
            sellAmount: Joi.string().required(),
            takerAddress: Joi.string().required(),
            coinFamily: Joi.number().required()
        })
    }
    static quote_validate = {
        body: Joi.object({
            sellToken: Joi.string().required(),
            buyToken: Joi.string().required(),
            sellAmount: Joi.string().required(),
            takerAddress: Joi.string().required(),
            coinFamily: Joi.number().required()
        })
    }
   
    static swap_validate = {
        body: Joi.object({
            sellToken: Joi.string().required(),
            buyToken: Joi.string().required(),
            sellAmount: Joi.string().required(),
            takerAddress: Joi.string().required(),
            coinFamily: Joi.number().required()
        })
    }
}