import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import { GlblBooleanEnum, GlblCode, GlblMessages } from "../../../constants/global_enum";
import { language } from "../../../constants";
import { adminErrQueries, coin_queries, swapSettingQueries, user_queries, wallet_queries } from "../../../helpers/dbHelper";
import commonHelper from "../../../helpers/common/common.helpers";
import { Op } from "sequelize";


class CommissionController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }

    public async getCommissionDetails(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("Entered into getCommissionDetails")

            let commissionDetails: any = await swapSettingQueries.swapSettingsFindOne(
                ['id', 'address', 'percentage'],
                { id: 1 },
                [['id', 'ASC']])

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: commissionDetails
            });

        } catch (err: any) {
            console.error("Error in getCommissionDetails API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "getCommissionDetails", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }

    public async commissionDetails(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("Entered into commissionDetails")

            if (req.body.type == 1 || req.body.type == 2) {

                let setClause: any;

                if (req.body.type == 1) {
                    setClause = { percentage: req.body.value }
                } else {
                    setClause = { address: req.body.value }
                }

                await swapSettingQueries.swapSettingsUpdate(
                    setClause,
                    { id: 1 })
            }

            return res.status(GlblCode.SUCCESS).send({
                message: GlblMessages.SUCCESS,
                status: true,
                code: GlblCode.SUCCESS,
                data: {}
            });

        } catch (err: any) {
            console.error("Error in commissionDetails API", err)
            await adminErrQueries.adminErrLogsCreate({ fx_name: "commissionDetails", error_msg: err.message || {} })
            return res.status(GlblCode.ERROR_CODE).send({
                code: GlblCode.ERROR_CODE,
                status: false,
                message: language[lang].CATCH_MSG
            });
        }
    }



}

export const commissionController = new CommissionController();
