import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { tronControllers } from './controller'
import tronMiddleware from "./middleware"

class TronRoute implements ControllerInterface {
    public path = "/tron";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/:coin/gas_estimation`,
            jwtVerification.verifyToken,
            tronMiddleware.requestInfo,
            tronControllers.gasEstimation);

        this.router.post(`${this.path}/:coin/send`,
            jwtVerification.verifyToken,
            tronMiddleware.requestInfo,
            tronControllers.send);

        this.router.post(`${this.path}/:coin/new_gas_estimation`,
            jwtVerification.verifyToken,
            tronMiddleware.requestInfo,
            tronControllers.getEstimationGas);
    }

}

export default TronRoute;
