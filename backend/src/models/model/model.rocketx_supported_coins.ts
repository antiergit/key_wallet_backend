import { DataTypes, Model, Optional } from "sequelize";
import { RocketxSupportedCoinsInterface } from "../index"; 
import db from "../../helpers/common/db";

interface RocketxSupportedCoinsModel extends Optional<RocketxSupportedCoinsInterface, "id"> { }

interface RocketxSupportedCoinsInstance
    extends Model<RocketxSupportedCoinsInterface, RocketxSupportedCoinsModel>,
    RocketxSupportedCoinsInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    rocketx_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token_symbol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    coin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rocketx_coin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    icon_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    enabled: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_custom: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_native_token: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    contract_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    network_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_decimals: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    chain_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    walletless_enabled: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    buy_enabled: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sell_enabled: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

const RocketxSupportedCoinsModel = db.db_write.define<RocketxSupportedCoinsInstance>(
    "rocketx_supported_coins",
    dataObj
);

export default RocketxSupportedCoinsModel;
