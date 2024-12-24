import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import BtcController from "./controllers/btcController";
import BtcMiddleware from "./middleware/btcMiddleware";
import jwtVerification from "../../middlewares/verify.middleware";
// import { validate } from "express-validation"
// import validator from "./../../middlewares/validator"

class BtcRoute implements ControllerInterface {
  public path = "/bitcoin";
  public router = express.Router();
  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.post(`${this.path}/:coin/send`,
      jwtVerification.verifyToken,
      BtcMiddleware.requestInfo,
      BtcController.send);

    this.router.get(`${this.path}/unspent/:address`,
      jwtVerification.verifyToken,
      BtcController.unspent)

  }
}

export default BtcRoute;
