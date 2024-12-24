import { Joi } from 'express-validation';

export default class wallet_validator {
    
    static addTokenValidate = {
        body: Joi.object({
            name: Joi.string().required(),
            symbol: Joi.string().required(),
            coin_gicko_alias: Joi.string().required(),
            decimals: Joi.string().required(),
            token_address: Joi.string().required(),
            coin_family: Joi.number().required(),
            wallet_address: Joi.string().required(),
            coin_gicko_id: Joi.string().allow(null, '').optional(),
            wallet_name: Joi.string().allow(null, '').optional(),
            isSwapList: Joi.bool().required(),
            token_type: Joi.string().required()
        })
    }
    static portfolioValidate = {
        body: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            coin_family: Joi.array().required(),
            search: Joi.string().allow(null, '').optional(),
            addressListKeys: Joi.array().required(),
            fiat_type: Joi.string().required()
        })
    }
    static activeInactiveWallet = {
        body: Joi.object({
            coinId: Joi.number().required(),
            walletAddress: Joi.string().required(),
            isActive: Joi.number().required()
        })
    }
    static toggleCoinListValidate = {
        body: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            coinFamilyKeys: Joi.array().required(),
            search: Joi.string().allow(null, '').optional(),
            addrsListKeys: Joi.array().required(),
            currency_code: Joi.string().required(),
        })
    }
    static transactionListValidate = {
        body: Joi.object({
            addrsListKeys: Joi.array().required(),
            fiat_currency: Joi.string().allow(null, '').optional(),
            search: Joi.string().optional(),
            limit: Joi.number().optional(),
            page: Joi.number().optional(),
            coin_id: Joi.number().optional(),
            status: Joi.string().allow(null, '').optional(),
            date_from: Joi.string().allow(null, '').optional(),
            date_to: Joi.string().allow(null, '').optional(),
            trnx_type: Joi.string().allow(null, '').optional(),
            coin_family: Joi.array().required(),
            ///////////////////////////////////
            coin_type: Joi.string().allow(null, '').optional(),
            from_date: Joi.string().allow(null, '').optional(),
            to_date: Joi.string().allow(null, '').optional(),
        })
    }
    static searchTokenValidate = {
        body: Joi.object({
            tokenAddress: Joi.string().required(),
            coinFamily: Joi.number().required(),
        })
    }
    static swapListValidate = {
        body: Joi.object({
            coin_family: Joi.array().required(),
            addrsListKeys: Joi.array().required(),
            fiat_type: Joi.string().required()
        })
    }
    static updateWatchlistValidate = {
        body: Joi.object({
            data: Joi.array().optional()
        })
    }
    static getWatchlistValidate = {
        body: Joi.object({
            fiat_type: Joi.string().required(),
            search: Joi.string().allow(null, '').optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            wallet_address: Joi.array().required(),
            is_fav: Joi.number().optional(),
            coin_family: Joi.array().required(),
        })
    }
    static checkFiatBalance = {
        body: Joi.object({
            coin_family: Joi.number().required(),
            fiat_currency: Joi.string().required(),
            coin_symbol: Joi.string().required()
        })
    }
    static allBalances = {
        body: Joi.object({
            makerUserIds: Joi.array().required(),
            checkerUserIds: Joi.array().required(),
            fiatType: Joi.string().required()
        })
    }

}