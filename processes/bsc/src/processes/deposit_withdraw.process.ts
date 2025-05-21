import { TxType, WebHookTxType } from "../types/ERC20Tokens.types";
import { CoinInterface, NotificationInterface, TrnxHistoryModel } from "../models";
import rabbitMq from "../config/rabbitMq";
import { config } from "../config/config";
import bscProcessHelper from "./process.helper";
import { BlockChainStatusEnum, NotificationTypeEnum, TrnxTypeEnum, TxReqTypesEnum } from "../enum";
import { Utility_Helper, Wallet_Helper } from "../helpers"
import { Op } from "sequelize";
import { global_helper } from "../helpers/global_helper";
import { walletQueries } from "../helpers/dbHelper";


class BscDepositWithdrawProcess {
  public startDepositQueue = async () => {
    await rabbitMq.consumeQueue(
      config.DEPOSIT_WITHDRAW_PROCESS_BSC || "",
      this.checkIfOurTx
    );
  };

  public checkIfOurTx = async (data: TxType) => {
    if (data.amount == 0) {
      console.log("amount === 0")
    } else {
      console.log("amount is more than 0", data)
      let coin_data: any = null;
      if (data.token) {
        console.log("token trnx", data.token)
        coin_data = data.token;
      } else if (data.isNFTToken) {
        console.log("isnfttrnx", data.isNFTToken)

        coin_data = data.isNFTToken;
      } else {
        console.log("coin trnx", coin_data)
        coin_data = await bscProcessHelper.NativeCoinByCoinFamily(config.STATIC_COIN_FAMILY.BNB);
        console.log("coin trnx", coin_data)

      }
      // console.log("coin data>>", coin_data)
      const webhookTx: WebHookTxType = {
        coin: coin_data,
        tx_id: data.txId,
        to_address: data.toAddress,
        from_address: data.fromAddress,
        block_id: data.blockId,
        amount: data.amount,
        isNFTToken: data.isNFTToken || false,
        status: 'completed',
        blockchain_status: BlockChainStatusEnum.CONFIRMED,
        txType: data.txType,
        trnx_fee: data.trnx_fee
      };
      console.log(webhookTx, "DEPOSIT");

      await this.SaveNewTrnx(webhookTx);
    }

  };

