import * as Models from '../../models/model/index';

class AdminQueries {

    public adminModal: any = Models.AdminModel;

    public async adminCreate(obj: any) {
        try {
            let data: any = await this.adminModal.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in adminCreate>>", err)
            throw err;
        }
    }

    public async adminFindOne(attr: any, where: any, order: any) {
        try {
            let data: any = await this.adminModal.findOne({
                attributes: attr,
                where: where,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in adminFindOne>>", err)
            throw err;
        }
    }

    public async adminUpdate(set: any, where: any) {
        try {
            let data: any = await this.adminModal.update(
                set,
                { where: where })
            return data;
        } catch (err: any) {
            console.error("Error in adminUpdate>>", err)
            throw err;
        }
    }


}

const adminQueries = new AdminQueries();
export default adminQueries;
