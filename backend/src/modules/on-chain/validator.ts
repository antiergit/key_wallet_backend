import { Joi } from 'express-validation';

export default class user_validator {
    static swap = {
        body: Joi.object({
            chain_id: Joi.number().required(),
            src: Joi.string().required(),
            dst: Joi.string().required(),
            amount: Joi.string().required(),
            from: Joi.string().required(),
            slippage: Joi.number().required(),
            fee: Joi.number().allow().optional(),
            referrer: Joi.string().allow().optional(),
            mainRouteParts: Joi.number().allow().optional(),
            parts: Joi.number().allow().optional()
        })
    }
    static quote = {
        body: Joi.object({
            chain_id: Joi.number().required(),
            src: Joi.string().required(),
            dst: Joi.string().required(),
            amount: Joi.string().required(),
            fee: Joi.number().allow().optional()
        })
    }
    static approval = {
        body: Joi.object({
            chain_id: Joi.number().required(),
            tokenAddress: Joi.string().required(),
            amount: Joi.string().allow().required()
        })
    }
    static spender = {
        body: Joi.object({
            chain_id: Joi.number().required()
        })
    }
    static allowance = {
        body: Joi.object({
            chain_id: Joi.number().required(),
            tokenAddress: Joi.string().required(),
            walletAddress: Joi.string().required()
        })
    }
    static tokens = {
        body: Joi.object({
            chain_id: Joi.number().required()
        })
    }
}