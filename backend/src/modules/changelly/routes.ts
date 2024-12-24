import express from "express";
import { validate } from "express-validation";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { changellyController } from "./controller";
import changellyValidator from "./validator";

class ChangellyRoute implements ControllerInterface {
  public path = "/changelly";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {

    /** Not used */

    // Cross - chain
    this.router.get(
      `${this.path}/:fx`,
      changellyController.getChangellyData
    );

    // On - Off Ramp
    this.router.get(
      `${this.path}/OnOffRamp/abc/:fx`,
      changellyController.OnOffRampTesting
    );
    //===================================================================

    /** Used on Front-End */

    // Cross - Chain
    this.router.post(
      `${this.path}/coins`,
      [validate(changellyValidator.coins)],
      jwtVerification.verifyToken,
      changellyController.changellySupportedCrossChainCoins
    );

    this.router.post(
      `${this.path}/v2/coins`,
      //[validate(changellyValidator.coins)],
      jwtVerification.verifyToken,
      changellyController.changellySupportedCrossChainCoins2
    );

    this.router.post(
      `${this.path}/minAmount`,
      [validate(changellyValidator.minAmount)],
      jwtVerification.verifyToken,
      changellyController.minAmount
    );
    this.router.post(
      `${this.path}/createTransaction`,
      [validate(changellyValidator.createTransaction)],
      jwtVerification.verifyToken,
      changellyController.createTransaction
    );

    // On - Off Ramp
    this.router.post(
      `${this.path}/OnOffRamp/listing`,
      [validate(changellyValidator.onOffRampListing)],
      jwtVerification.verifyToken,
      changellyController.onOffRampListing
    );

    this.router.post(
      `${this.path}/OnOffRamp/listing2`,
      [validate(changellyValidator.onOffRampListing2)],
      jwtVerification.verifyToken,
      changellyController.onOffRampListing2
    );


    this.router.post(
      `${this.path}/OnOffRamp/getOffers`,
      [validate(changellyValidator.onOffRampGetOffers)],
      jwtVerification.verifyToken,
      changellyController.onOffRampGetOffers
    );
    this.router.post(
      `${this.path}/OnOffRamp/createOrder`,
      [validate(changellyValidator.createOrder)],
      jwtVerification.verifyToken,
      changellyController.createOrder
    );
    this.router.post(
      `${this.path}/OnOffRamp/webhook`,
      changellyController.webhook
    );
  }
}
export default ChangellyRoute;