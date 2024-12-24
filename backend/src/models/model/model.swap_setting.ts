import { DataTypes, Model, Optional } from "sequelize";
import { SwapSettingsInterface } from "../interface/interface.swap_setting";
import db from "../../helpers/common/db";


interface SwapSettingsModel extends Optional<SwapSettingsInterface, "id"> { }
interface SwapSettingsInstance
    extends Model<SwapSettingsInterface, SwapSettingsModel>,
    SwapSettingsInterface { }

let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    percentage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rocketx_fee: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    rocketx_slippage: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
};

const SwapSettingsModel = db.db_write.define<SwapSettingsInstance>("swap_settings", dataObj);

export default SwapSettingsModel;


