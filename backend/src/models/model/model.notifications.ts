import { DataTypes, Model, Optional } from "sequelize";
import { NotificationInterface } from "../interface/interface.notifications";
import db from "../../helpers/common/db";
import CoinsModel from "./model.coins";
import CurrencyFiatModel from "./model.currencyFiat";
import TrnxHistoryModel from "./model.trnxHistory";

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
    allowNull: true,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  alert_price: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  fiat_type: {
    type: DataTypes.STRING,
    allowNull: true
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
    allowNull: true,
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
    allowNull: false,
  },
  resent_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  view_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_price_in_usd: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
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
NotificationModel.belongsTo(CoinsModel, { foreignKey: 'coin_id', targetKey: "coin_id", as: "coin_data" });
NotificationModel.belongsTo(CurrencyFiatModel, { foreignKey: 'fiat_type', targetKey: "currency_code", as: "currency_data" });
NotificationModel.belongsTo(TrnxHistoryModel, { foreignKey: 'tx_id', targetKey: "id", as: "trnx_data" });
export default NotificationModel;