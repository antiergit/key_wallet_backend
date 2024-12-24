import { DataTypes, Model, Optional } from "sequelize";
import { MakerCheckerNotificationsInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import MakerTrnxRequestsModel from "./model.maker_trnx_requests";
import MakerWalletsModel from "./model.maker_wallets";

interface MakerCheckerNotificationCreationModel
    extends Optional<MakerCheckerNotificationsInterface, "id"> { }
interface MakerCheckerNotificationInstance
    extends Model<MakerCheckerNotificationsInterface, MakerCheckerNotificationCreationModel>,
    MakerCheckerNotificationsInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    maker_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    checker_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    view_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    notification_status: {
        type: DataTypes.INTEGER,
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



const MakerCheckerNotificationModel = db.db_write.define<MakerCheckerNotificationInstance>(
    "maker_checker_notifications",
    dataObj
);
MakerCheckerNotificationModel.belongsTo(MakerWalletsModel, {
    foreignKey: 'maker_user_id',
    targetKey: "id",
    as: "notification_maker_wallet_data"
})


export default MakerCheckerNotificationModel;