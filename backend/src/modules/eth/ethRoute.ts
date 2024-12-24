import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { EthControllers } from "./controllers/ethController"
import EthMiddleware from "./middleware/ethMiddleware"
// import { validate } from "express-validation"
// import validator from "./../../middlewares/validator"

class EthRoute implements ControllerInterface {
  public path = "/ethereum";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {

    /** Used on Front-End */
    this.router.post(`${this.path}/:coin/gas_estimation`,
      jwtVerification.verifyToken,
      EthMiddleware.requestInfo,
      EthControllers.getEstimationGas);

    this.router.post(`${this.path}/:coin/send`,
      jwtVerification.verifyToken,
      EthMiddleware.requestInfo,
      EthControllers.send);

    this.router.post(`${this.path}/:coin/sendSwapTrnx`,
      jwtVerification.verifyToken,
      EthMiddleware.requestInfo,
      EthControllers.sendSwapTrnx);

    /** Not used */
    this.router.post(`${this.path}/:coin/nonce`,
      jwtVerification.verifyToken,
      EthMiddleware.requestInfo,
      EthControllers.getNonce);

    this.router.post(`${this.path}/:coin/get_raw_data_string`,
      jwtVerification.verifyToken,
      EthMiddleware.requestInfo,
      EthControllers.rawDataString);
  }

}

export default EthRoute;
