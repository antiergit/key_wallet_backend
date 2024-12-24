import { DataTypes, Model, Optional } from "sequelize";
import { ChangellySupportedCrossChainCoinsInterface } from "../interface/index";
import db from "../../helpers/common/db";
interface ChangellySupportedCrossChainCoinsModel extends Optional<ChangellySupportedCrossChainCoinsInterface, "id"> { }
interface ChangellySupportedCrossChainCoinsInstance
    extends Model<ChangellySupportedCrossChainCoinsInterface, ChangellySupportedCrossChainCoinsModel>,
    ChangellySupportedCrossChainCoinsInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coin_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    coin_family: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_token: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ticker: {
        type: DataTypes.STRING,
        allowNull: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    enabled: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: true
    },
    enabled_from: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: true
    },
    enabled_to: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: true
    },
    fix_rate_enabled: {
        type: DataTypes.ENUM("true", "false"),
        allowNull: true
    },
    payin_confirmations: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    address_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fixed_time: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    contract_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blockchain: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blockchain_precision: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
};

const ChangellySupportedCrossChainCoinsModelRead = db.db_read.define<ChangellySupportedCrossChainCoinsInstance>(
    "changelly_supported_cross_chain_coins",
    dataObj
);
const ChangellySupportedCrossChainCoinsModelWrite = db.db_write.define<ChangellySupportedCrossChainCoinsInstance>(
    "changelly_supported_cross_chain_coins",
    dataObj
);


export const ChangellySupportedCrossChainCoinsModel = {
    ChangellySupportedCrossChainCoinsModelRead: ChangellySupportedCrossChainCoinsModelRead,
    ChangellySupportedCrossChainCoinsModelWrite: ChangellySupportedCrossChainCoinsModelWrite,
};

