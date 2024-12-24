import { DataTypes, Model, Optional } from "sequelize";
import { AppLanguagesInterface } from "../index";
import db from "../../helpers/common/db";
interface AppLanguagesModel extends Optional<AppLanguagesInterface, "id"> { }
interface AppLanguageInstance
    extends Model<AppLanguagesInterface, AppLanguagesModel>,
    AppLanguagesInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: true,
        defaultValue: "1"
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
};

const AppLanguagesModel = db.db_write.define<AppLanguageInstance>(
    "app_languages",
    dataObj
);

export default AppLanguagesModel;

