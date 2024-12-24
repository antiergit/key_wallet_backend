import { NodeIssueErrorLogsModel } from "../../models/model";

class NodeIssueErrorLogQueries {

    public node_issue_error_logs: any = NodeIssueErrorLogsModel;

    public async node_issue_error_logs_create(obj: any) {
        try {
            // let data: any = await this.node_issue_error_logs.create(obj)
            // return data;
            return true;
        } catch (err: any) {
            console.error("Error in node_issue_error_logs_create>>", err)
            throw err;
        }
    }

}

const node_issue_error_log_queries = new NodeIssueErrorLogQueries();
export default node_issue_error_log_queries;
