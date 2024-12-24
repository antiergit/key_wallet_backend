import { DataTypes, Model, Optional } from "sequelize";
import { UserInterface } from "../interface/index";
import db from "../../helpers/common/db";
import { DeviceTokenModel } from "./model.deviceTokens";
import { MakerWalletsModel } from "./model.maker_wallets";
interface UserCreationModel extends Optional<UserInterface, "user_id"> { }
interface UserInstance extends Model<UserInterface, UserCreationModel>, UserInterface { }

let dataObj = {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referral_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referral_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referral_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gp_referred: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fran_referred: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pre_fran_referred: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mas_fran_referred: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  request_rejected: {
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


const UsersModelWrite = db.db_write.define<UserInstance>(
  "users",
  dataObj
);
const UsersModelRead = db.db_write.define<UserInstance>(
  "users",
  dataObj
);

UsersModelRead.hasMany(DeviceTokenModel.DeviceTokenModelRead, { as: 'user_device_token_data', foreignKey: 'user_id' })
DeviceTokenModel.DeviceTokenModelRead.belongsTo(UsersModelRead, { foreignKey: 'user_id' })

UsersModelRead.hasMany(MakerWalletsModel.MakerWalletsRead, { as: 'user_maker_wallet_data', foreignKey: 'user_id' })
MakerWalletsModel.MakerWalletsRead.belongsTo(UsersModelRead, { foreignKey: 'user_id' })


export const UsersModel = {
  UsersModelWrite: UsersModelWrite,
  UsersModelRead: UsersModelRead
};