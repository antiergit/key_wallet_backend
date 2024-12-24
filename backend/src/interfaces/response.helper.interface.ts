import { Response } from "express";

export type ResponseData = {
  data: any
}

export interface ResponseHelperInterface {
  success: (res: Response, resData: ResponseData) => Response
  error: (res: Response, resData: ResponseData) => Response
}

