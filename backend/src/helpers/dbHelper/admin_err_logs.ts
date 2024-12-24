import * as Models from '../../models/model/index';

class AdminErrLogQueries {

    public adminErrLogsModal: any = Models.AdminErrLogsModel;

    public async adminErrLogsCreate(obj: any) {
        try {
            let data: any = await this.adminErrLogsModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in adminErrLogsCreate>>", err)
            throw err;
        }
    }


}

const adminErrQueries = new AdminErrLogQueries();
export default adminErrQueries;
