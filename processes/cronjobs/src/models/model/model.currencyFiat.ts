import { DataTypes, Model, Optional } from "sequelize";

import { CurrencyFiatModel } from "../interface/index";
import { db } from "../../helpers/common/index";


interface CurrencyFiatCreationModel extends Optional<CurrencyFiatModel, "currency_id"> { }
interface CurrencyFiatInstance extends Model<CurrencyFiatModel, CurrencyFiatCreationModel>, CurrencyFiatModel { }

let dataObj = {
    currency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    currency_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency_symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

let dataObjIndex = {
    indexes: [
        {
            unique: true,
            fields: ['currency_id']
        },
        {
            unique: false,
            fields: ['currency_code']
        }
    ]
};

const CurrencyFiatWrite = db.db_write.define<CurrencyFiatInstance>('currency_fiats', dataObj, dataObjIndex);
const CurrencyFiatRead = db.db_read.define<CurrencyFiatInstance>('currency_fiats', dataObj, dataObjIndex);
export const CurrencyFiat = {
    CurrencyFiatWrite: CurrencyFiatWrite,
    CurrencyFiatRead: CurrencyFiatRead,
};