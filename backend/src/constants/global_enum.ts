export enum GlblCoins {
    ETH = 'ETH',
    BTC = 'BTC',
    TRX = 'TRX',
    BNB = 'BNB'
}
export enum TokenType {
    ERC20 = 'ERC20',
    BEP20 = 'BEP20',
    TRC20 = 'TRC20'
}
export enum SWFTCCoins {
    ETH = 'ETH',
    BTC = 'BTC',
    TRX = 'TRX',
    BSC = 'BSC'
}

export const chainId_coinFamily: any = {
    "56": 1,
    "1": 2
}

export const coinFamily_chainId: any = {
    1: "56",
    2: "1"
}


export enum CoinFamily {
    BNB = 1,
    ETH = 2,
    BTC = 3,
    TRX = 6
}

export enum WalletName {
    ETH = 'Eth',
    BTC = 'Btc',
    TRX = 'Trx',
    BNB = 'Bnb'
}
export enum BlockChain {
    ETH = 'eth',
    BNB = 'bnb'
}
//



export enum InfoMessages {
    SERVER_STARTED = "Server Started Successfully",
    DB_CONNECTED = "DB Connected Successfully",
    APP_INFO = "Backend for NovaTide backend application initialized. please try to connect with url.",
    SOCKET_CONN = "🤙Connected to socket server🤙",
}

export enum GlblNetwork {
    ETH = 'Ethereum',
}

export enum GlblBooleanEnum {
    false = 0,
    true = 1
}
export enum GlblAddedBy {
    SWAP = 'swap',
    ADMIN = 'admin',
    USER = 'user'
}
export enum GlblCode {
    SUCCESS = 200,
    INVALID_TOKEN = 401,
    ERROR_CODE = 400,
    NOT_FOUND = 500
}
export enum GlblMessages {
    INFORMATIION_IN_REVIEW = 'Information in Review.',
    FILE_UPLOADED = 'File uploaded successfully.',
    NO_FILE_SELECTED = 'No file is selected.',
    SUCCESS = 'SUCCESS',
    INITIATE_TXN_CREATED = "Transaction created successfully.",
    FAILED = 'FAILED',
    CATCH_MSG = 'Something went wrong. Please try again later.',
    UNABLE_DECODE = 'Unable to decode token.',
    UNABLE_DECODE_DATA = 'Unable to decode data.',
    NO_TOKEN_DETECTED = 'No Token detected.',
    TOKEN_EXIST = 'Token Already Exist.',
    TOKEN_ADDED = 'Token added successfully.',
    UNAUTHORIZED = 'Unauthorized access. Please login to continue.',
    INVALID_COIN_FAMILY = 'Invalid coin family.',
    INVALID_TOKEN = 'Invalid Token, please try again.',
    TOKENS_NOT_FOUND = 'Token not found.',
    COIN_NOT_FOUND = 'Coin not found.',
    SWAP_LIST = 'Get Swap list successfully.',
    UPDATED = 'Updated Successfully.',
    ADDED = 'Added Successfully.',
    APPLIED = 'Applied Successfully.',
    REQUEST_EXECUTED = 'Your request is executed successfully.',
    NO_ADDRESS_FOUND = 'No address found for this user.',
    TOKEN_WALLET_ACTIVE = 'Token Active successfully.',
    TOKEN_WALLET_INACTIVE = 'Token Inactive successfully.',
    TOKENS_SEARCH = 'Token information fetched successfully.',
    LOGOUT = 'Logout successfully.',
    NO_NEW_PASSWORD = 'Unable to create New Password.',
    NOT_SEND_MAIL = 'Unable to send Mail.',
    DATA_NOT_FOUND = 'Data not found.',
    DATA_FETCHED = 'Data fetched successfully.',
    SENT = 'OTP Sent Successfully.',
    EMAIL_EXIST = 'Email already exist.',
    MOBILE_EXIST = 'Mobile number already exist.',
    INVALID_CODE = 'Invalid code!',
    OTP_VERIFIED = 'Otp verified successfully.',
    SESSION_TIMEOUT = 'Session Timeout',
    INVALID_NUMBER = 'Please Enter Valid Mobile Number.',
    SAVED = 'Data Saved.'

}
export enum GlblStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    COMPLETED = 'completed',
    FINISHED = 'FINISHED',
    PAY_FAIL = 'PAY_FAIL'
}
export enum GlblBlockchainTxStatusEnum {
    PENDING = 'pending',
    FAILED = 'failed',
    CONFIRMED = 'confirmed',
}
export enum LoginType {
    JWT = 'jwt',
    EMAIL = 'email'
}
export enum Fiat_Currency {
    USD = 'usd'
}
export enum TxTypesEnum {
    NONE = 'none',
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
    SMARTCONTRACTINTERACTION = "smart_contract",
    SWAP = "Swap",
    APPROVE = "Approve",
    CROSS_CHAIN = "cross_chain",
    DAPP = "dapp",
    BUY = 'buy',
    SELL = 'sell',
    CARDS = 'cards',
    CARD_FEES = 'card_fees',
    CARD_RECHARGE = 'card_recharge',
    LEVEL_UPGRADE = 'level_upgrade',
    LEVEL_UPGRADATION_LEVEL = 'level_upgradation_fee'
}

export enum TxReqTypesEnum {
    APP = 'APP',
    EXNG = 'EXNG',
    NOTPRESET = 'NOT_PRESENT'
}

export enum Status {
    TRUE = 'true',
    FALSE = 'false'
}

export enum RocketXNetworkId {
    TRON = 6,
    ETHEREUM = 2,
    BINANCE = 1
}