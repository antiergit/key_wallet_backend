import { DataTypes, Model, Optional } from "sequelize";
import { TronOldBlockInterface } from "../interfaces/index";
import { dbConn } from "../../connections";


interface TronOldBlockCreationModel extends Optional<TronOldBlockInterface, "id"> { }
interface TronOldBlockInstance
    extends Model<TronOldBlockInterface, TronOldBlockCreationModel>,
    TronOldBlockInterface { }

let dataObj = {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    block_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    start_block: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    end_block: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    coin_family: {
        type: DataTypes.INTEGER,
        allowNull: false,
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


const TronOldBLockModel = dbConn.db_write.define<TronOldBlockInstance>("tron_old_blocks", dataObj, dataObjIndex);

export default TronOldBLockModel;