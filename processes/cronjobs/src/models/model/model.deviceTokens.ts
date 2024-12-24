import { DataTypes, Model, Optional } from "sequelize";
import { DeviceTokenInterface } from "../interface/index";
import { db } from "../../helpers/common/index";

interface DeviceTokenCreationModel extends Optional<DeviceTokenInterface, "id"> { }
interface DeviceTokenInstance
  extends Model<DeviceTokenInterface, DeviceTokenCreationModel>,
  DeviceTokenInterface { }

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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
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

const DeviceTokenModelWrite = db.db_write.define<DeviceTokenInstance>("deviceTokens", dataObj, dataObjIndex);
const DeviceTokenModelRead = db.db_read.define<DeviceTokenInstance>("deviceTokens", dataObj, dataObjIndex);

export const DeviceTokenModel = {
  DeviceTokenModelWrite: DeviceTokenModelWrite,
  DeviceTokenModelRead: DeviceTokenModelRead
};