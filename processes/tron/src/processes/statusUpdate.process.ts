import { RabbitMq } from "../helpers/rabbitmq.helper";
import { config } from "../config/config";
import {
  BooleanEnum,
  CoinFamilyEnum_2,
  GlblBoolean,
  NotificationTypeEnum,
  TRONSTATUS,
  TokenStandard,
  TrnxBlockchainStatus,
  TrnxStatusEnum,
  TrnxTypeEnum,
} from "../enum";
import {
  Utility_Helper,
  Blockchain_Helper,
  global_helper,
  node_issue_error_log_queries,
  trnx_history_queries,
  coin_queries,
  wallet_queries,
} from "../helpers";
import tronProcessHelper from "./processes.helper";
import { Op } from "sequelize";
class TronTxStatusUpdateProcess {
  public pending_withdrawl_tx: string =
    config.PENDING_WITHDRAWAL_TX_PROCESS_TRON;
  public tron_coin_family: any = config.COIN_FAMILY_TRON;
  public tron_update_balance_of_coin: any = config.TRON_UPDATE_BALANCE_OF_COIN;
  public user_all_coins_bal_update: any = config.USER_ALL_COINS_BALANCE_UPDATE;

  public startTxStatusUpdateQueue = async () => {
    await RabbitMq.consumeQueue(this.pending_withdrawl_tx || "", this.getTx);
  };

