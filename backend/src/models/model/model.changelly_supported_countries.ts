import { DataTypes, Model, Optional } from "sequelize";
import { ChangellySupportedCountriesInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellySupportedCountriesModel extends Optional<ChangellySupportedCountriesInterface, "id"> { }
interface ChangellySupportedCountriesInstance
    extends Model<ChangellySupportedCountriesInterface, ChangellySupportedCountriesModel>,
    ChangellySupportedCountriesInterface { }
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
    status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    state_code: {
        type: DataTypes.STRING,
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

const ChangellySupportedCountriesModel = db.db_write.define<ChangellySupportedCountriesInstance>(
    "changelly_supported_countries",
    dataObj
);

export default ChangellySupportedCountriesModel;

