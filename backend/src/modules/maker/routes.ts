import express from "express";
import { validate } from "express-validation";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { makerController } from "./controller";
import MakerValidator from "./validator";

class MakerRoute implements ControllerInterface {
    public path = "/maker";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {

        this.router.post(
            `${this.path}/createAccount`,
            [validate(MakerValidator.createAccount)],
            makerController.createAccount
        );
        this.router.post(
            `/makerChecker/notifications`,
            [validate(MakerValidator.notifications)],
            jwtVerification.verifyToken,
            makerController.notifications
        );
        this.router.post(
            `${this.path}/getDetails`,// Manage Wallet Listing
            [validate(MakerValidator.getDetails)],
            makerController.getDetails
        );
        this.router.post(
            `${this.path}/getToken`,
            [validate(MakerValidator.getToken)],
            makerController.getToken
        );
        this.router.post(
            `${this.path}/editDetails`,
            [validate(MakerValidator.editDetails)],
            jwtVerification.verifyToken,
            makerController.editDetails
        );
        this.router.post(
            `${this.path}/makeTrnxRequest`,
            [validate(MakerValidator.makeTrnxRequest)],
            jwtVerification.verifyToken,
            makerController.makeTrnxRequest
        );

        this.router.post(
            `${this.path}/makeTrnxApprovalRequest`,
            [validate(MakerValidator.makeTrnxRequest)],
            jwtVerification.verifyToken,
            makerController.makeTrnxApprovalRequest
        );

    }
}
export default MakerRoute;
