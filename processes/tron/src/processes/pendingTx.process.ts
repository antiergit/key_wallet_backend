import { Op } from "sequelize";
import { RabbitMq } from "../helpers/rabbitmq.helper";
import { config } from "../config/config";
import { TrnxBlockchainStatus } from "../enum";
import { trnx_history_queries } from "../helpers";

class ETHPendingWithdrawalProcess {
  public pending_withdrawl_tx: string = config.PENDING_WITHDRAWAL_TX_PROCESS_TRON;

  public getTransactionFromDB = async () => {
    let tx: any = await trnx_history_queries.trnx_history_find_all(
      ["tx_id", "coin_id"],
      {
        status: 'completed',
        [Op.or]: [{ blockchain_status: null }, { blockchain_status: TrnxBlockchainStatus.PENDING }],
        req_type: { [Op.notIn]: ['TRANSAK', 'ALCHEMY'] },
        coin_family: config.COIN_FAMILY_TRON,
        tx_id: { [Op.not]: null }
      },
    )

    if (tx.length > 0) {
      for await (const el of tx) {
        console.log("el>>>", el)
        await this.addTxToQueue(el);
      }
    }
  };

  public addTxToQueue = async (data: { tx_id: string; coin_id: number }) => {
    await RabbitMq.send_tx_to_queue(
      this.pending_withdrawl_tx || "",
      Buffer.from(JSON.stringify(data))
    );
  };
}

export const ethPendingWithdrawalProcess = new ETHPendingWithdrawalProcess();
