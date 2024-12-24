import { DataTypes, Model, Optional } from "sequelize";
import { MakerTrnxRequestInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import CoinsModel from "./model.coins";
import MakerWalletsModel from "./model.maker_wallets";
import WalletModel from "./model.wallets";

interface MakerTrnxRequestCreationModel
    extends Optional<MakerTrnxRequestInterface, "id"> { }
interface MakerTrnxRequestInstance
    extends Model<MakerTrnxRequestInterface, MakerTrnxRequestCreationModel>,
    MakerTrnxRequestInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    maker_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    coin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    from_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    to_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    crypto_amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    wallet_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    trnx_fee: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_one_amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_one: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    token_second: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    saved_slippage: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gasless_toggle: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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



const MakerTrnxRequestsModel = db.db_write.define<MakerTrnxRequestInstance>(
    "maker_trnx_requests",
    dataObj
);

MakerTrnxRequestsModel.belongsTo(MakerWalletsModel, {
    foreignKey: 'maker_user_id',
    targetKey: "id",
    as: "maker_request_wallet_data"
})

MakerTrnxRequestsModel.belongsTo(CoinsModel, {
    foreignKey: 'coin_id',
    targetKey: "coin_id",
    as: "maker_request_coins_data"
})
MakerTrnxRequestsModel.belongsTo(WalletModel, {
    foreignKey: 'coin_id',
    targetKey: "coin_id",
    as: "maker_request_backend_wallet_data"
})


export default MakerTrnxRequestsModel;