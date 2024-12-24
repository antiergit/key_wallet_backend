import { Joi } from 'express-validation';

export default class user_validator {
    static createWalletValidate = {
        body: Joi.object({
            wallet_address: Joi.string().required(),
            device_token: Joi.string().required(),
            wallet_name: Joi.string().required(),
            addressList: Joi.array().required(),
            referral_code: Joi.string().allow(null, '').optional(),
            device_id: Joi.string().allow(null, '').optional(),
            fiat_currency: Joi.string().allow(null, '').optional(),
            lang: Joi.string().allow(null, '').optional()
        })
    }
    static logoutValidate = {
        body: Joi.object({
            deviceToken: Joi.string().required(),
            deviceId: Joi.string().optional(),
            userIds: Joi.array().optional(),
            makerUserIds: Joi.array().optional()
        })
    }
    static notificationListValidate = {
        body: Joi.object({
            limit: Joi.number().optional(),
            page: Joi.number().optional(),
            addrsListKeys: Joi.array().required(),
            coin_family: Joi.array().required(),
        })
    }
    static addAddressBookValidate = {
        body: Joi.object({
            contact_name: Joi.string().required(),
            wallet_address: Joi.string().required(),
            address: Joi.string().required(),
            coin_family: Joi.number().required(),
            wallet_name: Joi.string().allow(null, '').optional(),
        })
    }
    static pageListValidate = {
        body: Joi.object({
            limit: Joi.number().required(),
            page: Joi.number().required(),
            address: Joi.array().required(),
            coin_family: Joi.array().optional(),
            search: Joi.string().allow(null, '').optional(),
        })
    }
    static getWalletName = {
        body: Joi.object({
            contact_name: Joi.string().required(),
            coin_family: Joi.number().optional(),
            wallet_name: Joi.string().allow(null, '').optional(),
            address: Joi.string().required(),
        })
    }
    static search = {
        body: Joi.object({
            search: Joi.string().allow(null, '').optional(),
        })
    }
    static deleteAddressBookWalletAddress = {
        body: Joi.object({
            id: Joi.number().required(),
            address_book_id: Joi.number().required()
        })
    }
    static deleteAddressBook = {
        body: Joi.object({
            id: Joi.number().required(),
        })
    }
    static announcementViewStatus = {
        body: Joi.object({
            key: Joi.number().required(),
            addrsListKeys: Joi.array().required()
        })
    }
}