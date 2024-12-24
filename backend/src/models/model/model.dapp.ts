import { DataTypes, Model, Optional } from "sequelize";
import { DappInterface } from "../interface/interface.dapp";
import db from "../../helpers/common/db";

interface DappCreationModel extends Optional<DappInterface, "id"> { }
interface DappInstance
  extends Model<DappInterface, DappCreationModel>,
  DappInterface {}

let dataObj = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dapp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dapp_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coin_family: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

const DappModel = db.db_write.define<DappInstance>("dapps", dataObj);

export default DappModel;