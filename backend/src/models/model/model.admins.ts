import { DataTypes, Model, Optional } from "sequelize";
import { AdminInterface } from "../index";
import db from "../../helpers/common/db";

interface AdminModel extends Optional<AdminInterface, "id"> { }
interface AdminInstance
    extends Model<AdminInterface, AdminModel>,
    AdminInterface { }

let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    google2fa_secret: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    google2fa_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    jwt_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    login_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    active: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
};

const AdminModel = db.db_write.define<AdminInstance>("admins", dataObj);

// AdminModel.sync({ alter: true });
export default AdminModel;


