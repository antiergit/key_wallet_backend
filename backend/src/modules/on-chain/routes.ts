import express from 'express';
import { validate } from "express-validation";
import { ControllerInterface } from '../../interfaces/controller.interface';
import jwtVerification from '../../middlewares/verify.middleware';
import { OnChainController } from './controller';
import validator from "./validator";


class OnChainRoute implements ControllerInterface {
    public path = '/on-chain';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {

        /** Used on Front-End */
        this.router.get(
            `${this.path}/commision_data`,
            jwtVerification.verifyToken,
            OnChainController.commisionData
        );
        this.router.post(
            `${this.path}/allowance`,
            [validate(validator.allowance)],
            jwtVerification.verifyToken,
            OnChainController.OneinchAllowanceCheck
        );

        /** Not used */
        this.router.post(
            `${this.path}/swap`,
            [validate(validator.swap)],
            jwtVerification.verifyToken,
            OnChainController.OneinchSwapApi
        );
        this.router.post(
            `${this.path}/quote`,
            [validate(validator.quote)],
            jwtVerification.verifyToken,
            OnChainController.OneinchQuotesApi
        );
        this.router.post(
            `${this.path}/approval`,
            [validate(validator.approval)],
            jwtVerification.verifyToken,
            OnChainController.OneinchTokenApproval
        );
        this.router.post(
            `${this.path}/spender`,
            [validate(validator.spender)],
            jwtVerification.verifyToken,
            OnChainController.OneinchSpenderInfo
        );
        this.router.post(
            `${this.path}/tokens`,
            [validate(validator.tokens)],
            jwtVerification.verifyToken,
            OnChainController.OneinchTokensApi
        );
    }
}
export default OnChainRoute;
