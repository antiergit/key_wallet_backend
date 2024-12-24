import { DataTypes, Model, Optional } from "sequelize";
import { DappGroupsInterface } from "../index";
import db from "../../helpers/common/db";
import DappModel from './model.dapp';

interface DappGroupCreationModel extends Optional<DappGroupsInterface, "id"> { }
interface DappGroupsInstance
  extends Model<DappGroupsInterface, DappGroupCreationModel>,
  DappGroupsInterface { }

let dataObj = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  }
};

const DappGroupModel = db.db_write.define<DappGroupsInstance>("dapp_groups", dataObj);


DappGroupModel.hasMany(DappModel, {
  foreignKey: "dapp_group_id",
  sourceKey: "id",
});
export default DappGroupModel;