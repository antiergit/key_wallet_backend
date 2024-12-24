import { DataTypes, Model, Optional } from "sequelize";
import { ChangellySupportedOnOffRampsInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellySupportedOnOffRampsModel extends Optional<ChangellySupportedOnOffRampsInterface, "id"> { }
interface ChangellySupportedOnOffRampsInstance
    extends Model<ChangellySupportedOnOffRampsInterface, ChangellySupportedOnOffRampsModel>,
    ChangellySupportedOnOffRampsInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coin_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ticker: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    extra_id_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    icon_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    changelly_precision: {
        type: DataTypes.STRING,
        allowNull: true
    },
    network: {
        type: DataTypes.STRING,
        allowNull: true
    },
    protocol: {
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

const ChangellySupportedOnOffRampsModel = db.db_write.define<ChangellySupportedOnOffRampsInstance>(
    "changelly_supported_on_off_ramps",
    dataObj
);

export default ChangellySupportedOnOffRampsModel;

