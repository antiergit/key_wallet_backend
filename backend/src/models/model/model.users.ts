import { DataTypes, Model, Optional } from "sequelize";
import { UserInterface } from "../interface/interface.users";
import db from "../../helpers/common/db";
import WalletModel from "./model.wallets";
import DeviceTokenModel from "./model.deviceToken";
import  MakerWalletsModel from "./model.maker_wallets";
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
  // email: {
  //   type: DataTypes.STRING,
  //   allowNull: true
  // },
  referral_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  referral_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referral_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  device_id: {
    type: DataTypes.STRING,
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


const UsersModel = db.db_write.define<UserInstance>(
  "users",
  dataObj
);

UsersModel.hasMany(DeviceTokenModel, { as: 'user_device_token_data', foreignKey: 'user_id' })
DeviceTokenModel.belongsTo(UsersModel, { foreignKey: 'user_id' })

UsersModel.hasMany(WalletModel, {
  foreignKey: "user_id",
  as: "user_wallet_relation"
});
UsersModel.hasOne(WalletModel, {
  foreignKey: "user_id",
  as: "user_wallet_rel"
});


export default UsersModel;