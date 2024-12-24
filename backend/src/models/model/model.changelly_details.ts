import { DataTypes, Model, Optional } from "sequelize";
import { ChangellyDetailsInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellyDetailsModel extends Optional<ChangellyDetailsInterface, "id"> { }
interface ChangellyDetailsInstance
    extends Model<ChangellyDetailsInterface, ChangellyDetailsModel>,
    ChangellyDetailsInterface { }
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
    value: {
        type: DataTypes.TEXT,
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

const ChangellyDetailsModel = db.db_write.define<ChangellyDetailsInstance>(
    "changelly_details",
    dataObj
);

export default ChangellyDetailsModel;

