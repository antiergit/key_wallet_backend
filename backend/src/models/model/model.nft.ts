import { DataTypes, Model, Optional } from "sequelize";
import * as Models from './index';
import { NFTInterface } from "../interface/interface.nft";
import db from "../../helpers/common/db";
import CoinsModel from '../model/model.coins';

interface NFTCreationModel extends Optional<NFTInterface, "id"> { }
interface NFTInterfaceInstance
  extends Model<NFTInterface, NFTCreationModel>,
  NFTInterface { }

let dataObj = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {},
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {},
  },
  token_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {},
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {},
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {},
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {},
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {},
  },
  coin_family: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  token_address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {},
  },
  available: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {},
  },
  token_uri: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {},
  },
};

const NFTModelModel = db.db_write.define<NFTInterfaceInstance>("nfts", dataObj);
NFTModelModel.belongsTo(CoinsModel, {
  foreignKey: "coin_id",
  as: "coinData",
});


export default NFTModelModel;