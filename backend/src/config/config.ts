import AwsSecretManagerConfig from "../connections/awsSecrets.config";
// import AwsSecretManagerConfig from "../connections/zookeeper.conn";
const name = "novatide";
const parsedCoinGecko = JSON.parse(AwsSecretManagerConfig.config.COIN_GECKO);
export const config = {
  SERVER: AwsSecretManagerConfig.config.SERVER,
  PORT: AwsSecretManagerConfig.config.PORT,
  REDIS_CONN: AwsSecretManagerConfig.config.REDIS_CONN,
  RABBIT_MQ_CONN: AwsSecretManagerConfig.config.RABBIT_MQ_CONN,
  ADMIN_TOKEN: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.ADMIN_TOKEN}`,
  GLOBAL_LIMIT_FOR_MATHCA:
    AwsSecretManagerConfig.config.GLOBAL_LIMIT_FOR_MATHCA,
  ALL_COINS: AwsSecretManagerConfig.config.ALL_COINS,
  CHAINALYSIS_TOKEN: AwsSecretManagerConfig.config.CHAINALYSIS_TOKEN,
  DB: {
    DB_USER: AwsSecretManagerConfig.config.DB_USER,
    DB_PASSWORD: AwsSecretManagerConfig.config.DB_PASSWORD,
    DB_NAME: AwsSecretManagerConfig.config.DB_NAME,
    DB_HOST_WRITE: AwsSecretManagerConfig.config.DB_HOST_WRITE,
    DB_HOST_READ: AwsSecretManagerConfig.config.DB_HOST_READ,
  },

  ON_CHAIN: {
    ONEINCH_API_URL: AwsSecretManagerConfig.config.ONEINCH_API_URL,
    ONEINCH_API_KEY: AwsSecretManagerConfig.config.ONEINCH_API_KEY,
  },
  ON_CHAIN_DATA: AwsSecretManagerConfig.config.ON_CHAIN_DATA,
  BACKEND_WALLET_ADDRESSES:
    AwsSecretManagerConfig.config.BACKEND_WALLET_ADDRESSES,

  COIN_GECKO: JSON.parse(AwsSecretManagerConfig.config.COIN_GECKO),

  ETH_WALLET_ADDRESS: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.ETH_WALLET_ADDRESS}`,
  BNB_WALLET_ADDRESS: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.BSC_WALLET_ADDRESS}`,
  BTC_WALLET_ADDRESS: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.BTC_WALLET_ADDRESS}`,
  TRON_WALLET_ADDRESS: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TRON_WALLET_ADDRESS}`,

  TOKENLIST: {
    ETH: {
      ERC20: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE_ETH}`,
      ERC721: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE721_ETH}`,
    },
    BSC: {
      BEP20: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE_BSC}`,
      ERC721: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE721_BSC}`,
    },
    TRON: {
      TRX20: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE_TRON}`,
      TRX10: `${name}_${AwsSecretManagerConfig.config.SERVER}_${AwsSecretManagerConfig.config.TOKEN_TYPE10_TRON}`,
    },
  },
  ETH_TESTNET_NODE: AwsSecretManagerConfig.config.ETH_TESTNET_NODE,
  BSC_TESTNET_NODE: AwsSecretManagerConfig.config.BSC_TESTNET_NODE,
  JWT_SECRET: AwsSecretManagerConfig.config.JWT_SECRET,
  ENCRYPT_SECRET: AwsSecretManagerConfig.config.ENCRYPT_SECRET,
  REFRESH_SECRET: AwsSecretManagerConfig.config.REFRESH_SECRET,
  FCM_PUSH: AwsSecretManagerConfig.config.FCM_PUSH,
  RSA_PRIVATE_KEY_NAME: AwsSecretManagerConfig.config.RSA_PRIVATE_KEY_NAME,
  RSA_PUBLIC_KEY_NAME: AwsSecretManagerConfig.config.RSA_PUBLIC_KEY_NAME,
  STATIC_COIN_FAMILY: JSON.parse(
    AwsSecretManagerConfig.config.STATIC_COIN_FAMILY
  ),
  NODE: {
    ETH_RPC_URL: AwsSecretManagerConfig.config.ETH_RPC_URL,
    BTC_RPC_URL: AwsSecretManagerConfig.config.BTC_RPC_URL,
    BTC_API_KEY: AwsSecretManagerConfig.config.BTC_API_KEY,
    TRX_RPC_URL: AwsSecretManagerConfig.config.TRX_RPC_URL,
    TRX_API_KEY: AwsSecretManagerConfig.config.TRX_API_KEY,
    BNB_RPC_URL: AwsSecretManagerConfig.config.BNB_RPC_URL,
    ETH_DAPP_RPC_URL: AwsSecretManagerConfig.config.ETH_DAPP_RPC_URL,
  },
  MATCHA_API_KEY: AwsSecretManagerConfig.config.MATCHA_API_KEY,
  ROCKETX_API_KEY: AwsSecretManagerConfig.config.ROCKETX_API_KEY,
  PUSH_NOTIFICATION_QUEUE:
    AwsSecretManagerConfig.config.PUSH_NOTIFICATION_QUEUE,

  CHANGELLY: {
    // CROSS CHAIN
    CHANGELLY_CROSS_CHAIN_BASE_URL:
      AwsSecretManagerConfig.config.CHANGELLY_CROSS_CHAIN_BASE_URL,
    CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY:
      AwsSecretManagerConfig.config.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY,
    CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME:
      AwsSecretManagerConfig.config.CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME,

    // ON_OFF_RAMP
    CHANGELLY_ON_OFF_RAMP_BASE_URL:
      AwsSecretManagerConfig.config.CHANGELLY_ON_OFF_RAMP_BASE_URL,
    CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY:
      AwsSecretManagerConfig.config.CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY,
    CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME:
      AwsSecretManagerConfig.config.CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME,
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
  ],

  ERC721ABI: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokenId", type: "uint256" },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "player", type: "address" },
        { internalType: "string", name: "tokenURI", type: "string" },
      ],
      name: "awardItem",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokenId", type: "uint256" },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokenId", type: "uint256" },
        { internalType: "bytes", name: "_data", type: "bytes" },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bool", name: "approved", type: "bool" },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokenId", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      inputs: [{ internalType: "address", name: "owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "getApproved",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "operator", type: "address" },
      ],
      name: "isApprovedForAll",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "ownerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "tokenURI",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ],
};
