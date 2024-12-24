import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class AddressBookWalletQueries {

    public async address_book_wallets_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.AddressBookWalletsModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_book_wallets_find_one>>", err)
            await commonHelper.save_error_logs("address_book_wallets_find_one", err.message);
            throw err;
        }
    }
    public async address_book_wallets_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.AddressBookWalletsModel.findAll({
                attributes: attr,
                where: where_clause,
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_book_wallets_find_all>>", err)
            await commonHelper.save_error_logs("address_book_wallets_find_all", err.message);
            throw err;
        }
    }
    public async address_book_wallet_get_count(where_clause: any) {
        try {
            let data: number = await Models.AddressBookWalletsModel.count({
                where: where_clause
            });
            return data;
        } catch (err: any) {
            console.error("Error in address_book_get_count>>", err)
            await commonHelper.save_error_logs("address_book_get_count", err.message);
            throw err;
        }
    }
    public async address_book_wallet_create(obj: any) {
        try {
            let data: any = await Models.AddressBookWalletsModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in address_book_wallet_create>>", err)
            await commonHelper.save_error_logs("address_book_wallet_create", err.message);
            throw err;
        }
    }
    public async address_book_wallet_destroy(where_clause: any) {
        try {
            await Models.AddressBookWalletsModel.destroy({ where: where_clause })
        } catch (err: any) {
            console.error("Error in address_book_wallet_destroy>>", err)
            await commonHelper.save_error_logs("address_book_wallet_destroy", err.message);
            throw err;
        }
    }

    // Joint
    public async address_book_wallets_with_address_book(attr1: any, attr2: any, where1: any, where2: any) {
        try {
            let data: any = await Models.AddressBookWalletsModel.findOne({
                attributes: attr1,
                where: where1,
                include:
                    [{
                        model: Models.AddressBookModel,
                        attributes: attr2,
                        where: where2,
                        required: true,
                        as: 'book_data'
                    }]
            });
            return data;
        } catch (err: any) {
            console.error("Error in address_book_wallets_with_address_book>>", err)
            await commonHelper.save_error_logs("address_book_wallets_with_address_book", err.message);
            throw err;
        }
    }

}

const address_book_wallet_queries = new AddressBookWalletQueries();
export default address_book_wallet_queries;
