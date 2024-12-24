import { Joi } from 'express-validation';

export default class changellyValidator {
    static coins = {
        body: Joi.object({
            search: Joi.string().allow(null, '').optional(),
            coinFamily: Joi.number().optional(),
            getPairsFor: Joi.string().allow(null, '').optional(),
            fiatType: Joi.string().required(),
            addressListKeys: Joi.array().required()
        })
    }
    static minAmount = {
        body: Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            amountFrom: Joi.string().required(),
            fiatType: Joi.string().required(),
            coinIds: Joi.array().required(),
            fromCryptoSymbol: Joi.string().required()
        })
    }
    static createTransaction = {
        body: Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            amountFrom: Joi.string().required(),
            fromAddress: Joi.string().required(),
            toAddress: Joi.string().required()
        })
    }
    static onOffRampListing = {
        body: Joi.object({
            fiatType: Joi.string().required(),
            addressListKeys: Joi.array().required()
        })
    }

    static onOffRampListing2 = {
        body: Joi.object({
            fiatType: Joi.string().required(),
            addressListKeys: Joi.array().required(),
            coinFamilies: Joi.array().required()
        })
    }

    static onOffRampGetOffers = {
        body: Joi.object({
            type: Joi.string().required(),
            currencyFrom: Joi.string().required(),
            currencyTo: Joi.string().required(),
            amountFrom: Joi.string().required(),
            country: Joi.string().required(),
            state: Joi.string().allow(null, '').optional()
        })
    }
    static createOrder = {
        body: Joi.object({
            type: Joi.string().required(),
            providerCode: Joi.string().required(),
            currencyFrom: Joi.string().required(),
            currencyTo: Joi.string().required(),
            amountFrom: Joi.string().required(),
            country: Joi.string().required(),
            state: Joi.string().allow(null, '').optional(),
            recipientWalletAddress: Joi.string().required(),
            paymentMethod: Joi.string().required()

        })
    }
}