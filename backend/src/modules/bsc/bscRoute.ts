import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import BnbMiddleware from "./middleware/bscMiddleware";
import jwtVerification from "../../middlewares/verify.middleware";
import { bnbController } from "./controllers/bscController";


class BnbRoute implements ControllerInterface {
  public path = "/binancesmartchain";
  public router = express.Router();
  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.post(`${this.path}/:coin/gas_estimation`,
      jwtVerification.verifyToken,
      BnbMiddleware.requestInfo,
      bnbController.gasEstimation);

    this.router.post(`${this.path}/:coin/send`,
      jwtVerification.verifyToken,
      BnbMiddleware.requestInfo,
      bnbController.send);

    this.router.post(`${this.path}/:coin/nonce`,
      jwtVerification.verifyToken,
      BnbMiddleware.requestInfo,
      bnbController.getNonce);

  }
}

export default BnbRoute;
