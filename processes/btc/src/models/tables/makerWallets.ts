import { DataTypes, Model, Optional } from "sequelize";
import { MakerWalletInterface } from "../interfaces/index";
import db from "../../config/db";

interface MakerWalletCreationModel extends Optional<MakerWalletInterface, "id"> { }
interface MakerWalletInstance extends Model<MakerWalletInterface, MakerWalletCreationModel>, MakerWalletInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    device_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    wallet_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    coin_family: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    device_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fiat_currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    theme: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_login: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
};


const MakerWalletsModel = db.db_write.define<MakerWalletInstance>(
    "maker_wallets",
    dataObj
);


export default MakerWalletsModel;