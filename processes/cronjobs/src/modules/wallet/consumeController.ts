import { config } from "../../config";
import { RabbitMq } from "../../helpers/common/index";
import crossChainController from "./crossChainController";
import walletController from "./walletController";

class ConsumeController {

    public async consumePushNotification() {
        console.log("consume consumePushNotification", config.PUSH_NOTIFICATION_QUEUE)

        await RabbitMq.consumeQueue(
            config.PUSH_NOTIFICATION_QUEUE,
            walletController.sendPushNotification)
    }
    public async updateWalletBalance() {
        console.log('consume updateWalletBalance', config.BACKEND_WALLET_ADDRESSES);

        await RabbitMq.consumeQueue(
            config.BACKEND_WALLET_ADDRESSES || '',
            walletController.updateWalletBalance
        )
    }

    public async updatePendingTxStatus() {
        console.log('consume updateWalletBalance', config.PENDING_CROSS_CHAIN_TX_TOPIC);

        await RabbitMq.consumeQueue(
            config.PENDING_CROSS_CHAIN_TX_TOPIC || '',
            crossChainController.getTxDetails
        )
    }


}
const consumeController = new ConsumeController();
export default consumeController;
