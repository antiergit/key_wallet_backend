import axios from 'axios';
import WalletModel from '../models/model/model.wallets'
import tronProcessHelper from '../processes/processes.helper';
import { config } from '../config';
import { CatchErrorMsgsModel, CustomTokennModel } from '../models/model';
import { CoinFamily } from '../enum';
import { Blockchain_Helper } from './blockchain.helper';
import utxo from './utxo';
import { RabbitMq } from './rabbitmq.helper';


class Global_helper {
    public async save_error_logs(fn_name: string, error_message: any) {
        try {
            let value_exist: any = await tronProcessHelper.getKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.TRON_ERROR_LOGS)
            if (value_exist) {
                if (Number(value_exist) == 0) {
                    await CatchErrorMsgsModel.create({
                        fx_name: fn_name,
                        error_msg: error_message || {}
                    })
                    await tronProcessHelper.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.TRON_ERROR_LOGS, '1')
                } else {
                    console.log("value other than 0 exist")
                }
            } else {
                await tronProcessHelper.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.TRON_ERROR_LOGS, '0')
                console.log("value does not exist")
            }
        } catch (err: any) {
            console.error("Error in save_error_logs", err)
        }
    }
    public async Fetch_Balance(coin_data: any, wallet_address: string,) {
        let balance: any;
        try {     
            switch (coin_data.coin_family) {
                case CoinFamily.BNB:
                    console.log("bnb bnb")
                    balance = await Blockchain_Helper.Fetch_Balance_bnb(wallet_address, coin_data)

                    break;

                case CoinFamily.ETH:
                    console.log("eth eth")
                    balance = await Blockchain_Helper.ETH_Fetch_Balance(wallet_address, coin_data)

                    break;

                case CoinFamily.BTC:
                    console.log("btc btc")
                    balance = await utxo.getUserBtcBalance(wallet_address)
                    break;

                case CoinFamily.TRON:
                    console.log("trx trx")
                    console.log("coindatafortroncheck::",coin_data);
                    balance = await Blockchain_Helper.TRX_Fetch_Balance(wallet_address, coin_data)
                    console.log("balanceTroncheck:",balance);
                    
                    break;
            }
            return { status: true, balance: balance };
        } catch (err: any) {
            console.error(`error in WalletHelper Fetch_Balance error >>>`, err);
            return { status: false, balance: 0 };
        }
    }
    public async send_mail(email: string, text: string, subject: string) {
        try {
            const MAILGUN_API_KEY: string = `${config.MAILGUN.MAILGUN_API_KEY}`;
            const MAILGUN_DOMAIN: string = `${config.MAILGUN.MAILGUN_DOMAIN}`;
            const MAILGUN_BASE_URL: string = `${config.MAILGUN.MAILGUN_BASE_URL}${MAILGUN_DOMAIN}`;
            const response: any = await axios({
                method: 'post',
                url: `${MAILGUN_BASE_URL}/messages`,
                auth: {
                    username: 'api',
                    password: MAILGUN_API_KEY
                },
                params: {
                    from: config.MAILGUN.FROM_GMAIL,
                    to: email,
                    subject: subject,
                    html: text
                }
            });
        } catch (err: any) {
            console.error("send_mail", err)
            await this.save_error_logs("TRON_MAILGUN_ERROR", err.message)
        }
    }
    public async addingCoinsToQueue(queueName: string, data: any) {
        try {
            await RabbitMq.assertQueueDurableFalse(queueName)
            await RabbitMq.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in addingCoinsToQueue>>>", err.message)
            return false;
        }
    }
}
export let global_helper = new Global_helper();
