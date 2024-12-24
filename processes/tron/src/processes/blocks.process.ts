
import { config } from '../config/index';
import { RabbitMq, Blockchain_Helper, node_issue_error_log_queries } from '../helpers/index';
import { blocks_trnx } from '../interface/index';
import { TronOldBLockModel } from '../models/model';
import tronProcessHelper from './processes.helper';
import { KEYS } from '../enum/index';
class Process_Blocks {
   public minBlockConfirmation: number = config.MIN_BLOCK_CONFIRMATIONS_TRON;
   public tron_blocks: string = config.REDISKEYS.TRON_BLOCKS;
   public old_tron_block: string = config.REDISKEYS.OLD_BLOCK_TRON;
   public new_old_block: string = config.REDISKEYS.NEW_BLOCK_TRON;
   public tron_coin_family: any = config.COIN_FAMILY_TRON;
   public tron_behined_transactions: string = config.TRANSACTIONS.tron_behined_transactions;
   public tron_all_blocks: string = config.TRANSACTIONS.tron_all_blocks;
   public behined_blocks: string = config.READ_BEHINED_BLOCK_TRON;
   public blocks: any = config.BLOCKS;
   public all_processes: string = config.REDISKEYS.ALL_PROCESSES;
   public node_alert_tron: string = config.REDISKEYS.NODE_ALERT_TRON;
   public specific_block: string = config.REDISKEYS.SPECIFIC_BLOCK_TRON;


   constructor() { }

