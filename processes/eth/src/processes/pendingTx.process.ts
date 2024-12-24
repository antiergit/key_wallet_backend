import rabbitMq from "../config/rabbitMq";
import { config } from "../config/config";
import { Op } from "sequelize";
import { BlockChainStatusEnum } from "../enum";
import { TrnxHistoryModel } from "../models";

class ETHPendingWithdrawalProcess {
  public getTransactionFromDB = async () => {
      let tx: any = await TrnxHistoryModel.findAll({
        attributes: ["tx_id", "coin_id"],
        where: {
          status: 'completed',
          [Op.or]: [{ blockchain_status: null }, { blockchain_status: BlockChainStatusEnum.PENDING }],
          req_type: { [Op.notIn]: ['TRANSAK', 'ALCHEMY'] },
          coin_family: config.COIN_FAMILY_ETH
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
    await rabbitMq.assertQueue(config.PENDING_WITHDRAWAL_TX_PROCESS_ETH || "");
    await rabbitMq.sendToQueue(
      config.PENDING_WITHDRAWAL_TX_PROCESS_ETH || "",
      Buffer.from(JSON.stringify(data))
    );
  };
}

export const ethPendingWithdrawalProcess = new ETHPendingWithdrawalProcess();
