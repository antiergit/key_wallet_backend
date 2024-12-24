import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import { rocketx_Controller } from "./controller";

class rocketXRoute implements ControllerInterface {
    public path = "/rocketx";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(
            `${this.path}/tokens`,
            rocketx_Controller.getAllTokens
        );

        this.router.get(
            `${this.path}/configs`,
            rocketx_Controller.getConfig
        );

        this.router.get(
            `${this.path}/tokens`,
            rocketx_Controller.getTokens
        );

        this.router.get(
            `${this.path}/quotation`,
            rocketx_Controller.getQuotation
        );

        this.router.post(
            `${this.path}/swap`,
            rocketx_Controller.swapTrxn
        );

        this.router.get(
            `${this.path}/status`,
            rocketx_Controller.getStatus
        );

        // this.router.post(
        //     `${this.path}/coins`,
        //     rocketx_Controller.rocketxSupportedCrossChainCoins
        //   );
    }
}
export default rocketXRoute;
