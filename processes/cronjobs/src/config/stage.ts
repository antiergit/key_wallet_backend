import zookeeperConfig from "../helpers/common/zookeeper.helper";
const name = "novatide";

export const config = {
  APP_NAME: zookeeperConfig.config.APP_NAME,
  SERVER: zookeeperConfig.config.SERVER,
  PORT: zookeeperConfig.config.PORT,
  DB: {
    DB_USER: zookeeperConfig.config.DB_USER,
    DB_PASSWORD: zookeeperConfig.config.DB_PASSWORD,
    DB_NAME: zookeeperConfig.config.DB_NAME,
    DB_HOST_WRITE: zookeeperConfig.config.DB_HOST_WRITE,
    DB_HOST_READ: zookeeperConfig.config.DB_HOST_READ,
  },
  RABBIT_MQ: zookeeperConfig.config.RABBIT_MQ_CONN,
  BACKEND_WALLET_ADDRESSES: zookeeperConfig.config.BACKEND_WALLET_ADDRESSES,
  REDIS_CONN: zookeeperConfig.config.REDIS_CONN,
  STATIC_COIN_FAMILY: zookeeperConfig.config.STATIC_COIN_FAMILY,
  NODE: {
    ETH_RPC_URL: zookeeperConfig.config.ETH_RPC_URL,
    BTC_RPC_URL: zookeeperConfig.config.BTC_RPC_URL,
    BTC_API_KEY: zookeeperConfig.config.BTC_API_KEY,
    TRX_RPC_URL: zookeeperConfig.config.TRX_RPC_URL,
    TRX_API_KEY: zookeeperConfig.config.TRX_API_KEY,
    BNB_RPC_URL: zookeeperConfig.config.BNB_RPC_URL
  },
  PUSH_NOTIFICATION_QUEUE: zookeeperConfig.config.PUSH_NOTIFICATION_QUEUE,
  ETH: {
    GAS_FEE_URL: zookeeperConfig.config.ETH.GAS_FEE_URL,
    GAS_FEE_API_KEY: zookeeperConfig.config.ETH.GAS_FEE_API_KEY,
    ETH_WALLET_ADDRESS: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.ETH_WALLET_ADDRESS}`,
    TOKEN_TYPE_ETH: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.TOKEN_TYPE_ETH}`,

  },
  BNB: {
    GAS_FEE_URL: zookeeperConfig.config.BNB.GAS_FEE_URL,
    GAS_FEE_API_KEY: zookeeperConfig.config.BNB.GAS_FEE_API_KEY,
    BNB_WALLET_ADDRESS: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.BSC_WALLET_ADDRESS}`,
    TOKEN_TYPE_BSC: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.TOKEN_TYPE_BSC}`,
  },
  BTC: {
    BTC_WALLET_ADDRESS: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.BTC_WALLET_ADDRESS}`,
  },
  TRON: {
    TRON_WALLET_ADDRESS: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.TRON_WALLET_ADDRESS}`,
    TOKEN_TYPE_TRON: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.TOKEN_TYPE_TRON}`,

  },
  REDISKEYS: {
    COIN_LIMIT_COUNTS: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.COIN_LIMIT_COUNTS}`,
    COIN_LIMIT_COUNT_FIELD: zookeeperConfig.config.COIN_LIMIT_COUNT_FIELD,
  },
  COIN_GECKO: {
    COIN_GECKO_MARKET: zookeeperConfig.config.COIN_GECKO.COIN_GECKO_MARKET,
    COIN_GECKO_BY_TOKEN: zookeeperConfig.config.COIN_GECKO.COIN_GECKO_BY_TOKEN,
    API_KEY: zookeeperConfig.config.COIN_GECKO.API_KEY
  },
  PENDING_CROSS_CHAIN_TX_TOPIC: `${name}_${zookeeperConfig.config.SERVER}_${zookeeperConfig.config.PENDING_CROSS_CHAIN_TX_TOPIC}`,
  CHANGELLY: {
    // CROSS CHAIN
    CHANGELLY_CROSS_CHAIN_BASE_URL: zookeeperConfig.config.CHANGELLY_CROSS_CHAIN_BASE_URL,
    CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY: zookeeperConfig.config.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY,
    CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME: zookeeperConfig.config.CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME,

    // ON_OFF_RAMP
    CHANGELLY_ON_OFF_RAMP_BASE_URL: zookeeperConfig.config.CHANGELLY_ON_OFF_RAMP_BASE_URL,
    CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY: zookeeperConfig.config.CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY,
    CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME: zookeeperConfig.config.CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME

  },
  CONTRACT_ABI: [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [],
      name: "stop",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "INITIAL_SUPPLY",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
      ],
      name: "mint",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [{ name: "_value", type: "uint256" }],
      name: "burn",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_subtractedValue", type: "uint256" },
      ],
      name: "decreaseApproval",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimalFactor",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "stopped",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [],
      name: "start",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_addedValue", type: "uint256" },
      ],
      name: "increaseApproval",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [{ name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ name: "ownerAdrs", type: "address" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "burner", type: "address" },
        { indexed: false, name: "value", type: "uint256" },
      ],
      name: "Burn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "previousOwner", type: "address" },
        { indexed: true, name: "newOwner", type: "address" },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "owner", type: "address" },
        { indexed: true, name: "spender", type: "address" },
        { indexed: false, name: "value", type: "uint256" },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        { indexed: false, name: "value", type: "uint256" },
      ],
      name: "Transfer",
      type: "event",
    },
  ]
}




