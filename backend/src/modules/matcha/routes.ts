import express from "express";
import { validate } from "express-validation";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { oxChainController } from "./controller";

class oxChainRoute implements ControllerInterface {
  public path = "/chain";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {

    this.router.post(
      `${this.path}/:coin/price`,
      jwtVerification.verifyToken,
      oxChainController.oxChainPriceApi
    );
    this.router.post(
      `${this.path}/:coin/quotes`,
      jwtVerification.verifyToken,
      oxChainController.oxChainQuotesApi
    );
    this.router.get(
      `${this.path}/:coin/gaslessTokens`,
      jwtVerification.verifyToken,
      oxChainController.gaslessTokens
    );


    /** v2 */
    this.router.post(
      `${this.path}/quotes`,
      jwtVerification.verifyToken,
      oxChainController.oxChainQuotesApiV2
    );

    this.router.post(
      `${this.path}/price`,
      jwtVerification.verifyToken,
      oxChainController.oxChainPricesApiV2
    );

    /** for gasless */
    this.router.post(
      `${this.path}/gaslessPrice`,
      jwtVerification.verifyToken,
      oxChainController.getPriceOfGaslessToken
    );

    this.router.post(
      `${this.path}/gaslessQuote`,
      jwtVerification.verifyToken,
      oxChainController.getQuoteOfGaslessToken
    );
    this.router.post(
      `${this.path}/gaslessSubmit`,
      jwtVerification.verifyToken,
      oxChainController.submitTransaction
    );

    this.router.post(
      `${this.path}/gaslessStatus`,
      jwtVerification.verifyToken,
      oxChainController.getTransactionStatus
    );

  }
}
export default oxChainRoute;
