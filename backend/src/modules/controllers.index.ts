import UserRoute from "./user/route";
import WalletRoute from "./wallet/walletRoute";
import BtcRoute from "./btc/btcRoute";
import EthModule from "./eth/ethRoute";
import authRoute from "./auth/authRoute";
import DappRoute from "./dapp/dappRoute";
import TronRoute from "./tron/routes";
import BnbRoute from "./bsc/bscRoute";
import OnChainRoute from "./on-chain/routes";
import oxChainRoute from "./matcha/routes";
import AdminRoute from "./admin/index"
import MakerRoute from "./maker/routes";
import CheckerRoute from "./checker/routes";
import ChangellyRoute from "./changelly/routes";
import rocketXRoute from "./rocketx/route";



const controllers = [
  new UserRoute(),
  new WalletRoute(),
  new BtcRoute(),
  new EthModule(),
  new DappRoute(),
  new authRoute(),
  new TronRoute(),
  new BnbRoute(),
  new OnChainRoute(),
  new oxChainRoute(),
  new AdminRoute(),
  new MakerRoute(),
  new CheckerRoute(),
  new ChangellyRoute(),
  new rocketXRoute()
]

export default controllers;