   public async getBlocks() {
      try {
         // Get block number (from and to from Redis)
         let old_block: any = await tronProcessHelper.getKeyValuePair(this.tron_blocks, this.old_tron_block)
         let new_block: any = await tronProcessHelper.getKeyValuePair(this.tron_blocks, this.new_old_block)

         if (!old_block) {
            console.log("No block present in old block")
            await tronProcessHelper.setBlocks(this.tron_blocks, this.old_tron_block, this.minBlockConfirmation, null)
         }
         if (!new_block) {
            console.log("No block present in new block")
            await tronProcessHelper.setBlocks(this.tron_blocks, this.new_old_block, this.minBlockConfirmation, null)
         }

         if (old_block && new_block) {
            let oldBlock: number = Number(old_block);
            let newBlock = Number(new_block);
            if (newBlock <= oldBlock) {
               await tronProcessHelper.setBlocks(this.tron_blocks, this.new_old_block, this.minBlockConfirmation, newBlock)
            } else {
               let block_diff: number = newBlock - oldBlock;
               if (block_diff > 100) {
                  await tronProcessHelper.diffence_blocks_add_in_db(newBlock, oldBlock)
                  await tronProcessHelper.setKeyValuePair(this.tron_blocks, this.old_tron_block, newBlock.toString())
                  await tronProcessHelper.setBlocks(this.tron_blocks, this.new_old_block, this.minBlockConfirmation, newBlock)
               } else {
                  await this.readBlocks(oldBlock, newBlock)
               }
            }
         } else {
            console.log(" no old block and no new block")
            // await global_helper.save_error_logs('TRON_setBlocks', 'No old block no new block')
         }
      } catch (err: any) {
         console.error("Error in getBlocks", err)
         // await global_helper.save_error_logs('Tron_getBlocks', err.message)
         await node_issue_error_log_queries.node_issue_error_logs_create({
            function: "getBlocks",
            block_number: null,
            error: err.message,
            transaction_id: null,
            from_adrs: null,
            to_adrs: null,
            coin_family: this.tron_coin_family,
            extra: "catch under getBlocks"
         })
      }
   }
   public async readBlocks(blockNumber: number, toBlockNumber: number) {
      try {
         console.debug(`------------------readBlocks---------------------`, blockNumber);

         let block_updated: number = blockNumber + 1;
         // Setting block number in redis
         await tronProcessHelper.setKeyValuePair(this.tron_blocks, this.old_tron_block, block_updated.toString());
         console.table({
            LATEST_BLOCK: blockNumber,
            BLOCK_DIFFERENCE: toBlockNumber - blockNumber,
            TO_BLOCK_NUMBER: toBlockNumber
         });
         await this.getTxFromBlock(blockNumber, KEYS.latestBlock);
      } catch (err: any) {
         console.error("Error in readBlocks:", (err as Error).message);
         // await global_helper.save_error_logs('TRON_readBlocks', err.message)
      }

   }
   public async getTxFromBlock(block_number: number, key: string) {
      try {
         const getBlock = await Blockchain_Helper.tronWeb.trx.getBlock(block_number);
            // console.log("getBlock::",getBlock);
         const blockInfo: any = getBlock.transactions;
       
         if (!getBlock.transactions) return;

         for await (let transactions of blockInfo) {

            let data: blocks_trnx = {
               block_number: block_number,
               tx_id: transactions.txID,
               retry_count: 0,
               key: null,
               pair: null
            }

            if (key == KEYS.latestBlock) {
               data.key = 'latest'
               // let queue_length: any = await RabbitMq.queue_length(this.tron_all_blocks)
               // console.log("queue_length>>>", queue_length)
               console.log("latest added to queue block>>", data.block_number, "tx_id>>", data.tx_id)
               await RabbitMq.send_tx_to_queue(this.tron_all_blocks, Buffer.from(JSON.stringify(data)))

            } else {
               data.key = 'behined & specific'
               console.log("behined added to queue block>>", data.block_number, "tx_id>>", data.tx_id)
               await RabbitMq.send_tx_to_queue(this.tron_behined_transactions, Buffer.from(JSON.stringify(data)))
            }
         }
      } catch (err: any) {
         console.error(`error in getTxFromBlock error >>>`, err);
         await TronOldBLockModel.create({ block_number: block_number, coin_family: this.tron_coin_family, start_block: block_number, end_block: block_number, status: 0 })
         // await global_helper.save_error_logs('TRON_getTxFromBlock', err.message)
         await node_issue_error_log_queries.node_issue_error_logs_create({
            function: "getTxFromBlock",
            block_number: block_number.toString(),
            error: err.message,
            transaction_id: null,
            from_adrs: null,
            to_adrs: null,
            coin_family: this.tron_coin_family,
            extra: "catch under getTxFromBlock"
         })
      }
   }
   public async readBehindBlock() {
      try {
         // REDIS BASED
         let data_exist: any = await tronProcessHelper.getKeyValuePair(this.blocks, this.behined_blocks)
         let data_exists = JSON.parse(data_exist)
         if (data_exists) {
            console.log("This block exist in redis read behined")

            let id = data_exists.id
            let end_block = data_exists.end_block
            let start_block = data_exists.start_block

            if (end_block > start_block) {
               console.log("This block go for getTxFromBlock")

               await this.getTxFromBlock(start_block, KEYS.behinedBlock);
               start_block = start_block + 1;
               let add_data = {
                  id: id,
                  start_block: start_block,
                  end_block: end_block,
                  diff: end_block - start_block
               }
               await tronProcessHelper.setKeyValuePair(this.blocks, this.behined_blocks, JSON.stringify(add_data))
            } else {
               console.log("id>>>>>>>>>>>", id)
               await TronOldBLockModel.update({ status: 1 }, { where: { id: id } })
               await tronProcessHelper.deleteKeyValuePair(this.blocks, this.behined_blocks)
               await tronProcessHelper.behindBlocks()
            }
         } else {
            await tronProcessHelper.behindBlocks()
         }
      } catch (err: any) {
         console.error("Error in readBehindBlock>>>>", err)
         // await global_helper.save_error_logs('TRON_readBehindBlock', err.message)
      }
   }
   public async readSpecificBlock() {
      try {
         console.log("Entere into readSpecificBlock>>>")
         let specificBlocks: any = await tronProcessHelper.getKeyValuePair(this.all_processes, this.specific_block)

         let specific_block: any = JSON.parse(specificBlocks);

         if (specific_block && Number(specific_block) > 0) {
            console.table({ SPECIFIC_BLOCK: specific_block })
            await this.getTxFromBlock(specific_block, KEYS.readSpecificBlock)
            await tronProcessHelper.setKeyValuePair(this.all_processes, this.specific_block, '0')
         } else {
            console.log("Specific block is not present>>>>")
            await tronProcessHelper.setKeyValuePair(this.all_processes, this.specific_block, '0')
         }
      } catch (err: any) {
         console.error("Error in readSpecificBlock>>>", err)
         // await global_helper.save_error_logs('TRON_readSpecificBlock', err.message)
      }
   }
   public async testingNode() {
      try {
         // Get Block Number
         const getBlockInfo: any = await Blockchain_Helper.tronWeb.trx.getCurrentBlock();
         console.debug("getBlockInfo >>>>>>>>>>>", getBlockInfo.block_header.raw_data.number)

         // Get Block Info
         const getBlock = await Blockchain_Helper.tronWeb.trx.getBlock(getBlockInfo.block_header.raw_data.number);
         const blockInfo: any = getBlock.transactions;
         // console.log("blockInfo>>", blockInfo[0].txID)

         // Get Block Receipt
         // const transaction: any = await Blockchain_Helper.GetConfirmedTransaction(blockInfo[0].txID)
         // console.log("txreceipt>>", transaction)

      } catch (err: any) {
         console.error("Error in testingNode>>", err)
      }
   }

}
export let TronProcessBlocks = new Process_Blocks();


