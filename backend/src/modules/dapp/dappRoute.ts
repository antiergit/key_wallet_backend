import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { dappController } from "./controller.dapp"

class DappRoute implements ControllerInterface {
    public path = "/dapp";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.get(`${this.path}/list`,
            jwtVerification.verifyToken,
            dappController.getDappList);

    }
}
export default DappRoute;
