import { DataTypes, Model, Optional } from "sequelize";
import db from "../../helpers/common/db";
import { AdminErrLogsInterface } from '../interface/index.interface';

interface AdminErrLogsCreationModel extends Optional<AdminErrLogsInterface, "id"> { }
interface AdminErrLogsInstance
    extends Model<AdminErrLogsInterface, AdminErrLogsCreationModel>,
    AdminErrLogsInterface { }

const dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    fx_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    error_msg: {
        type: DataTypes.JSON,
        allowNull: true
    }
};

const AdminErrLogsModel = db.db_write.define<AdminErrLogsInstance>("admin_err_logs", dataObj);
export default AdminErrLogsModel;


