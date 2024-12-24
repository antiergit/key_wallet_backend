import commonHelper from "../common/common.helpers";
import * as Models from '../../models/model/index';


class AddressBookQueries {

    public async address_books_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.AddressBookModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_books_find_one>>", err)
            await commonHelper.save_error_logs("address_books_find_one", err.message);
            throw err;
        }
    }
    public async address_books_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.AddressBookModel.findAll({
                attributes: attr,
                where: where_clause,
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_books_find_all>>", err)
            await commonHelper.save_error_logs("address_books_find_all", err.message);
            throw err;
        }
    }
    public async address_book_create(obj: any) {
        try {
            let data: any = await Models.AddressBookModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in address_book_create>>", err)
            await commonHelper.save_error_logs("address_book_create", err.message);
            throw err;
        }
    }
    public async address_book_count(where_clause: any) {
        try {
            let data: any = await Models.AddressBookModel.count({
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_book_count>>", err)
            await commonHelper.save_error_logs("address_book_count", err.message);
            throw err;
        }
    }
    public async address_book_destroy(where_clause: any) {
        try {
            await Models.AddressBookModel.destroy({ where: where_clause })
        } catch (err: any) {
            console.error("Error in address_book_destroy>>", err)
            await commonHelper.save_error_logs("address_book_destroy", err.message);
            throw err;
        }
    }

    // Joint
    public async address_book_with_address_book_wallet_coins_joint(attr1: any, attr2: any, where_clause2: any, attr3: any, where_clause3: any, where_clause1: any, per_page: any, offset: any, set_order_by: any, set_order_type: any) {
        try {
            let data: any = await Models.AddressBookModel.findAll({
                attributes: attr1,
                include: [{
                    model: Models.AddressBookWalletsModel,
                    attributes: attr2,
                    as: "wallet_data",
                    where: where_clause2,
                    include: [{
                        model: Models.CoinsModel,
                        as: "coin_data",
                        attributes: attr3,
                        where: where_clause3,
                        required: false,
                    }]
                }],
                where: where_clause1,
                limit: per_page,
                offset: offset,
                order: [[set_order_by, set_order_type]]
            })
            return data;
        } catch (err: any) {
            console.error("Error in address_book_with_address_book_wallet_coins_joint>>", err)
            await commonHelper.save_error_logs("address_book_with_address_book_wallet_coins_joint", err.message);
            throw err;
        }
    }
}

const address_book_queries = new AddressBookQueries();
export default address_book_queries;
