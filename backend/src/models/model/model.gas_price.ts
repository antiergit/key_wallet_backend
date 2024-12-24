import { DataTypes, Model, Optional } from "sequelize";
import { GasPriceInterface } from "../interface/interface.gasprice";
import db from "../../helpers/common/db";

interface GasPriceCreationModel extends Optional<GasPriceInterface, "id"> { }
interface WalletInstance extends Model<GasPriceInterface, GasPriceCreationModel>, GasPriceInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    coin_family: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    safe_gas_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    propose_gas_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fast_gas_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

const GasPriceModel = db.db_write.define<WalletInstance>('gas_prices', dataObj);

export default GasPriceModel;