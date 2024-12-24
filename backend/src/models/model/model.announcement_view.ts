import { DataTypes, Model, Optional } from "sequelize";
import { AnnouncementStatusInterface } from "../interface/interface.announcement_status";
import db from "../../helpers/common/db";

interface AnnouncementStatusModel extends Optional<AnnouncementStatusInterface, "id"> { }
interface AnnouncementStatusInstance
    extends Model<AnnouncementStatusInterface, AnnouncementStatusModel>,
    AnnouncementStatusInterface { }

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
    view_status: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
};

const AnnouncementStatusModel = db.db_write.define<AnnouncementStatusInstance>("announcement_view_status", dataObj);
export default AnnouncementStatusModel;


