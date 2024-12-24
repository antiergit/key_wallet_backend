import { MakerTrnxRequestsModel } from "../../models/model/index";

class MakerTrnxRequestQueries {

    public makerTrnxRequest: any = MakerTrnxRequestsModel;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.makerTrnxRequest.MakerTrnxRequestsModelWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in makerTrnxRequestQueries 🔥 ~ ~", err)
        }
    }
    public async destroy(whereClause: any) {
        try {
            console.log("destroy in makerTrnxRequestQueries where", whereClause)
            await this.makerTrnxRequest.MakerTrnxRequestsModelWrite.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in destroy in makerTrnxRequestQueries 🔥 ~ ~", err)
        }
    }

}
const makerTrnxRequestQueries = new MakerTrnxRequestQueries();
export default makerTrnxRequestQueries;