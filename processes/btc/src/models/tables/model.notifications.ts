import { DataTypes, Model, Optional } from "sequelize";
import { NotificationInterface } from "../interfaces/interface.notifactions";
import db from "../../config/db";
interface NotificationCreationModel
  extends Optional<NotificationInterface, "notification_id"> { }
interface NotificationInstance
  extends Model<NotificationInterface, NotificationCreationModel>,
  NotificationInterface { }

let dataObj = {
  notification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  alert_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  fiat_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notification_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tx_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tx_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_symbol: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  resent_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  view_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_price_in_usd: {
    type: DataTypes.JSON,
    allowNull: true
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
  }
};

let dataObjIndex = {
  indexes: [
    {
      unique: false,
      fields: ["to_user_id"],
    },
    {
      unique: false,
      fields: ["notification_type"],
    },
    {
      unique: false,
      fields: ["tx_id"],
    },
    {
      unique: false,
      fields: ["tx_type"],
    },
  ],
};

const NotificationModel = db.db_write.define<NotificationInstance>(
  "notifications",
  dataObj,
  dataObjIndex
);

export default NotificationModel;