import { DataTypes, Model, Optional } from "sequelize";
import { UserInterface } from "../interfaces/index";
import { dbConn } from "../../connections";

import DeviceTokenModel from "./model.deviceToken";
import MakerWalletsModel from "./makerWallets";
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


const UsersModel = dbConn.db_write.define<UserInstance>(
  "users",
  dataObj
);

UsersModel.hasMany(DeviceTokenModel, { as: 'user_device_token_data', foreignKey: 'user_id' })
DeviceTokenModel.belongsTo(UsersModel, { foreignKey: 'user_id' })

UsersModel.hasMany(MakerWalletsModel, { as: 'user_maker_wallet_data', foreignKey: 'user_id' })
MakerWalletsModel.belongsTo(UsersModel, { foreignKey: 'user_id' })


export default UsersModel;