  public SaveNewTrnx = async (
    trnx_data: WebHookTxType
  ) => {

    try {

      console.log("DEPOSIT_WITHDRAW_PROCESS_BSC Transaction hash >>", trnx_data.tx_id)
      const tx_hash: string = trnx_data.tx_id;
      const to_address: string = trnx_data.to_address;
      const from_address: string = trnx_data.from_address;
      const coin: CoinInterface = trnx_data.coin;
      const amount: number = trnx_data.amount;
      const status: string = trnx_data.status;
      const block_number: number = trnx_data.block_id;
      const blockchain_status: BlockChainStatusEnum = trnx_data.blockchain_status;
      const trnx_fee: any = trnx_data.trnx_fee ? trnx_data.trnx_fee : 0;
      let tx_type: TrnxTypeEnum = trnx_data.txType ? trnx_data.txType : TrnxTypeEnum.DEPOSIT;
      const fiat_currency = "USD";
      let checkOldTrnx: any = null;
      if (tx_type == TrnxTypeEnum.WITHDRAW) {
        checkOldTrnx = await TrnxHistoryModel.findOne({
          attributes: ["coin_id", "tx_id", "type"],
          where: {
            tx_id: {
              [Op.like]: tx_hash,
            },
            from_adrs: {
              [Op.like]: `%${from_address}%`,
            },
            coin_id: coin.coin_id,
            req_type: { [Op.notIn]: [TxReqTypesEnum.ALCHEMY, TxReqTypesEnum.TRANSAK] }
          },
          raw: true,
        });
        let checkwrapedtrnx = await TrnxHistoryModel.findOne({
          where:{
            tx_id: {
              [Op.like]: tx_hash,
            },
            from_adrs:from_address,
            to_adrs:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          }
        })
        if (checkwrapedtrnx) {
          return false
        }
        if (checkOldTrnx == null) {
          let check_coin_in_wallet: any = await walletQueries.findOne(
            ["coin_id", "coin_family"],
            { wallet_address: from_address, coin_id: coin.coin_id },
            [['wallet_id', 'ASC']]
          )
          if (!check_coin_in_wallet) {
            console.error(`Coin not exist under this wallet.`);
            return false;
          }
        }
      } else if (tx_type == TrnxTypeEnum.DEPOSIT) {

        checkOldTrnx = await TrnxHistoryModel.findOne({
          attributes: ["coin_id", "tx_id", "type"],
          where: {
            tx_id: {
              [Op.like]: tx_hash,
            },
            to_adrs: {
              [Op.like]: `%${to_address}%`,
            },
            coin_id: coin.coin_id,
            req_type: { [Op.notIn]: [TxReqTypesEnum.ALCHEMY, TxReqTypesEnum.TRANSAK] }
          },
          raw: true,
          logging: true
        });
      }

      if (checkOldTrnx) {
        console.error(`Transaction ${tx_hash} is already exists.`);
        return false;
      }


      if (tx_type !== TrnxTypeEnum.WITHDRAW && checkOldTrnx && checkOldTrnx.tx_id == tx_hash) {
        tx_type = checkOldTrnx.type;
      }
      let AddressWithdraw: any = await bscProcessHelper.check_our_wallet_address(from_address);
      let Addressdeposit: any = await bscProcessHelper.check_our_wallet_address(to_address);


      let user_id: number = AddressWithdraw ? AddressWithdraw.user_id : 0;
      let to_user_id: number = Addressdeposit ? Addressdeposit.user_id : 0;

      let trx_data: any = {
        user_id: user_id,
        to_user_id: to_user_id,
        req_type: TxReqTypesEnum.EXNG,
        from_adrs: from_address,
        to_adrs: to_address,
        coin_id: coin.coin_id,
        coin_family: coin.coin_family,
        amount: amount,
        status: status,
        block_id: block_number,
        tx_id: tx_hash,
        blockchain_status: blockchain_status,
        type: tx_type,
        tx_fee: trnx_fee,
        fiat_type: fiat_currency
      }
      console.log(`Creating transaction for ${tx_hash}`)
      const newTrnx: any = await TrnxHistoryModel.create(trx_data);

      if (Addressdeposit) {
        console.log(`Address Deposit for ${tx_hash}`)

        let trnxTypeD: string = "Deposit";
        switch (tx_type) {
          case TrnxTypeEnum.SMARTCONTRACTINTERACTION:
            trnxTypeD = "Smart Contract Interaction";
            break;
          case TrnxTypeEnum.APPROVE:
            trnxTypeD = "Approval";
            break;
          case TrnxTypeEnum.SWAP:
            trnxTypeD = "Swap";
            break;
          case TrnxTypeEnum.CROSS_CHAIN:
            trnxTypeD = "Cross-chain Swap";
            break;
          default:
            break;
        }
        /** update to adrs wallet balance */
        console.log(`Update Balance for ${tx_hash} >>`, to_address)

        await Wallet_Helper.Update_Balance(
          to_address, /// wallet_address,
          coin /// coin
        );
        const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
          amount
        )} ${coin?.coin_symbol?.toUpperCase()} has been confirmed.`;

        let notifData: any = {
          title: NotificationTypeEnum.DEPOSIT?.toUpperCase(),
          message: notiMsg,
          amount: amount,
          from_user_id: user_id,
          to_user_id: to_user_id,
          wallet_address: to_address,
          tx_id: newTrnx.id,
          coin_symbol: coin.coin_symbol,
          coin_id: coin.coin_id,
          tx_type: tx_type,
          notification_type: NotificationTypeEnum.DEPOSIT,
          state: "confirmed"
        };
        console.log(`SendNotification for ${tx_hash} >>`)

        Utility_Helper.SendNotification(notifData);
      }

      if (AddressWithdraw) {
        console.log(`Address Withdraw for ${tx_hash}`)

        let trnxTypeW: string = "Withdraw";
        // let notificationTypeW: NotificationTypeEnum = NotificationTypeEnum.WITHDRAW;

        switch (tx_type) {
          case TrnxTypeEnum.SMARTCONTRACTINTERACTION:
            trnxTypeW = "Smart Contract Interaction";
            break;
          case TrnxTypeEnum.APPROVE:
            trnxTypeW = "Approval";
            break;
          case TrnxTypeEnum.SWAP:
            trnxTypeW = "Swap";
            break;
          case TrnxTypeEnum.CROSS_CHAIN:
            trnxTypeW = "Cross-chain Swap";
            break;
          default:
            break;
        }
        console.log(`Update Balance for ${tx_hash} >> from`, from_address)

        await Wallet_Helper.Update_Balance(
          from_address, /// wallet_address,
          coin /// coin
        );
        if (coin.is_token) {
          const native_coin: any =
            await bscProcessHelper.NativeCoinByCoinFamily(coin.coin_family);
          await Wallet_Helper.Update_Balance(
            from_address, /// wallet_address,
            native_coin /// coin
          );
        }


        const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
          amount
        )} ${coin.coin_symbol?.toUpperCase()} has been confirmed.`;

        let notifData: any = {
          title: NotificationTypeEnum.WITHDRAW?.toUpperCase(),
          amount: amount,
          message: notiMsg,
          from_user_id: 0,
          to_user_id: user_id,
          wallet_address: from_address,
          tx_id: newTrnx.id,
          tx_type: tx_type,
          coin_symbol: coin.coin_symbol,
          coin_id: coin.coin_id,
          notification_type: NotificationTypeEnum.WITHDRAW,
          state: "confirmed"
        };
        console.log(`SendNotification for ${tx_hash} >>`)

        Utility_Helper.SendNotification(notifData);
      }

      return true;
    } catch (error: any) {
      console.error(`SaveTrnx_Process-SaveNewTrnx error >>>`, error);
      return false;
    }
  };

}
export const bscWithdrawDepositProcess = new BscDepositWithdrawProcess();
