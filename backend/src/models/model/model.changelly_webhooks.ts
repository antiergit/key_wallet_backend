import { DataTypes, Model, Optional } from "sequelize";
import { ChangellyWebhooksInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellyWebhooksModel extends Optional<ChangellyWebhooksInterface, "id"> { }
interface ChangellyWebhooksInstance
    extends Model<ChangellyWebhooksInterface, ChangellyWebhooksModel>,
    ChangellyWebhooksInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    hook_data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
};

const ChangellyWebhooksModel = db.db_write.define<ChangellyWebhooksInstance>(
    "changelly_webhooks",
    dataObj
);

export default ChangellyWebhooksModel;

