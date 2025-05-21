import express from "express";
import { validate } from "express-validation"
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { userController } from "./controller";
import validator from "./validator";

class UserRoute implements ControllerInterface {
  public path = "/user";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/create/wallet`,
      [validate(validator.createWalletValidate)],
      userController.createWallet);

    this.router.post(`${this.path}/logout`,
      [validate(validator.logoutValidate)],
      jwtVerification.verifyToken,
      userController.userLogout);

    this.router.post(`${this.path}/notification/list`,
      [validate(validator.notificationListValidate)],
      jwtVerification.verifyToken,
      userController.notificationList);

    this.router.post(`${this.path}/add_address_book`,
      [validate(validator.addAddressBookValidate)],
      jwtVerification.verifyToken,
      userController.addAddressBook);

    this.router.post(`${this.path}/address_book`,
      [validate(validator.pageListValidate)],
      jwtVerification.verifyToken,
      userController.addressBook);

    this.router.post(`${this.path}/get_wallet_name`,
      [validate(validator.getWalletName)],
      jwtVerification.verifyToken,
      userController.getWalletName);

    this.router.post(`${this.path}/search`,
      [validate(validator.search)],
      jwtVerification.verifyToken,
      userController.search);

    this.router.post(`${this.path}/delete_address_book_wallet_address`,
      [validate(validator.deleteAddressBookWalletAddress)],
      jwtVerification.verifyToken,
      userController.deleteAddressBookWalletAddress);

    this.router.post(`${this.path}/delete_address_book`,
      [validate(validator.deleteAddressBook)],
      jwtVerification.verifyToken,
      userController.deleteAddressBook);

    this.router.post(`${this.path}/announcement/view_status`,
      [validate(validator.announcementViewStatus)],
      jwtVerification.verifyToken,
      userController.announcementViewStatus);

    this.router.get(`${this.path}/app_language`,
      jwtVerification.verifyToken,
      userController.appLanguage);

    this.router.post(`${this.path}/wallet_balance`,
      jwtVerification.verifyToken,
      userController.getWalletBalance);

    this.router.post(`${this.path}/get_transaction_status`,
      jwtVerification.verifyToken,
      userController.getTransactionStatus);

      this.router.post(`${this.path}/get_balnce_of_tokens`,
        jwtVerification.verifyToken,
        userController.get_balnce_of_tokens);      
  }
}


export default UserRoute;
