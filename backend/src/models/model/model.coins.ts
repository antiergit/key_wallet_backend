import { DataTypes, Model, Optional } from "sequelize";
import { CoinInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import CoinPriceInFiatModel from '../model/model.coinPriceInFiat';
import WatchlistsModel from "./model.watchlist";
import ChangellySupportedCrossChainCoinsModel from "./model.changelly_supported_cross_chain_coins";
import ChangellySupportedOnOffRampsModel from "./model.changelly_supported_on_off_ramps";
import RocketxSupportedCoinsModel from "./model.rocketx_supported_coins";
interface CoinCreationModel extends Optional<CoinInterface, "coin_id"> { }
interface CoinInstance extends Model<CoinInterface, CoinCreationModel>, CoinInterface { }

let dataObj = {
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  mainnet_token_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // coin_market_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  // },
  coin_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cmc_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coin_gicko_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_on_cmc: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coin_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin_gicko_alias: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_family: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  coin_status: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  is_token: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  token_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  decimals: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  usd_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  withdraw_limit: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  token_abi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uuid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  for_swap: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  gasless: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  added_by: {
    type: DataTypes.ENUM('admin', 'user', 'swap'),
    allowNull: true,
  },
  is_on_coin_gicko: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};
let dataObjIndex = {
  indexes: [
    {
      unique: true,
      fields: ["coin_id"],
    },
    {
      unique: false,
      fields: ["coin_symbol"],
    },
    {
      unique: false,
      fields: ["coin_gicko_alias"],
    },
    {
      unique: false,
      fields: ["coin_family"],
    },
    {
      unique: false,
      fields: ["coin_status"],
    },
    {
      unique: false,
      fields: ["is_token"],
    },
    {
      unique: false,
      fields: ["token_type"],
    },
    {
      unique: false,
      fields: ["token_address"],
    },
  ],
};

const CoinsModel = db.db_write.define<CoinInstance>(
  "coins",
  dataObj,
  dataObjIndex
);



CoinsModel.belongsTo(CoinPriceInFiatModel, { foreignKey: "coin_gicko_id", targetKey: "coin_gicko_id", as: "fiat_price_data" });
CoinsModel.belongsTo(WatchlistsModel, { foreignKey: "coin_id", targetKey: "coin_id", as: "watchlist_data" })
CoinsModel.hasOne(CoinsModel, { foreignKey: "coin_family", sourceKey: "coin_family", as: "native_coins_data" })

CoinsModel.hasOne(ChangellySupportedCrossChainCoinsModel, {
  foreignKey: "coin_id",
  as: "coins_changelly_rel"
});

CoinsModel.hasOne(RocketxSupportedCoinsModel, {
  foreignKey: "coin_id",
  as: "coins_rocketx_rel"
});

CoinsModel.hasOne(ChangellySupportedOnOffRampsModel, {
  foreignKey: "coin_id",
  as: "coins_changelly_on_off_ramp_rel"
});


export default CoinsModel;
