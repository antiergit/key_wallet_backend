import { DataTypes, Model, Optional } from "sequelize";
import { BehindBlockInterface } from "../interfaces/index";
import db from "../../config/db";

interface BehindBlockCreationModel extends Optional<BehindBlockInterface, "id"> { }
interface BehindBlockInstance
    extends Model<BehindBlockInterface, BehindBlockCreationModel>,
    BehindBlockInterface { }

let dataObj = {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    start_block: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    end_block: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    coin_family: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
};
let dataObjIndex = {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
}


const BehindBlockModel = db.db_write.define<BehindBlockInstance>("behind_blocks", dataObj, dataObjIndex);

export default BehindBlockModel;