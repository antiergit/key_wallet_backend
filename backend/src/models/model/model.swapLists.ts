// import { DataTypes, Model, Optional } from "sequelize";
// import { SwapInterface } from "../interface/interface.swapList";
// import db from "../../helpers/common/db";
// import CoinsModel from '../model/model.coins';
// import WalletModel from '../model/model.wallets';
// import CustomSwapModel from '../model/model.custom_swap_lists';
// import CoinPriceInFiatModel from '../model/model.coinPriceInFiat';
// interface SwapCreationModel extends Optional<SwapInterface, "id"> { }
// interface SwapInstance extends Model<SwapInterface, SwapCreationModel>, SwapInterface { }

// const dataObj = {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   chain_id: {
//     type: DataTypes.TINYINT,
//     allowNull: false,
//   },
//   coin_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   coin_name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   coin_symbol: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   coin_image: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   decimals: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   token_address: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   is_token: {
//     type: DataTypes.TINYINT,
//     allowNull: true,
//   },
//   is_active: {
//     type: DataTypes.TINYINT,
//     allowNull: true,
//   },
//   coin_family: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   is_custom_added: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// };

// const SwapModel = db.db_write.define<SwapInstance>("swap_lists", dataObj);

// SwapModel.belongsTo(CoinsModel, {
//   foreignKey: "coin_id",
//   targetKey: "coin_id",
// });
// // CoinsModel.hasMany(WalletModel, {
// //   foreignKey: "coin_id",
// //   sourceKey: "coin_id",
// // });
// SwapModel.belongsTo(CoinPriceInFiatModel, {
//   foreignKey: "coin_symbol",
//   targetKey: "coin_symbol",
// });

// SwapModel.hasMany(CustomSwapModel, {
//   foreignKey: "swap_list_id",
// })

// export default SwapModel;
