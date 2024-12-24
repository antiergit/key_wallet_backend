import { chainId_coinFamily, coinFamily_chainId } from "../../constants/global_enum";
import { config } from "../../config";

import { ethWeb3 } from "../../helpers/common/web3_eth_helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";

import axios from "axios";
class OnChainHelpers implements OnlyControllerInterface {
    public on_chain_api_url: string;
    constructor() {
        this.initialize();
        this.on_chain_api_url = config.ON_CHAIN.ONEINCH_API_URL;
    }
    public initialize() { }
    /**
      * 1inch
      */

    public OneInchSwapApi = async (chain_id: any, src: any, dst: any, amount: any, from: any, slippage: any, fee: any, referrer: any, mainRouteParts: any, parts: any) => {
        try {
            let configUrl1 = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/liquidity-sources`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };
            //  console.log("OneInchSwapApiconfig1--->", config);
            const resp = await axios(configUrl1);
            const protocols: any = resp.data.protocols;
            // console.log("protocols ",protocols);
            let filteredIds = protocols.filter((protocol: any) => {
                return !protocol.id.includes('ONE_INCH_LIMIT_ORDER')
            }).map((protocol: any) => {
                return protocol.id
            });
            let protocolsString: string = filteredIds.join(",");
            
            if(fee&&!referrer)
            throw new Error('Referrer is Required To Pass With The Fee');

            let configUrl = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=${slippage}&fee=${(fee&&referrer)?fee:''}&referrer=${referrer?referrer:''}&protocals=${protocolsString}&compatibility=true`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };

            const response = await axios(configUrl);

            if (response.data) {
                const responseData: any = response.data;
                // console.log("responseData=>", responseData);
                return responseData;
            }
        } catch (error: any) {

            throw error
        }
    };

    public OneInchQuotesApi = async (chain_id: any, src: any, dst: any, amount: any, fee?: any) => {
        try {
            let configUrl1 = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/liquidity-sources`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };
            const resp = await axios(configUrl1);
            const protocols: any = resp.data.protocols;
            let filteredIds = protocols.filter((protocol: any) => {
                return !protocol.id.includes('ONE_INCH_LIMIT_ORDER')
            }).map((protocol: any) => {
                return protocol.id
            });
            let protocolsString: string = filteredIds.join(",");
            let url: any;
            if (fee) {
                url = `${this.on_chain_api_url}/swap/v5.2/${chain_id}/quote?includeTokensInfo=true&includeProtocols=true&includeGas=true&src=${src}&dst=${dst}&fee=${fee}&amount=${amount}&protocals=${protocolsString}`
            } else {
                url = `${this.on_chain_api_url}/swap/v5.2/${chain_id}/quote?includeTokensInfo=true&includeProtocols=true&includeGas=true&src=${src}&dst=${dst}&amount=${amount}&protocals=${protocolsString}`
            }
            let configUrl = {
                method: 'get',
                url,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };
            console.log("OneInchQuotesApi--->", configUrl);

            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {

            throw error
        }
    };

    public allowanceCheckOneInch = async (chain_id: any, tokenAddress: any, walletAddress: any) => {
        try {
            let configUrl = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };

            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {
            throw error
        }
    };

    public tokensApiOneInch = async (chain_id: any) => {
        try {
            let configUrl = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/tokens`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };

            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {
            throw error
        }
    };

    public tokenSearchOneInch = async (network: any, tokenAddress: any) => {
        try {
            let url = `${this.on_chain_api_url}/token/v1.2/search?query=${tokenAddress}&ignore_listed=false&limit=10`;
            if (network.length == 1) {
                url = `${this.on_chain_api_url}/token/v1.2/${coinFamily_chainId[network[0]]}/search?query=${tokenAddress}&ignore_listed=false&limit=10`;
            }

            let configUrl = {
                method: 'get',
                url: url,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };
            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {
            console.log("tokenSearchOneInch:", error.message);
            return false;
        }
    };

    public TokenApprovalApi = async (chain_id: any, tokenAddress: any, amount: any) => {
        try {
            let configUrl = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/approve/transaction?amount=${amount}&tokenAddress=${tokenAddress}`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };

            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {

            throw error
        }
    };

    public spenderInfoApi = async (chain_id: any) => {
        try {
            let configUrl = {
                method: 'get',
                url: `${this.on_chain_api_url}/swap/v5.2/${chain_id}/approve/spender`,
                headers: {
                    'Authorization': config.ON_CHAIN.ONEINCH_API_KEY,
                    'accept': 'application/json',
                }
            };

            const response = await axios(configUrl);
            if (response.data) {
                const responseData: any = response.data;
                return responseData;
            }
        } catch (error: any) {

            throw error
        }
    };
    public iterateNetworkOneInch = async (network: any, search: any) => {
        let datafecth = null
        let dataPush = []
        datafecth = await this.tokenSearchOneInch(network, search);

        if (!datafecth) {
            return false;
        }

        for await (const netdata of datafecth) {
            try {

                if (datafecth.length > 0) {
                    let tokenValidate = await ethWeb3.web3.utils.toChecksumAddress(netdata.address);
                    let datafix: any = {
                        coin_symbol: netdata.symbol,
                        coin_name: netdata.name,
                        token_address: tokenValidate,
                        coin_family: chainId_coinFamily[netdata.chainId],
                        decimals: netdata.decimals,
                        is_exist: 0,
                        is_favourite: 0,

                    }
                    dataPush.push(datafix);
                }
            } catch (error: any) {
                console.log("iterateNetworkOneInch", error.message);
            }
        }
        return dataPush
    }



}
export const OnChainHelper = new OnChainHelpers();
