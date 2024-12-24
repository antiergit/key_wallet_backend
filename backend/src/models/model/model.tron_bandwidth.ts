import { DataTypes, Model, Optional } from "sequelize";
import db from "../../helpers/common/db";
import { TronBandwidthModel } from "../interface/interface.tronbandwidth";

interface TronBandwidthCreationModel extends Optional<TronBandwidthModel, "id"> {}
interface TronBandwidthInstance
  extends Model<TronBandwidthModel, TronBandwidthCreationModel>,
  TronBandwidthModel {}

const dataObj = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  tron_trc10_bandwidth: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tron_trc20_bandwidth: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tron_bandwidth: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

const TronBandwidthWrite = db.db_write.define<TronBandwidthInstance>("tron_bandwidth", dataObj);
const TronBandwidthRead = db.db_read.define<TronBandwidthInstance>("tron_bandwidth", dataObj);

export default { TronBandwidthWrite: TronBandwidthWrite, TronBandwidthRead: TronBandwidthRead };
