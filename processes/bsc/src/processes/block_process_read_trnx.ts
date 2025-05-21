import { Blockchain_Helper } from "../helpers/index";
import { config } from "../config/config";
import bscProcessHelper from "./process.helper";
import { KEYS } from "../enum";
import { blocks_trnx } from "../interfaces/global_helper";
import rabbitMq from "../config/rabbitMq";
import { Op } from "sequelize";
import { global_helper } from "../helpers/global_helper";
import { behindBlockQueries } from '../helpers/dbHelper/index'
import { BehindBlockModel } from "../models";


class Bsc_block_process {
    public minBlockConfirmation: number;
    public swap: string | null;
    public approval: string | null;

    constructor() {
        this.minBlockConfirmation = Number(config.MIN_BLOCK_CONFORMATIONS);
        this.swap = Blockchain_Helper.BSC_Web3.utils.sha3('Swap(address,uint256,uint256,uint256,uint256,address)');
        this.approval = Blockchain_Helper.BSC_Web3.utils.sha3('Approval(address,address,uint256)');
    }

    public async getBlocks() {
        try {
            let old_block: any = await bscProcessHelper.getKeyValuePair(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.OLD_BLOCK_BSC)
            let new_block: any = await bscProcessHelper.getKeyValuePair(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.NEW_BLOCK_BSC)
            if (!old_block) {
                console.log("No block present in old block")
                await bscProcessHelper.setBlocks(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.OLD_BLOCK_BSC, this.minBlockConfirmation, null)
            }
            if (!new_block) {
                console.log("No block present in new block")
                await bscProcessHelper.setBlocks(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.NEW_BLOCK_BSC, this.minBlockConfirmation, null)
            }
            if (old_block && new_block) {
                let oldBlock: number = Number(old_block);
                let newBlock = Number(new_block);
                if (newBlock <= oldBlock) {
                    await bscProcessHelper.setBlocks(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.NEW_BLOCK_BSC, this.minBlockConfirmation, newBlock)
                } else {
                    let block_diff: number = newBlock - oldBlock;
                    if (block_diff > 50) {
                        await bscProcessHelper.diff_blocks_add_in_db(newBlock, oldBlock)
                        await bscProcessHelper.setKeyValuePair(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.OLD_BLOCK_BSC, newBlock.toString())
                        await bscProcessHelper.setBlocks(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.NEW_BLOCK_BSC, this.minBlockConfirmation, newBlock)
                    } else {
                        await this.readBlocks(oldBlock, newBlock)
                    }
                }
            } else {
                console.log(" no old block and no new block")
                await global_helper.save_error_logs('Bsc_setBlocks', 'No old block no new block')
            }
        } catch (err: any) {
            console.error("Error in getBlocks", err)
            await global_helper.save_error_logs('bsc_getBlocks', err.message)
        }
    }
    public async readBlocks(blockNumber: number, toBlockNumber: number) {
        try {
            console.log("blockNumber", blockNumber)
            let block_updated: number = blockNumber + 1;
            await bscProcessHelper.setKeyValuePair(config.REDISKEYS.BSC_BLOCKS, config.REDISKEYS.OLD_BLOCK_BSC, block_updated.toString());
            console.log("blockNumber updated", block_updated)
            console.table({
                LATEST_BLOCK: blockNumber,
                BLOCK_DIFFERENCE: toBlockNumber - blockNumber,
                TO_BLOCK_NUMBER: toBlockNumber
            });
            await this.getTxFromBlock(blockNumber, KEYS.latestBlock);
        } catch (err: any) {
            console.error("Error in readBlocks>>.", (err as Error).message)
            await global_helper.save_error_logs('BSC_readBlocks', err.message)
        }
    }
    public async getTxFromBlock(blockId: number, key: string) {
        const { getBlock } = Blockchain_Helper.BSC_Web3.eth;
        console.log("blockId :::::", blockId)

        try {
            const blockInfo = await getBlock(blockId, true);
            if (blockInfo) {
                if (blockInfo.transactions) {
                    console.log('blockInfo.transactions >>>', blockInfo?.transactions?.length);
                    for await (let tx of blockInfo.transactions) {
                        // console.log('tx >>>', tx, ' Block >>>>', blockId);
                        let data: blocks_trnx = {
                            block_number: blockId,
                            tx_id: tx.hash ? tx.hash : '',
                            value: tx.value ? tx.value : '',
                            fromAddress: tx.from ? tx.from : '',
                            toAddress: tx.to ? tx.to : '',
                            retry_count: 0,
                            key: null,
                            pair: null
                        }
                        if (key == KEYS.latestBlock) {
                            data.key = 'latest';
                            // let queue_length: any = await rabbitMq.queue_length(config.TRANSACTIONS.bsc_all_blocks)
                            // console.log("queue_length>>>", queue_length)
                            rabbitMq.send_tx_to_queue(config.TRANSACTIONS.bsc_all_blocks, Buffer.from(JSON.stringify(data)))

                        } else {
                            console.log('Read Specific >>>', data);
                            data.key = 'behined & specific'
                            rabbitMq.send_tx_to_queue(config.TRANSACTIONS.bsc_behined_transactions, Buffer.from(JSON.stringify(data)))
                        }
                    }
                } else {
                    console.log("no block info trnasactions")
                }
            } else {
                console.log("No blockinfo")
                await behindBlockQueries.create({
                    start_block: blockId,
                    end_block: blockId,
                    coin_family: config.STATIC_COIN_FAMILY.BNB,
                    status: 0
                })
            }
        } catch (err: any) {
            console.error("Error in getTxFromBlock:", (err as Error).message);
            await global_helper.save_error_logs('MATIC_readBehindBlock', err.message)
        }
    }
    public async readBehindBlock() {
        try {
            // REDIS BASED
            let data_exist: any = await bscProcessHelper.getKeyValuePair(config.BLOCKS, config.READ_BEHINED_BLOCK_BSC)
            let data_exists = JSON.parse(data_exist)
            if (data_exists) {
                console.log("This block exist in redis read behined")

                let id = data_exists.id
                let end_block = data_exists.end_block
                let start_block = data_exists.start_block

                if (end_block > start_block) {
                    console.log("This block go for getTxFromBlock")
                    await bsc_blocks_process.getTxFromBlock(start_block, KEYS.behinedBlock);
                    start_block = start_block + 1;
                    let add_data = {
                        id: id,
                        start_block: start_block,
                        end_block: end_block,
                        diff: end_block - start_block
                    }
                    let dataaaaa_exist: any = await bscProcessHelper.setKeyValuePair(config.BLOCKS, config.READ_BEHINED_BLOCK_BSC, JSON.stringify(add_data))
                } else {
                    console.log("id>>>>>>>>>>>", id)
                    //await behindBlockQueries.destroy({ id: id })
                    await BehindBlockModel.update({ status: 1 }, { where: { id: id } })
                    await bscProcessHelper.deleteKeyValuePair(config.BLOCKS, config.READ_BEHINED_BLOCK_BSC)

                    let behindBlocks: any = await bscProcessHelper.behindBlocks()

                }
            } else {
                // DB BASED
                let behindBlocks: any = await bscProcessHelper.behindBlocks()
            }

            // REDIS BASED
            // let data: any = await ethProcessHelper.getHashTable(config.READ_BEHINED_BLOCK_BSC)
            // console.log("data?>>??", data.length)
            // if (data.length > 0) {
            //     for (let i: number = 0; i < data.length; i++) {
            //         await eth_blocks_process.getTxFromBlock(Number(data[i]), KEYS.behinedBlock);
            //         await ethProcessHelper.deleteKeyValuePair(config.READ_BEHINED_BLOCK_BSC, data[i].toString())
            //     }
            // }
        } catch (err: any) {
            console.error("Error in readBehindBlock>>", err)
            await global_helper.save_error_logs('BSC_readBehindBlock', err.message)
        }
    }
    public async readSpecificBlock() {
        try {
            console.log("Entere into readSpecificBlock37730006>>>")
            let specificBlocks: any = await bscProcessHelper.getKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.SPECIFIC_BLOCK_BSC)
            let specific_block: any = JSON.parse(specificBlocks);
            if (specific_block && Number(specific_block) > 0) {
                console.table({ SPECIFIC_BLOCK: specific_block })
                console.log("read specific block ", specific_block);
                await this.getTxFromBlock(specific_block, KEYS.readSpecificBlock)
                await bscProcessHelper.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.SPECIFIC_BLOCK_BSC, '0')
            } else {
                console.log("Specific block is not present>>>>")
                await bscProcessHelper.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.SPECIFIC_BLOCK_BSC, '0')
            }
        } catch (error: any) {
            console.error("Error in readSpecificBlock>>>", error)
        }
    }
    public async testingNode() {
        try {
            // Get Block Number
            let { getBlockNumber } = Blockchain_Helper.BSC_Web3.eth;
            let latestBlock = await getBlockNumber();
            console.log("Block  number>>", latestBlock)

            // Get Block Info
            const { getBlock } = Blockchain_Helper.BSC_Web3.eth;
            const blockInfo = await getBlock(latestBlock, true);
            console.log("blockInfo>>", blockInfo)

            // Get Block Receipt
            const { getTransactionReceipt } = Blockchain_Helper.BSC_Web3.eth;
            const txReceipt = await getTransactionReceipt(blockInfo.transactions[0].hash);
            console.log("txreceipt>>", txReceipt)

            // Get more details which was reduced
            const { getTransaction } = Blockchain_Helper.BSC_Web3.eth;
            const transaction = await getTransaction(blockInfo.transactions[0].hash);
            console.log("transaction>>", transaction)

        } catch (err: any) {
            console.error("Error in testingNode>>", err)
        }
    }
}

export const bsc_blocks_process = new Bsc_block_process();