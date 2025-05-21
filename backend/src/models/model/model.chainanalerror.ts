import { DataTypes, Model, Optional } from "sequelize";
import db from "../../helpers/common/db";
import { chainAnalErrorLogs } from "../interface/interface.chainanalError";

interface ChainAnalErrorLogsCreationModel extends Optional<chainAnalErrorLogs, "id"> {}
interface chainAnalErrorLogsInstance
  extends Model<chainAnalErrorLogs, ChainAnalErrorLogsCreationModel>,
  chainAnalErrorLogs {}

  const dataObj = {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    from_address:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    to_address:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    error_message: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  };

const chainAnalErrorLogsModel = db.db_write.define<chainAnalErrorLogsInstance>(
  "chain_analytics_error_logs",
  dataObj
);


export default chainAnalErrorLogsModel;