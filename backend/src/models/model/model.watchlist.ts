import { DataTypes, Model, Optional } from "sequelize";
import { WatchlistInterface } from "../interface/interface.watchlists";
import db from "../../helpers/common/db";

interface WatchlistCreationModel extends Optional<WatchlistInterface, "id"> { }
interface WatchlistInstance extends Model<WatchlistInterface, WatchlistCreationModel>, WatchlistInterface { }

let dataObj = {
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
   coin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   status: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false
   },
   wallet_address: {
      type: DataTypes.STRING,
      allowNull: false,
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

const WatchlistsModel = db.db_write.define<WatchlistInstance>("watch_list", dataObj);


WatchlistsModel.sync({ alter: true });

export default WatchlistsModel;