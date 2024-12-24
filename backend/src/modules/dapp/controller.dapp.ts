import { Response, Request } from "express";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import * as Models from '../../models/model/index';
import { language } from "../../constants";
import { GlblCode } from "../../constants/global_enum";
import commonHelper from "../../helpers/common/common.helpers";


class DappController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }

  public initialize() { }
  public async getDappList(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {

      let dappGroupList: any = await Models.DappGroupModel.findAll({
        attributes: ["id", "name", "image"],
        include: [{
          model: Models.DappModel,
          attributes: ["id", "status", "about", "image", "url", "dapp_name", "dapp_group_id", "coin_family", "created_at"],
          where: { status: 1 },
        }]
      });
      response.success(res, { data: dappGroupList });
    } catch (err: any) {
      console.error("Error in dapp > getDappList.", err)
      await commonHelper.save_error_logs("dapp_getDappList", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG
      };
      return res.status(data.code).send(data);
    }
  };
}

export const dappController = new DappController();