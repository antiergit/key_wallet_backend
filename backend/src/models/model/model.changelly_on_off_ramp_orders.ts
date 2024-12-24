import { DataTypes, Model, Optional } from "sequelize";
import { ChangellyOnOffRampOrdersInterface } from "../index";
import db from "../../helpers/common/db";
interface ChangellyOnOffRampOrdersModel extends Optional<ChangellyOnOffRampOrdersInterface, "id"> { }
interface ChangellyOnOffRampOrdersInstance
    extends Model<ChangellyOnOffRampOrdersInterface, ChangellyOnOffRampOrdersModel>,
    ChangellyOnOffRampOrdersInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    external_order_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    provider_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency_from: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency_to: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount_from: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    redirect_url: {
        type: DataTypes.TEXT,
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

const ChangellyOnOffRampOrdersModel = db.db_write.define<ChangellyOnOffRampOrdersInstance>(
    "changelly_on_off_ramp_orders",
    dataObj
);

export default ChangellyOnOffRampOrdersModel;