  public async getTx(data: { tx_id: string; coin_id: number }) {
    try {
      console.log("Pending data >>>>>>>", data);
      let trnx_fee: number = GlblBoolean.false;
      if (data) {
        const transaction: any =
          await Blockchain_Helper.GetConfirmedTransaction(data.tx_id, 0);
        console.log(
          "------------transaction.status----------",
          transaction.status
        );
        if (transaction.status) {
          const TransactionInfo: any =
            await Blockchain_Helper.GetTransactionInfo(data.tx_id);
          const transactionData = TransactionInfo.data;
          trnx_fee = await Blockchain_Helper.tronWeb.fromSun(
            transactionData.fee
          );
          const blockNumber: number = transactionData.blockNumber;
          if (transaction.data.ret[GlblBoolean.false]) {
            const contractRet: string =
              transaction.data.ret[GlblBoolean.false].contractRet;
            let txData = {
              coin_id: data.coin_id,
              txid: transactionData.id,
              blockchain_status: TrnxBlockchainStatus.PENDING || null,
              coin_family: config.COIN_FAMILY_TRON,
              tx_fee: Number(trnx_fee),
              block_number: blockNumber,
              status: TrnxStatusEnum.COMPLETED,
            };
            if (contractRet == TRONSTATUS.SUCCESS) {
              txData.status = TrnxStatusEnum.COMPLETED;
              txData.blockchain_status = TrnxBlockchainStatus.CONFIRMED;
            } else if (contractRet == TRONSTATUS.REVERT) {
              txData.blockchain_status = TrnxBlockchainStatus.FAILED;
              txData.status = TrnxStatusEnum.COMPLETED;
            } else if (contractRet == TRONSTATUS.OUT_OF_ENERGY) {
              txData.blockchain_status = TrnxBlockchainStatus.FAILED;
              txData.status = TrnxStatusEnum.COMPLETED;
            }
            await tronTxStatusUpdateProcess.sendTxUpdate(txData);
          } else {
            let txData = {
              coin_id: data.coin_id,
              txid: transactionData.id,
              blockchain_status: TrnxBlockchainStatus.FAILED,
              coin_family: config.COIN_FAMILY_TRON,
              tx_fee: Number(trnx_fee),
              block_number: blockNumber,
              status: TrnxStatusEnum.COMPLETED,
            };
            await tronTxStatusUpdateProcess.sendTxUpdate(txData);
          }
        } else {
          console.log(`transaction status false >>>`, transaction);

          let count_data: any =
            await trnx_history_queries.trnx_history_find_one(
              ["queue_check_count", "blockchain_status"],
              {
                tx_id: data.tx_id,
                [Op.or]: [{ blockchain_status: TrnxBlockchainStatus.PENDING }],
              }
            );
          if (count_data.queue_check_count == 21) {
            if (count_data.blockchain_status == TrnxBlockchainStatus.PENDING) {
              let txData = {
                coin_id: data.coin_id,
                txid: data.tx_id,
                blockchain_status: TrnxBlockchainStatus.FAILED,
                coin_family: config.COIN_FAMILY_TRON,
                tx_fee: Number(trnx_fee),
                block_number: 0,
                status: TrnxStatusEnum.COMPLETED,
              };
              await tronTxStatusUpdateProcess.sendTxUpdate(txData);

              // await trnx_history_queries.trnx_history_update({ blockchain_status: TrnxBlockchainStatus.FAILED }, { tx_id: data.tx_id })
            } else {
              console.log("Else of count_data.blockchain_status == pending");
            }
          } else {
            await trnx_history_queries.trnx_history_update(
              { queue_check_count: count_data.queue_check_count + 1 },
              { tx_id: data.tx_id }
            );
          }
        }
      }
    } catch (err: any) {
      console.error("Error in getTx>>", err);
      await node_issue_error_log_queries.node_issue_error_logs_create({
        function: "getTx",
        block_number: "0",
        error: err.message,
        transaction_id: data.tx_id,
        from_adrs: null,
        to_adrs: null,
        coin_family: config.COIN_FAMILY_TRON,
        extra: "catch under getTx",
      });
    }
  }
  public sendTxUpdate = async (txData: {
    coin_id: number;
    txid: string;
    blockchain_status: string;
    coin_family: number;
    tx_fee: number;
    block_number: number;
    status: string;
  }) => {
    try {
      let coin_data: any = await tronProcessHelper.CoinByCoinId(txData.coin_id);
      console.log("coin_data added by", coin_data?.added_by);
      const trx_data = {
        coin_id: txData?.coin_id,
        txid: txData?.txid,
        blockchain_status: txData?.blockchain_status,
        tx_fee: txData?.tx_fee,
        block_number: txData?.block_number,
        status: txData?.status,
        gas_reverted: null,
        fromAddress: "",
        coin: {
          coin_id: txData?.coin_id,
          is_token: coin_data.is_token,
          coin_symbol: coin_data.coin_symbol,
          coin_family: coin_data.coin_family,
          token_type: coin_data.token_type,
          token_address:
            Number(coin_data.is_token) === Number(BooleanEnum.true)
              ? coin_data.token_address
              : coin_data.coin_symbol,
          added_by: coin_data.added_by,
        },
      };
      await this.updateBroadcastTx(trx_data);
    } catch (err: any) {
      console.error("error in  sendTxUpdate error >>>>>>>", err);
      return console.error(err.message);
    }
  };
  public async updateBroadcastTx(trx_data: any) {
    console.log("Entered into updateBroadcastTx>>>");

    let txnData: any = await trnx_history_queries.trnx_history_find_one(
      [
        "from_adrs",
        "amount",
        "user_id",
        "id",
        "to_adrs",
        "type",
        "coin_family",
      ],
      {
        tx_id: trx_data.txid,
        status: TrnxStatusEnum.COMPLETED,
        [Op.or]: [
          { blockchain_status: null },
          { blockchain_status: TrnxBlockchainStatus.PENDING },
        ],
      }
    );
    console.log("txnData>>", txnData.id);
    if (txnData) {
      let from_address = txnData.from_adrs;
      let amount = txnData.amount;
      let user_id = txnData.user_id;
      let tx_row_id = txnData.id;
      let to_address = txnData.to_adrs;
      let tx_type = txnData?.type;
      let coin_symbol = trx_data?.coin?.coin_symbol;
      let token_type = trx_data?.coin?.token_type;
      let coin_family = txnData.coin_family;
      let blockchain_status: any = trx_data.blockchain_status;
      console.log(
        "txnData going to update>>",
        txnData.id,
        "blockchain_status",
        blockchain_status
      );

      let txUpdateRes: any = await trnx_history_queries.trnx_history_update(
        {
          blockchain_status: blockchain_status,
          block_id: trx_data.block_number,
          tx_fee: trx_data.tx_fee,
          gas_reverted: trx_data.gas_reverted,
        },
        { id: tx_row_id }
      );

      if (txUpdateRes) {
        console.log(
          "under txUpdateRes txnData going to update>>",
          txnData.id,
          "blockchain_status",
          blockchain_status
        );

        if (blockchain_status == TrnxBlockchainStatus.CONFIRMED) {
          let AddressWithdraw: any =
            await tronProcessHelper.check_our_wallet_address(from_address);

          if (AddressWithdraw) {
            if (tx_type !== TrnxTypeEnum.DAPP) {
              const native_coin: any =
                await tronProcessHelper.NativeCoinByCoinFamily(coin_family);
              //============================================================================================
              // await Wallet_Helper.Update_Balance(from_address, native_coin);
              console.log("789 adding_123coins_to_queusssse ", native_coin);

              await tronProcessHelper.adding_coins_to_queue(
                from_address,
                native_coin
              );

              if (
                trx_data?.coin?.is_token === 1 &&
                trx_data.coin?.token_type.toLowerCase() ===
                  TokenStandard.TRC20.toLowerCase()
              ) {
                // await Wallet_Helper.Update_Balance(from_address, trx_data?.coin);
                console.log("123 adding_123coins_to_queue ", trx_data?.coin);

                await tronProcessHelper.adding_coins_to_queue(
                  from_address,
                  trx_data?.coin
                );
              }
            } else {
              // await Wallet_Helper.Update_all_active_coin_balance(from_address);
              await tronProcessHelper.adding_address_to_queue(from_address);
            }
            //============================================================================================

            let trnxTypeW: string = "Withdraw";
            switch (tx_type) {
              case TrnxTypeEnum.DAPP:
                trnxTypeW = "Smart Contract Execution";
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
            const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${coin_symbol.toUpperCase()} has been confirmed.`;

            let notifData: any = {
              title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
              message: notiMsg,
              from_user_id: 0,
              amount: amount,
              to_user_id: user_id,
              coin_symbol: coin_symbol,
              wallet_address: from_address,
              tx_id: tx_row_id,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.WITHDRAW,
              state: TrnxBlockchainStatus.CONFIRMED,
            };

            Utility_Helper.SendNotification(notifData);
          }

          let Addressdeposit: any =
            await tronProcessHelper.check_our_wallet_address(to_address);
          if (Addressdeposit) {
            let to_user_id: number = Addressdeposit
              ? Addressdeposit.user_id
              : 0;
            let trnxTypeD: string = "Deposit";
            switch (tx_type) {
              case TrnxTypeEnum.DAPP:
                trnxTypeD = "Smart Contract Execution";
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
            if (to_address !== from_address) {
              if (tx_type !== TrnxTypeEnum.DAPP) {
                //============================================================================================
                // let balance: any = await Wallet_Helper.Update_Balance(
                //   to_address,
                //   trx_data?.coin
                // );
                //
                console.log("ENtering adding_coins_to_queue ");
                await tronProcessHelper.adding_coins_to_queue(
                  to_address,
                  trx_data.coin
                );
              } else {
                // await Wallet_Helper.Update_all_active_coin_balance(to_address);
                console.log("ENtering adding_address_to_queue ");

                await tronProcessHelper.adding_address_to_queue(to_address);
              }
              //============================================================================================
            }
            const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${trx_data?.coin?.coin_symbol.toUpperCase()} has been confirmed.`;

            let notifData: any = {
              title: NotificationTypeEnum.DEPOSIT.toUpperCase(),
              message: notiMsg,
              amount: amount,
              from_user_id: user_id,
              to_user_id: to_user_id,
              wallet_address: to_address,
              tx_id: tx_row_id,
              coin_symbol: coin_symbol,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.DEPOSIT,
              state: TrnxBlockchainStatus.CONFIRMED,
            };
            Utility_Helper.SendNotification(notifData);
          }
          return true;
        } else if (blockchain_status == TrnxBlockchainStatus.FAILED) {
          let AddressWithdraw: any =
            await tronProcessHelper.check_our_wallet_address(from_address);

          if (AddressWithdraw) {
            if (tx_type !== TrnxTypeEnum.DAPP) {
              const native_coin: any =
                await tronProcessHelper.NativeCoinByCoinFamily(coin_family);
              //============================================================================================
              // await Wallet_Helper.Update_Balance(from_address, native_coin);
              console.log(
                "789 adding_123coins_to_queusssse for failed conditions",
                native_coin
              );

              await tronProcessHelper.adding_coins_to_queue(
                from_address,
                native_coin
              );

              if (
                trx_data?.coin?.is_token === 1 &&
                trx_data.coin?.token_type.toLowerCase() ===
                  TokenStandard.TRC20.toLowerCase()
              ) {
                // await Wallet_Helper.Update_Balance(from_address, trx_data?.coin);
                console.log(
                  "123 adding_123coins_to_queue  for failed conditions",
                  trx_data?.coin
                );

                await tronProcessHelper.adding_coins_to_queue(
                  from_address,
                  trx_data?.coin
                );
              }
            } else {
              // await Wallet_Helper.Update_all_active_coin_balance(from_address);
              await tronProcessHelper.adding_address_to_queue(from_address);
            }
            //============================================================================================

            let trnxTypeW: string = "Withdraw";
            switch (tx_type) {
              case TrnxTypeEnum.DAPP:
                trnxTypeW = "Smart Contract Execution";
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

            const coin_family_short_code =
              CoinFamilyEnum_2[
                Number(coin_family) as keyof typeof CoinFamilyEnum_2
              ];

            const convertedAmount =
              await Utility_Helper.bigNumberSafeConversion(amount);
            const coinDetails = `${convertedAmount} ${coin_symbol.toUpperCase()}${
              token_type ? ` (${token_type})` : "" // 100 USDT (TRC20)
            }`;

            let notiMsg = (() => {
              switch (trnxTypeW) {
                case "Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                case "Cross-chain Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                default:
                  return `Transaction Failed - The withdrawal of ${coinDetails} has failed.`;
              }
            })();

            // const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
            //   amount
            // )} ${coin_symbol.toUpperCase()} has been failed.`;

            let notifData: any = {
              title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
              message: notiMsg,
              from_user_id: 0,
              amount: amount,
              to_user_id: user_id,
              coin_symbol: coin_symbol,
              wallet_address: from_address,
              tx_id: tx_row_id,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.WITHDRAW,
              state: TrnxBlockchainStatus.FAILED,
            };

            Utility_Helper.SendNotification(notifData);
          }

          let Addressdeposit: any =
            await tronProcessHelper.check_our_wallet_address(to_address);
          if (Addressdeposit) {
            let to_user_id: number = Addressdeposit
              ? Addressdeposit.user_id
              : 0;
            let trnxTypeD: string = "Deposit";
            switch (tx_type) {
              case TrnxTypeEnum.DAPP:
                trnxTypeD = "Smart Contract Execution";
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
            if (to_address !== from_address) {
              if (tx_type !== TrnxTypeEnum.DAPP) {
                //============================================================================================
                // let balance: any = await Wallet_Helper.Update_Balance(
                //   to_address,
                //   trx_data?.coin
                // );
                //
                console.log("ENtering adding_coins_to_queue ");
                await tronProcessHelper.adding_coins_to_queue(
                  to_address,
                  trx_data.coin
                );
              } else {
                // await Wallet_Helper.Update_all_active_coin_balance(to_address);
                console.log("ENtering adding_address_to_queue ");

                await tronProcessHelper.adding_address_to_queue(to_address);
              }
              //============================================================================================
            }
            // const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
            //   amount
            // )} ${trx_data?.coin?.coin_symbol.toUpperCase()} has been failed.`;
            const coin_family_short_code =
              CoinFamilyEnum_2[
                Number(coin_family) as keyof typeof CoinFamilyEnum_2
              ];

            const convertedAmount =
              await Utility_Helper.bigNumberSafeConversion(amount);
            const coinDetails = `${convertedAmount} ${coin_symbol.toUpperCase()}${
              token_type ? ` (${token_type})` : ""
            }`;

            let notiMsg = (() => {
              switch (trnxTypeD) {
                case "Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                case "Cross-chain Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                default:
                  return `Transaction Failed - The withdrawal of ${coinDetails} has failed.`;
              }
            })();

            let notifData: any = {
              title: NotificationTypeEnum.DEPOSIT.toUpperCase(),
              message: notiMsg,
              amount: amount,
              from_user_id: user_id,
              to_user_id: to_user_id,
              wallet_address: to_address,
              tx_id: tx_row_id,
              coin_symbol: coin_symbol,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.DEPOSIT,
              state: TrnxBlockchainStatus.FAILED,
            };
            Utility_Helper.SendNotification(notifData);
          }
          return true;
        } else if (blockchain_status == TrnxBlockchainStatus.FAILED) {
          let notiMsg =
            trx_data?.coin.token_type === "TRC10"
              ? `Withdraw of NFT(${trx_data?.coin.coin_symbol.toUpperCase()}) with token id ${amount} has been confirmed.`
              : `Withdraw request of ${await Utility_Helper.bigNumberSafeConversion(
                  amount
                )} ${trx_data?.coin.coin_symbol.toUpperCase()} has been failed.`;
          let notifData: any = {
            title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
            message: notiMsg,
            amount: amount,
            from_user_id: 0,
            to_user_id: user_id,
            wallet_address: from_address,
            tx_id: tx_row_id,
            coin_symbol: coin_symbol,
            coin_id: trx_data?.coin?.coin_id,
            tx_type: tx_type,
            notification_type: NotificationTypeEnum.WITHDRAW,
            state: TrnxBlockchainStatus.FAILED,
          };
          Utility_Helper.SendNotification(notifData);
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  public startUpdateBalance = async () => {
    await RabbitMq.consumeQueue(
      this.tron_update_balance_of_coin || "",
      this.user_balance
    );
  };
  public async user_balance(data: any) {
    try {
      console.log(
        "tronUpdatedatain user_balance tron_update_balance_of_coin >>>>>>.",
        data
      );
      if (data) {
        console.log(
          "entered into data in user_balance tron_update_balance_of_coin >>>>>>.",
          data
        );

        let coin_data: any = await coin_queries.coins_find_one(
          [
            "coin_id",
            "coin_family",
            "token_type",
            "coin_symbol",
            "is_token",
            "token_address",
          ],
          { coin_id: data.coin_id }
        );
        console.log(
          "entered in data in user_balance coin_data >>>>>>.",
          data.coin_id
        );
        if (coin_data) {
          console.log(
            "entered in coin_data in user_balance coin_data >>>>>>.",
            coin_data.coin_id
          );

          let balDetails: any = await global_helper.Fetch_Balance(
            coin_data,
            data.wallet_address
          );
          if (balDetails.status) {
            console.log(
              "entered in coin_data coin_id>>>>>",
              data.coin_id,
              "wallet_address>>>",
              data.wallet_address,
              "balance>>>",
              balDetails.balance
            );

            await wallet_queries.wallet_update(
              { balance: balDetails.balance, status: 1 },
              { coin_id: data.coin_id, wallet_address: data.wallet_address }
            );
            console.log("updated successfully");
          }

          if (balDetails.status == false) {
            await global_helper.addingCoinsToQueue(
              config.BACKEND_WALLET_ADDRESSES,
              {
                coin_data: {
                  coin_id: coin_data.coin_id,
                  coin_family: coin_data.coin_family,
                  is_token: coin_data.is_token,
                  token_address: coin_data.token_address,
                  token_type: coin_data.token_type,
                },
                wallet_address: data.wallet_address,
                queue_count: 0,
              }
            );
          }
        } else {
          console.log("data not present for this coin id.", data.coin_id);
        }
      } else {
        console.log("No data present>>>");
      }
    } catch (err: any) {
      console.error("Error in user_balance>>>", err);
    }
  }
  public startUpdateAllBalances = async () => {
    await RabbitMq.consumeQueue(
      this.user_all_coins_bal_update || "",
      this.user_all_balances
    );
  };
  public async user_all_balances(data: any) {
    try {
      console.log("data in user_all_balances user_all_balances >>>>>>.", data);
      if (data) {
        let all_coins: any = await wallet_queries.wallet_with_coins_joint(
          ["wallet_address", "coin_id"],
          { user_id: data.user_id },
          [
            "coin_id",
            "coin_family",
            "token_type",
            "coin_symbol",
            "is_token",
            "token_address",
          ],
          [["wallet_id", "ASC"]]
        );

        if (all_coins) {
          console.log("Data exist in all_coins>>");

          for (let i: number = 0; i < all_coins.length; i++) {
            if (all_coins[i].coin_data) {
              let balDetails: any = await global_helper.Fetch_Balance(
                all_coins[i].coin_data,
                all_coins[i].wallet_address
              );
              if (balDetails.status) {
                console.log(
                  "coin_id>>>>>",
                  all_coins[i].coin_data.coin_id,
                  "wallet_address>>>",
                  all_coins[i].wallet_address,
                  "balance>>>",
                  balDetails.balance
                );

                await wallet_queries.wallet_update(
                  { balance: balDetails.balance },
                  {
                    coin_id: all_coins[i].coin_data.coin_id,
                    wallet_address: all_coins[i].wallet_address,
                  }
                );

                console.log("updated successfully");
              }
              if (balDetails.status == false) {
                await global_helper.addingCoinsToQueue(
                  config.BACKEND_WALLET_ADDRESSES,
                  {
                    coin_data: {
                      coin_id: all_coins[i].coin_data.coin_id,
                      coin_family: all_coins[i].coin_data.coin_family,
                      is_token: all_coins[i].coin_data.is_token,
                      token_address: all_coins[i].coin_data.token_address,
                      token_type: all_coins[i].coin_data.token_type,
                    },
                    wallet_address: all_coins[i].wallet_address,
                    queue_count: 0,
                  }
                );
              }
            } else {
              console.log("no coin data");
            }
          }
        } else {
          console.log("Data not exist in all_coins>>");
        }
      } else {
        console.log("No data present>>>");
      }
    } catch (err: any) {
      console.error("Error in user_all_balances>>>", err);
    }
  }
}
export const tronTxStatusUpdateProcess = new TronTxStatusUpdateProcess();
