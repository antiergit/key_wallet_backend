import { Response } from "express";
import { ResponseData, ResponseHelperInterface } from "../../interfaces/response.helper.interface";
import { GlblCode } from "../../constants/global_enum";

class ResponseHelper implements ResponseHelperInterface {

  public success(res: Response, resData: ResponseData) {
    return res.status(GlblCode.SUCCESS).send(resData.data)
  }

  public error(res: Response, resData: ResponseData) {
    return res.status(GlblCode.ERROR_CODE).send(resData.data)
  }
}

const response = new ResponseHelper()
export default response