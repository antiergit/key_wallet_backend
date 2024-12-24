import { MakerWalletsModel } from "../../models/model/index";

class MakerWalletQueries {

    public makerWallets: any = MakerWalletsModel;

    public async update(setClause: any, whereClause: any) {
        try {
            await this.makerWallets.MakerWalletsWrite.update(setClause, { where: whereClause })
        } catch (err: any) {
            console.error("Error in update in makerWalletQueries 🔥 ~ ~", err)
        }
    }

    public async destroy(whereClause: any) {
        try {
            console.log("destroy in makerWalletQueries where", whereClause)
            await this.makerWallets.MakerWalletsWrite.destroy({ where: whereClause })
        } catch (err: any) {
            console.error("Error in destroy in makerWalletQueries 🔥 ~ ~", err)
        }
    }

}
const makerWalletQueries = new MakerWalletQueries();
export default makerWalletQueries;