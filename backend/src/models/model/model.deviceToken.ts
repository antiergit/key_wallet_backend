import { DataTypes, Model, Optional } from "sequelize";
import { DeviceTokenInterface } from "../interface/interface.deviceToken";
import db from "../../helpers/common/db";

interface DeviceTokenCreationModel extends Optional<DeviceTokenInterface, "id"> {}
interface DeviceTokenInstance
  extends Model<DeviceTokenInterface, DeviceTokenCreationModel>,
  DeviceTokenInterface {}

let dataObj = {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  push: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  language:{
    type: DataTypes.STRING,
    allowNull: false
  },
  fiat_currency:{
    type: DataTypes.STRING,
    allowNull: false
  }
};

let dataObjIndex = {
  indexes: [
    {
      unique: false,
      fields: ["user_id"],
    },
    {
      unique: false,
      fields: ["status"],
    },
  ],
};

const DeviceTokenModel = db.db_write.define<DeviceTokenInstance>("deviceTokens",dataObj, dataObjIndex);

export default DeviceTokenModel;