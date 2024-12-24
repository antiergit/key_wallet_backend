import schedule from "node-schedule";
import { config } from "./config/index";
import { coinPriceInFiatController, consumeController, walletController } from "./modules/index";

class CronJobs {
  constructor() {
    /** Send Push Notification */
    this.sendPushNotification()

    /** */
    this.updateBalanceCron();

    /** Update Gas Prices */
    this.scheduleGasPriceUpdates();

    /** Update Cmc Ids*/
    this.updateCoinGeckoIds();

    /** Graph data */
    this.updateFiatCoinPriceCron();

    /** Maker Checker Functionality */
    this.expireMakerRequest();

    /** Cross Chain Transactions */
    this.getPendingCrossChainTx();
    this.updateCrossChainTxStatus();
    // Update Changelly Cross-chain supported tokens
    // this.updateCrossChainSupportedCoins();

  }

  public sendPushNotification() {
    setTimeout(async () => {
      await consumeController.consumePushNotification()
    }, 10000)
  };

  public updateBalanceCron() {
    setTimeout(async () => {
      await consumeController.updateWalletBalance()
    }, 10000)
  };

  public scheduleGasPriceUpdates() {
    const cronExpression = "*/7 * * * * *";

    const updateGasPrice = async (coinFamily: number) => {
      await walletController.updateGasPrice(coinFamily);
    };

    schedule.scheduleJob(cronExpression, () => updateGasPrice(config.STATIC_COIN_FAMILY.ETH)); // ETH
    schedule.scheduleJob(cronExpression, () => updateGasPrice(config.STATIC_COIN_FAMILY.BNB)); // BNB
  };

  public updateCoinGeckoIds() {
    schedule.scheduleJob("*/5 * * * * *", async function () {
      await walletController.fetchCoinGeckoIds();

    });
  };

  public updateFiatCoinPriceCron() {
    if (config.SERVER == "prod") {
      schedule.scheduleJob("*/30 * * * * *", async function () {
        await coinPriceInFiatController.fetchCoinGeckoPrice();
      });
    } else {
      schedule.scheduleJob("*/30 * * * * *", async function () {
        await coinPriceInFiatController.fetchCoinGeckoPrice();
      });
    }
  };

  public expireMakerRequest() {
    schedule.scheduleJob("*/1 * * * *", async function () {
      await walletController.expireRequest();

    });
  };

  public async getPendingCrossChainTx() {
    schedule.scheduleJob('*/30 * * * * *', async function () {
      await walletController.getPendingTransactions();
    });
  }

  public async updateCrossChainTxStatus() {
    setTimeout(async () => {
      await consumeController.updatePendingTxStatus();
    }, 1000);
  }

  // public async updateCrossChainSupportedCoins() {
  //   schedule.scheduleJob('0 0 */2 * *', async function () {
  //   // schedule.scheduleJob('*/30 * * * *', async function () {
  //     await walletController.getPendingTransactions();
  //   });
  // }

}

new CronJobs();
