import express from "express";
import { ControllerInterface } from "../../interfaces/controller.interface";
import jwtVerification from "../../middlewares/verify.middleware";
import { walletController } from "./controller.wallet";
import { validate as validateExpress } from "express-validation";
import wallet_validator from "./validator";

class WalletRoute implements ControllerInterface {
  public path = "/wallet";
  public router = express.Router();
  constructor() {
    this.initializeRoutes();
  }
  public initializeRoutes() {

    this.router.post(
      `${this.path}/addtoken`,
      [validateExpress(wallet_validator.addTokenValidate)],
      jwtVerification.verifyToken,
      walletController.addToken
    );
    this.router.post(
      `${this.path}/portfolio`,
      [validateExpress(wallet_validator.portfolioValidate)],
      jwtVerification.verifyToken,
      walletController.portfolio
    );
    this.router.post(
      `${this.path}/activeinactive`,
      [validateExpress(wallet_validator.activeInactiveWallet)],
      jwtVerification.verifyToken,
      walletController.activeInactiveWallet
    );
    this.router.post(
      `${this.path}/toggleCoinList`,
      [validateExpress(wallet_validator.toggleCoinListValidate)],
      jwtVerification.verifyToken,
      walletController.toggleCoinList
    );
    this.router.post(
      `${this.path}/transaction/list`,
      [validateExpress(wallet_validator.transactionListValidate)],
      jwtVerification.verifyToken,
      walletController.transactions
    );
    this.router.post(
      `${this.path}/order/update`,
      jwtVerification.verifyToken,
      walletController.updateWalletOrder
    );
    this.router.post(
      `${this.path}/search`,
      [validateExpress(wallet_validator.searchTokenValidate)],
      jwtVerification.verifyToken,
      walletController.searchToken
    );
    this.router.post(
      `${this.path}/swap_coinlist`,
      [validateExpress(wallet_validator.swapListValidate)],
      jwtVerification.verifyToken,
      walletController.swapList
    );
    this.router.get(`${this.path}/rpcUrl`,
      walletController.getRpcUrl
    );
    this.router.post(
      `${this.path}/updateWatchlist`,
      [validateExpress(wallet_validator.updateWatchlistValidate)],
      jwtVerification.verifyToken,
      walletController.updateWatchlist
    );
    this.router.post(
      `${this.path}/getWatchlist`,
      [validateExpress(wallet_validator.getWatchlistValidate)],
      jwtVerification.verifyToken,
      walletController.getWatchlist
    );
    this.router.get(
      `${this.path}/currencyfiatlist`,
      walletController.getCurrencyFiat
    );
    this.router.post(
      `${this.path}/fee`,
      jwtVerification.verifyToken,
      walletController.getFee
    );
    this.router.post(
      `${this.path}/nativeCoinFiatPrice`,
      jwtVerification.verifyToken,
      walletController.NativeCoinFiatPrice
    );
    this.router.get(
      `${this.path}/fetchValue`,
      jwtVerification.verifyToken,
      walletController.fetchValue
    );
    this.router.post(
      `${this.path}/checkFiatBalance`,
      [validateExpress(wallet_validator.checkFiatBalance)],
      jwtVerification.verifyToken,
      walletController.checkFiatBalance
    );
    this.router.post(
      `${this.path}/allBalances`,
      [validateExpress(wallet_validator.allBalances)],
      walletController.allBalances
    );
    this.router.post(
      `${this.path}/updateBalance`,
      jwtVerification.verifyToken,
      walletController.updateBalance
    );
    this.router.get(
      `${this.path}/transaction/downloadcsv/:id`,
      walletController.downloadCsv
    );
  }
}
export default WalletRoute;
