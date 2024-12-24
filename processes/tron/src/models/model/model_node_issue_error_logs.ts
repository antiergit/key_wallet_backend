import { DataTypes, Model, Optional } from "sequelize";
import { dbConn } from "../../connections/index";
import { NodeIssueErrorLogsInterface } from '../interfaces/index';
interface NodeIssueErrorLogsCreationModel extends Optional<NodeIssueErrorLogsInterface, "id"> { }
interface NodeIssueErrorLogsInstance
    extends Model<NodeIssueErrorLogsInterface, NodeIssueErrorLogsCreationModel>,
    NodeIssueErrorLogsInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    function: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    block_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    from_adrs: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    to_adrs: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coin_family: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    extra: {
        type: DataTypes.TEXT,
        allowNull: true
    }
};

const NodeIssueErrorLogsModel = dbConn.db_write.define<NodeIssueErrorLogsInstance>(
    "node_issue_error_logs",
    dataObj
);

export default NodeIssueErrorLogsModel;