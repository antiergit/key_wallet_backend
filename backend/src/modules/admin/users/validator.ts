import { Joi } from 'express-validation';

export default class userValidator {
    static getUsersListByCoinFamily = {
        body: Joi.object({
            coinFamily: Joi.number().required(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            search: Joi.string().allow(null, '').optional()
        })
    }

}