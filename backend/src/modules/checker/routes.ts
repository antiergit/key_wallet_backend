import express from "express";
import { validate } from "express-validation";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { checkerController } from "./controller";
import CheckerValidator from "./validator";

class CheckerRoute implements ControllerInterface {
  public path = "/checker";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {

    this.router.get(
      `${this.path}/codes`,
      jwtVerification.verifyToken,
      checkerController.checkerCodes
    );
    this.router.post(
      `${this.path}/refreshCode`,
      [validate(CheckerValidator.refreshCode)],
      jwtVerification.verifyToken,
      checkerController.refreshCode
    );
    this.router.get(
      `${this.path}/getRequests/:fiatType/:coinFamily`,
      jwtVerification.verifyToken,
      checkerController.getRequests
    );
    this.router.post(
      `${this.path}/updateStatus`,
      [validate(CheckerValidator.updateStatus)],
      jwtVerification.verifyToken,
      checkerController.updateStatus
    );

  }
}
export default CheckerRoute;
