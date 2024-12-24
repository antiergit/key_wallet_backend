import { DataTypes, Model, Optional } from "sequelize";
import { ChangellySupportedProvidersInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellySupportedProvidersModel extends Optional<ChangellySupportedProvidersInterface, "id"> { }
interface ChangellySupportedProvidersInstance
    extends Model<ChangellySupportedProvidersInterface, ChangellySupportedProvidersModel>,
    ChangellySupportedProvidersInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    trust_pilot_rating: {
        type: DataTypes.STRING,
        allowNull: true
    },
    icon_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true
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

const ChangellySupportedProvidersModel = db.db_write.define<ChangellySupportedProvidersInstance>(
    "changelly_supported_providers",
    dataObj
);

export default ChangellySupportedProvidersModel;

