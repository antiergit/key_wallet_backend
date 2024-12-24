import TronWeb from 'tronweb';
import { config } from '../../config';
import { exponentialToDecimal } from '../../helpers/common/globalFunctions';



class TronHelper {
    public TRX_FULLNODE: string = config.NODE.TRX_RPC_URL
    public tronWeb: any;

    constructor() {
        this.tronWeb = new TronWeb({
            fullHost: this.TRX_FULLNODE,
            headers: { apikey: config.NODE.TRX_API_KEY }
        });

    }
    public async getBalance(address: string, coin: any) {
        try {
            let balance: number = 0;
            if (coin.is_token == 1) {
                switch (coin.token_type.toLowerCase()) {
                    case 'trc20':
                        balance = await this.trc20TokenBal(
                            address, //// wallet_address
                            coin.token_address /// contract_address
                        )
                        break;
                    default:
                        balance = 0
                        break;
                }
            } else {
                balance = await this.trxCoinBal(address);
            }
            return balance
        } catch (err: any) {
            console.error(`Error in getBalance of tron 🔥 ~ ~ `, err.message);
            throw err;
        }
    }
    public async trc20TokenBal(address: string, contract_address: string) {
        try {
            await this.tronWeb.setAddress(contract_address);
            let contract = await this.tronWeb.contract().at(contract_address);
            let decimals = await contract.decimals().call();
            if (decimals._hex != undefined) {
                decimals = await this.tronWeb.toDecimal(decimals._hex);
            }
            let balanceOf = await contract.balanceOf(address).call();
            let toDecimal = await this.tronWeb.toDecimal(balanceOf._hex);
            if (balanceOf._hex == undefined) {
                toDecimal = await this.tronWeb.toDecimal(
                    balanceOf.balance._hex
                );
            }
            let expToDecimal = await exponentialToDecimal(toDecimal);
            let balance = Number(expToDecimal) / Math.pow(10, decimals);
            return balance;
        } catch (err: any) {
            console.error(`Error in trc20TokenBal error 🔥 ~ ~`, err.message);
            throw err;
        }
    }
    public async trxCoinBal(address: string) {
        try {
            return await this.tronWeb.trx.getBalance(address).then(async (result: any) => {
                return await this.tronWeb.fromSun(result);
            });
        } catch (err: any) {
            console.error(`Error in trxCoinBal error 🔥 ~ ~`, err.message);
            throw err;
        }
    }
    public async getTransactionInfo(transactionId: string) {

        let fromAddress: string = 'INTERNAL';
        let blockId: number = 0
        try {
            const transaction: any = await this.tronWeb.trx.getTransaction(transactionId);
            let tx: any = transaction;
            if (
                tx?.raw_data &&
                tx?.raw_data.contract[0].type == 'TransferContract'
            ) {
                if (tx) {
                    fromAddress = await this.tronWeb.address.fromHex(
                        tx.raw_data.contract[0].parameter.value.owner_address
                    );
                    blockId = 0
                } else {
                    return { status: false };
                }
            } else if (
                tx?.raw_data &&
                tx?.raw_data.contract[0].type == 'TriggerSmartContract'
            ) {
                const transactionInfo = await this.tronWeb.trx.getTransactionInfo(
                    tx.txID
                );
                if (transactionInfo.log[0].topics[1]) {
                    const fromAddressHex = transactionInfo.log[0].topics[1].substring(24, transactionInfo.log[0].topics[1].length);
                    fromAddress = await this.tronWeb.address.fromHex('41' + fromAddressHex);
                } else {
                    return { status: false };
                }
                blockId = transactionInfo.blockNumber;
            } else if (
                tx.raw_data.contract[0].type == 'TransferAssetContract'
            ) {
                if (tx) {
                    fromAddress = await this.tronWeb.address.fromHex(
                        tx.raw_data.contract[0].parameter.value.owner_address
                    );
                } else {
                    return { status: false };
                }
                blockId = 0
            }
            return {
                status: true,
                data: {
                    fromAddress: fromAddress,
                    blockId: blockId
                }
            }
        } catch (err: any) {
            console.error("Error in getTransactionInfo of Tron  🔥 ~ ~", err.message)
            return { status: false };
        }
    }
}
const tronHelper = new TronHelper();
export default tronHelper;
