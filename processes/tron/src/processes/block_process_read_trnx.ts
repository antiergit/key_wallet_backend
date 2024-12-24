import { config } from "../config"
import { TrnxTypeEnum, Tron_contract_status } from "../enum"
import { Blockchain_Helper, RabbitMq, Utility_Helper, node_issue_error_log_queries } from "../helpers"
import { blocks_trnx } from "../interface/index"
import tronProcessHelper from "./processes.helper";

class queue_transactions {

    public tron_all_blocks: string = config.TRANSACTIONS.tron_all_blocks;
    public tron_behined_blocks: string = config.TRANSACTIONS.tron_behined_transactions;
    public tron_coin_family: any = config.COIN_FAMILY_TRON;



    public async consume_queue_trnx() {
        try {
            RabbitMq.only_assert_queue(this.tron_all_blocks);
            RabbitMq.only_consume_queue(this.tron_all_blocks, this.read_trnx);

            RabbitMq.only_assert_queue(this.tron_behined_blocks);
            RabbitMq.only_consume_queue(this.tron_behined_blocks, this.read_trnx);

        } catch (err: any) {
            console.error('error in consumeQueueTrnx error >>> ', err);
            return null;
        }
    }
    public async read_trnx(data: blocks_trnx) {
        try {
            console.log("consume started >>> block_number >>", data.block_number, "trnx_id>>>", data.tx_id, "type>>", data.key, "retry_count>>", data.retry_count)

            let is_token: any;

            const trnx: any = await Blockchain_Helper.GetConfirmedTransaction(data.tx_id, data.block_number);
              

            
            if(trnx.status===true){
            if (trnx.data?.ret && trnx.data?.ret[0]?.contractRet == 'SUCCESS') {
                console.log("Success", data.tx_id, "block_number>>>", data.block_number)
                let transaction: any = {
                    tx_id: '',
                    fromAddress: '',
                    toAddress: '',
                    token: null,
                    amount: 0,
                    token_address: '',
                    blockId: 0,
                    isNFTToken: false,
                    txType: null,
                    trnx_fee: 0
                };
                if (trnx.data?.raw_data && trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TransferContract) {
                    console.log("Enterd in TransferContract", data.tx_id)
                    const amount: number = await Blockchain_Helper.tronWeb.fromSun(trnx.data?.raw_data?.contract[0]?.parameter.value.amount)
                    if (trnx.data) {
                        transaction.tx_id = trnx.data.txID;
                        transaction.fromAddress = await Blockchain_Helper.tronWeb.address.fromHex(trnx.data.raw_data?.contract[0]?.parameter.value.owner_address)
                        transaction.toAddress = await Blockchain_Helper.tronWeb.address.fromHex(trnx.data.raw_data?.contract[0]?.parameter.value.to_address)
                        transaction.amount = amount;
                        transaction.blockId = data.block_number;
                    }
                } else if (trnx.data?.raw_data && trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TriggerSmartContract) {
                    console.log("Enterd in TriggerSmartContract", data.tx_id)
                    let contractAddress: any = await Blockchain_Helper.tronWeb.address.fromHex(trnx.data.raw_data?.contract[0]?.parameter.value.contract_address)

                    is_token = await Blockchain_Helper.Trc20_Token(contractAddress)
                    console.log("is_token 1>>>", data.tx_id, is_token ? is_token.coin_id : null, contractAddress)
                    //============================================================================================
                    if (is_token == null) {
                        let response: any = await tronProcessHelper.get_coin_id(trnx)
                        is_token = response.is_token;
                        contractAddress = response.token_address;
                    }
                    //============================================================================================
                    if (is_token != null) {
                        const transactionInfo: any = await Blockchain_Helper.tronWeb.trx.getTransactionInfo(trnx.data.txID)
                        const data1: any = transactionInfo?.log[0]?.data;
                        const amount: any = await Utility_Helper.bigNumberSafeMath((await Blockchain_Helper.tronWeb.toDecimal('0x' + data1)), '/', is_token.decimals)
                        let fromAddress = '';
                        if (transactionInfo?.log[0]?.topics[1]) {
                            const fromAddressHex = transactionInfo?.log[0]?.topics[1].substring(24, transactionInfo?.log[0]?.topics[1].length);
                            fromAddress = await Blockchain_Helper.tronWeb.address.fromHex('41' + fromAddressHex);
                            console.log("fromAddress>>>", fromAddress, trnx.data.txID)
                        }
                        let toAddress = '';
                        if (transactionInfo?.log[0]?.topics[2]) {
                            const toAddressHex = transactionInfo?.log[0]?.topics[2].substring(24, transactionInfo?.log[0]?.topics[2].length);
                            toAddress = await Blockchain_Helper.tronWeb.address.fromHex('41' + toAddressHex);
                            console.log("toAddress>>>", toAddress, trnx.data.txID)

                        }
                        if (trnx.data) {
                            transaction.tx_id = trnx.data.txID;
                            transaction.fromAddress = fromAddress;
                            transaction.toAddress = toAddress;
                            transaction.amount = amount;
                            transaction.blockId = data.block_number;
                            transaction.token_address = contractAddress;
                        }
                    } else {
                        console.log("False>>", is_token);
                        
                    }
                }
                // TRC10
                //  else if (trnx.data.raw_data?.contract[0]?.type == Tron_contract_status.TransferAssetContract) {
                //     console.log("Enterd in TransferAssetContract", data.tx_id)
                //     if (trnx.data) {
                //         transaction.blockId = data.block_number;
                //         transaction.tx_id = trnx.data.txID;
                //         transaction.fromAddress = await Blockchain_Helper.tronWeb.address.fromHex(trnx.data.raw_data?.contract[0]?.parameter.value.owner_address);
                //         transaction.toAddress = await Blockchain_Helper.tronWeb.address.fromHex(trnx.data.raw_data?.contract[0]?.parameter.value.to_address);
                //         const asset_name: any = trnx.data.raw_data?.contract[0]?.parameter.value.asset_name;
                //         console.log("asset_name>>>", asset_name)
                //         transaction.amount = await trnx.data.raw_data?.contract[0]?.parameter.value.amount;
                //         const tokenId: any = await Blockchain_Helper.hexToAscii(asset_name);
                //         console.log("tokenId>>>", tokenId)
                //         let is_token : any = await tronProcessHelper.checkIfContract(tokenId,config.TOKEN_TYPE10_TRON)

                //     }
                // }
                // if (trnx.data?.raw_data && ((trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TransferContract) || (trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TriggerSmartContract && is_token != null) || (trnx.data.raw_data?.contract[0]?.type == Tron_contract_status.TransferAssetContract))) {
                if (trnx.data?.raw_data && ((trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TransferContract) || (trnx.data?.raw_data?.contract[0]?.type == Tron_contract_status.TriggerSmartContract && is_token != null))) {
                    await tron_tx_status_deposit_withdraw.add_trnx_to_queue(transaction)
                } else {
                    console.log("Not added in queue")
                }
            } else {
                console.log("FAILED", data.tx_id);
               


            }
        }
        else{
            //console.log("trxn===>",trnx);
            console.log(`Error in getting the trxn from the tron node  failed::${trnx?.data}`);
            throw new Error(trnx?.data);

        }
        } catch (err: any) {
            console.error("Error in read_trnx>>>", err)
            if (Number(data.retry_count) < 3) {
                data.retry_count = Number(data.retry_count) + 1;
                console.log("Adding transaction in queue>>>", data.retry_count, "transaction id>>>", data)
                await RabbitMq.send_tx_to_queue(config.TRANSACTIONS.tron_behined_transactions, Buffer.from(JSON.stringify(data)))
            }
            // await global_helper.save_error_logs('TRON_read_trnx', err.message)
            await node_issue_error_log_queries.node_issue_error_logs_create({
                function: "read_trnx",
                block_number: (data.block_number).toString(),
                error: err.message,
                transaction_id: data.tx_id,
                from_adrs: null,
                to_adrs: null,
                coin_family: config.COIN_FAMILY_TRON,
                extra: "catch under read_trnx"
            })
        }
    }
    public async add_trnx_to_queue(trnx: any) {
        try {
            let ourTrnx: any;
            let Addressdeposit: any = await tronProcessHelper.check_our_wallet_address(trnx.toAddress)
            if (Addressdeposit) {
                console.log("out deposit address>>>", Addressdeposit)
                ourTrnx = trnx;
                ourTrnx.type = TrnxTypeEnum.DEPOSIT;
            }
            let AddressWithdraw: any = await tronProcessHelper.check_our_wallet_address(trnx.fromAddress)
            if (AddressWithdraw) {
                console.log("out withdraw address>>>", AddressWithdraw)
                ourTrnx = trnx;
                ourTrnx.type = TrnxTypeEnum.WITHDRAW;
            }
            if (AddressWithdraw && Addressdeposit) {
                console.log("out withdraw and deposit address>>>", AddressWithdraw, Addressdeposit)
                ourTrnx = trnx;
                ourTrnx.tx_type = TrnxTypeEnum.INTERNAL;
            }
            if (ourTrnx) {
                await RabbitMq.send_tx_to_queue(config.DEPOSIT_WITHDRAW_PROCESS_TRON, Buffer.from(JSON.stringify(ourTrnx)))
            }
        } catch (err: any) {
            console.error("Error in add_trnx_to_que>>>", err)
            // await global_helper.save_error_logs('TRON_buildTx', err.message)
        }
    }

}
export const tron_tx_status_deposit_withdraw = new queue_transactions()