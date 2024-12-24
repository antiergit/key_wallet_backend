import { DataTypes, Model, Optional } from "sequelize";
import { CurrencyFiatInterface } from "../interface/interface.currencyFiat";
import db from "../../helpers/common/db";

interface CurrencyFiatCreationModel
  extends Optional<CurrencyFiatInterface, "currency_id"> { }
interface CurrencyFiatInstance
  extends Model<CurrencyFiatInterface, CurrencyFiatCreationModel>,
  CurrencyFiatInterface { }

let dataObj = {
  currency_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  currency_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uuid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
};

let dataObjIndex = {
  indexes: [
    {
      unique: true,
      fields: ["currency_id"],
    },
    {
      unique: false,
      fields: ["currency_code"],
    },
  ],
};

const CurrencyFiatModel = db.db_write.define<CurrencyFiatInstance>(
  "currency_fiats",
  dataObj,
  dataObjIndex
);

export default CurrencyFiatModel;