import AwsSecretManagerConfig from "../helpers/awsSecrets.config";
import zookeeperConfig from "../helpers/zookeeper.helper";
const name = 'novatide';
export const config = {
  DB_USER: AwsSecretManagerConfig.config.DB_USER,
  DB_HOST_READ: AwsSecretManagerConfig.config.DB_HOST_READ,
  DB_HOST_WRITE: AwsSecretManagerConfig.config.DB_HOST_WRITE,
  DB_DATABASE: AwsSecretManagerConfig.config.DB_NAME,
  DB_PASSWORD: AwsSecretManagerConfig.config.DB_PASSWORD,
  DB_PORT: AwsSecretManagerConfig.config.DB_PORT,//
  BTC_RPC_URL: AwsSecretManagerConfig.config.BTC_RPC_URL,
  BTC_API_KEY: AwsSecretManagerConfig.config.BTC_API_KEY,
  DEPOSIT_WITHDRAW_PROCESS_BTC: AwsSecretManagerConfig.config.DEPOSIT_WITHDRAW_PROCESS_BTC,
  PENDING_WITHDRAWAL_TX_PROCESS_BTC: AwsSecretManagerConfig.config.PENDING_WITHDRAWAL_TX_PROCESS_BTC,
  RABBIT_MQ_CONN: AwsSecretManagerConfig.config.RABBIT_MQ_CONN,
  REDIS_HOST_WRITE: AwsSecretManagerConfig.config.REDIS_HOST_WRITE,
  REDIS_HOST_READ: AwsSecretManagerConfig.config.REDIS_HOST_READ,
  REDIS_PORT: AwsSecretManagerConfig.config.REDIS_PORT,
  MIN_BLOCK_CONFORMATIONS: AwsSecretManagerConfig.config.MIN_BTC_BLOCK_CONFORMATIONS,
  LAST_BLOCK_NUMBER_BTC: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.LAST_BLOCK_NUMBER_BTC}`,
  TOKEN_TYPE_BTC: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE_BTC}`,
  COIN_FAMILY_BTC: AwsSecretManagerConfig.config.COIN_FAMILY_BTC,
  UPDATE_BTC_BLOCK_STATUS: AwsSecretManagerConfig.config.UPDATE_BTC_BLOCK_STATUS,
  PREVIOUS_LAST_BLOCK_NUMBER: '',
  BTC_WALLET_ADDRESSES: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.BTC_WALLET_ADDRESS}`,
  SERVER: AwsSecretManagerConfig.config.SERVER,
  BACKEND_WALLET_ADDRESSES: AwsSecretManagerConfig.config.BACKEND_WALLET_ADDRESSES,
  PUSH_NOTIFICATION_QUEUE: AwsSecretManagerConfig.config.PUSH_NOTIFICATION_QUEUE,


  // added new
  KEYS: {
    FCM_PUSH: AwsSecretManagerConfig.config.FCM_PUSH
  },

}