import rabbitMq from "../config/rabbitMq";
import { config } from "../config/config";
import { Op } from "sequelize";
import { BlockChainStatusEnum } from "../enum";
import { TrnxHistoryModel } from "../models";

class BSCPendingWithdrawalProcess {
  public getTransactionFromDB = async () => {
    let tx: any = await TrnxHistoryModel.findAll({
      attributes: ["tx_id", "coin_id"],
      where: {
        status: 'completed',
        [Op.or]: [{ blockchain_status: null }, { blockchain_status: BlockChainStatusEnum.PENDING }],
        req_type: { [Op.notIn]: ['TRANSAK', 'ALCHEMY'] },
        coin_family: config.STATIC_COIN_FAMILY.BNB
      },
      raw: true
    })

    if (tx.length > 0) {
      for await (const el of tx) {
        await this.addTxToQueue(el);
      }
    }
  };

  public addTxToQueue = async (data: { tx_id: string; coin_id: number }) => {
    await rabbitMq.assertQueue(config.PENDING_WITHDRAWAL_TX_PROCESS_BSC || "");
    await rabbitMq.sendToQueue(
      config.PENDING_WITHDRAWAL_TX_PROCESS_BSC || "",
      Buffer.from(JSON.stringify(data))
    );
  };
}

export const bscPendingWithdrawalProcess = new BSCPendingWithdrawalProcess();
