import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import { authController } from "./controller.auth";
// import authVerification from "./verify.authMiddleware";

class AuthRoute implements ControllerInterface {
  public path = "/auth";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/authorisation`,
    //  authVerification.verifyToken, 
     authController.generateNewTokens);
  }
}

export default AuthRoute;
