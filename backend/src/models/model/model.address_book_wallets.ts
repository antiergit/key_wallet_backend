import { DataTypes, Model, Optional } from "sequelize";
import { AddressBookWalletInterface } from "../interface/interface.address_book_wallets";
import db from "../../helpers/common/db";
import AddressBookModel from "./model.address_book";
// import { Coins } from "../../constants";
import CoinsModel from "./model.coins";

interface AddressBookCreationModel extends Optional<AddressBookWalletInterface, "id"> { }
interface AddressBookWalletInstance
    extends Model<AddressBookWalletInterface, AddressBookCreationModel>,
    AddressBookWalletInterface { }

const dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    address_book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    coin_family: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
};

const AddressBookWalletModel = db.db_write.define<AddressBookWalletInstance>("address_books_wallets", dataObj);
AddressBookModel.hasMany(AddressBookWalletModel, { foreignKey: "address_book_id", sourceKey: "id", as: "wallet_data" })
AddressBookWalletModel.belongsTo(CoinsModel, { foreignKey: "coin_family", targetKey: "coin_family", as: "coin_data" })
AddressBookWalletModel.belongsTo(AddressBookModel, { foreignKey: "address_book_id", targetKey: "id", as: "book_data" })

export default AddressBookWalletModel;


