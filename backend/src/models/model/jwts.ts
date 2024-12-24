import { DataTypes, Model, Optional } from "sequelize";
import { JwtsInterface } from '../interface/jwts.interface'
import db from "../../helpers/common/db";

interface JwtsModel extends Optional<JwtsInterface, "id"> { }
interface JwtsInstance
    extends Model<JwtsInterface, JwtsModel>,
    JwtsInterface { }

let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    device_token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    device_token_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    refresh: {
        type: DataTypes.STRING,
        allowNull: false
    }
};
let dataObjIndex = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const JwtsModel = db.db_write.define<JwtsInstance>("jwts", dataObj, dataObjIndex);
export default JwtsModel;


