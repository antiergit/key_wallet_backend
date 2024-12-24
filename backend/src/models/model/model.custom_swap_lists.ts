// import { DataTypes, Model, Optional } from "sequelize";
// import { CustomSwapInterface } from "../interface/interface.customSwapList";
// import db from "../../helpers/common/db";

// interface SwapCreationModel extends Optional<CustomSwapInterface, "id"> { }
// interface SwapInstance extends Model<CustomSwapInterface, SwapCreationModel>, CustomSwapInterface { }

// const dataObj = {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   user_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   coin_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   wallet_address: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   swap_list_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
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

// const CustomSwapModel = db.db_write.define<SwapInstance>("custom_swap_lists", dataObj);


// export default CustomSwapModel;
