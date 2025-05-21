
export enum KEYS {
    latestBlock = 'latestBlock',
    behinedBlock = 'behinedBlock',
    readSpecificBlock = 'readSpecificBlock'
}
export enum Tron_contract_status {
    TransferContract = 'TransferContract',
    TriggerSmartContract = 'TriggerSmartContract',
    TransferAssetContract = 'TransferAssetContract'
}
export enum NotificationTypeEnum {
    ADMIN = "6",
    NONE = 'none',
    INTERNAL = 'internal',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    SMARTCONTRACTINTERACTION = 'smartcontractinteraction',
    SWAP = 'swap',
    REWARD = 'reward',
    PRICE_ALERT = 'price_alert'
}
export enum StatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    ENABLED = 'enabled',
    DISABLED = 'disabled',
    PENDING = 'pending',
    COMPLETE = 'completed',
    FAILED = 'failed',
    CONFIRMED = 'confirmed',
    INITIALIZE = 'initialize',
    BURN = 'burn',
    RELEASE = 'release',
    REVERT = 'revert'
}
export enum GlblBoolean {
    true = 1,
    false = 0
}
export enum TrnxBlockchainStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    CONFIRMED = 'confirmed',
}
export enum TrnxStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
export enum TRONSTATUS {
    SUCCESS = 'SUCCESS',
    REVERT = 'REVERT',
    OUT_OF_ENERGY = 'OUT_OF_ENERGY'
}
export enum TokenManagedByEnum {
    ADMIN = 'admin',
    USERS = 'users'
}
export enum TxReqTypesEnum {
    APP = 'APP',
    EXNG = 'EXNG',
    TRANSAK = 'TRANSAK',
    ALCHEMY = 'ALCHEMY',
    NOTPRESET = 'NOT_PRESENT'
}
export enum TokenStandard {
    NONE = 'null',
    ERC20 = 'erc20',  // ethereum
    ERC721 = 'erc721',  // ethereum

    BEP20 = 'bep20',  // binance
    BEP721 = 'erc721',  // binance

    TRC10 = 'trc10',  // tron
    TRC20 = 'trc20',  // tron
}
export enum BooleanEnum {
    false = '0',
    true = '1'
}
export enum CoinStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}
export enum CoinStatusEnum {
    ACTIVE = 1,
    INACTIVE = 0
}
export enum CoinFamily {
    NONE = 0,
    BNB = 1,
    ETH = 2,
    BTC = 3,
    MATIC = 4,
    LTC = 5,
    TRON = 6
}
export const CoinFamilyEnum_2 = {
    1 : 'BNB', // binance
    2 : 'ETH', // ethereum
    3 : 'BTC', // bitcoin
    4 : 'MATIC', // MATIC
    5 : 'LTC', // litcoin
    6 : 'TRON', // tron
    
}
export enum TrnxTypeEnum {
    NONE = 'none',
    INTERNAL = 'app',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    SMARTCONTRACTINTERACTION = 'smartcontractinteraction',
    REWARD = 'reward',
    DAPP = 'dapp',
    APPROVE = 'approve',
    SWAP = 'swap',
    CROSS_CHAIN = 'cross_chain',
    NULL = 'null',

}