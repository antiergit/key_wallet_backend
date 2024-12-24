import * as Models from '../../models/model/index';

class CatchErrMsgQueries {

    public async catch_err_msg_create(obj: any) {
        try {
            let data: any = await Models.CatchErrorMsgsModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in catch_err_msg_create>>", err)
            throw err;
        }
    }

}

const catch_err_msg_queries = new CatchErrMsgQueries();
export default catch_err_msg_queries;
