import zookeeperConfig from "../helpers/zookeeper.helper";
const name = 'novatide';
export const config = {
  DB_USER: zookeeperConfig.config.DB_USER,
  DB_HOST_READ: zookeeperConfig.config.DB_HOST_READ,
  DB_HOST_WRITE: zookeeperConfig.config.DB_HOST_WRITE,
  DB_DATABASE: zookeeperConfig.config.DB_NAME,
  DB_PASSWORD: zookeeperConfig.config.DB_PASSWORD,
  DB_PORT: zookeeperConfig.config.DB_PORT,//
  BTC_RPC_URL: zookeeperConfig.config.BTC_RPC_URL,
  BTC_API_KEY: zookeeperConfig.config.BTC_API_KEY,
  DEPOSIT_WITHDRAW_PROCESS_BTC: zookeeperConfig.config.DEPOSIT_WITHDRAW_PROCESS_BTC,
  PENDING_WITHDRAWAL_TX_PROCESS_BTC: zookeeperConfig.config.PENDING_WITHDRAWAL_TX_PROCESS_BTC,
  RABBIT_MQ_CONN: zookeeperConfig.config.RABBIT_MQ_CONN,
  REDIS_HOST_WRITE: zookeeperConfig.config.REDIS_HOST_WRITE,
  REDIS_HOST_READ: zookeeperConfig.config.REDIS_HOST_READ,
  REDIS_PORT: zookeeperConfig.config.REDIS_PORT,
  MIN_BLOCK_CONFORMATIONS: zookeeperConfig.config.MIN_BTC_BLOCK_CONFORMATIONS,
  LAST_BLOCK_NUMBER_BTC: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.LAST_BLOCK_NUMBER_BTC}`,
  TOKEN_TYPE_BTC: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.TOKEN_TYPE_BTC}`,
  COIN_FAMILY_BTC: zookeeperConfig.config.COIN_FAMILY_BTC,
  UPDATE_BTC_BLOCK_STATUS: zookeeperConfig.config.UPDATE_BTC_BLOCK_STATUS,
  PREVIOUS_LAST_BLOCK_NUMBER: '',
  BTC_WALLET_ADDRESSES: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.BTC_WALLET_ADDRESS}`,
  SERVER: zookeeperConfig.config.SERVER,
  BACKEND_WALLET_ADDRESSES: zookeeperConfig.config.BACKEND_WALLET_ADDRESSES,
  PUSH_NOTIFICATION_QUEUE: zookeeperConfig.config.PUSH_NOTIFICATION_QUEUE,


  // added new
  KEYS: {
    FCM_PUSH: zookeeperConfig.config.FCM_PUSH
  },

}