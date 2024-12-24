import { DataTypes, Model, Optional } from "sequelize";
import { AddressBookInterface } from "../interface/interface.address_book";
import db from "../../helpers/common/db";

interface AddressBookCreationModel extends Optional<AddressBookInterface, "id"> { }
interface AddressBookInstance
  extends Model<AddressBookInterface, AddressBookCreationModel>,
  AddressBookInterface { }

const dataObj = {
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
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
};

const AddressBookModel = db.db_write.define<AddressBookInstance>("address_books", dataObj);
export default AddressBookModel;


