import { DataTypes, Model, Optional } from "sequelize";
import { MakerTrnxRequestInterface } from "../interface/index";
import db from "../../helpers/common/db";

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
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
};
const MakerTrnxRequestsModelWrite = db.db_write.define<MakerTrnxRequestInstance>('maker_trnx_requests', dataObj);
const MakerTrnxRequestsModelRead = db.db_read.define<MakerTrnxRequestInstance>('maker_trnx_requests', dataObj);

export const MakerTrnxRequestsModel = {
    MakerTrnxRequestsModelWrite: MakerTrnxRequestsModelWrite,
    MakerTrnxRequestsModelRead: MakerTrnxRequestsModelRead,
};