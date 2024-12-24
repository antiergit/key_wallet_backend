import { Joi } from 'express-validation';

export default class commissionValidator {

    static commissionDetails = {
        body: Joi.object({
            type: Joi.number().required(),
            value: Joi.string().required()
        })
    }


}