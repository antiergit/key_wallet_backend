import { Joi } from 'express-validation';

export default class validator {

  //Referral

  static encrypt = {
    body: Joi.object({
      plainText: Joi.string().optional(),
      secretKeyData: Joi.string().optional()
    })
  }

  static getCryptoData = {
    body: Joi.object({
      symbol: Joi.string().required(),
      alchemy_network: Joi.string().required(),
      fiat: Joi.string().required(),
    })
  }

  static crypto_list = {
    body: Joi.object({
      fiat: Joi.string().required(),
    })
  }

  static fiatList = {
    body: Joi.object({
      type: Joi.string().required(),
    })
  }

  static fiat_list = {
    body: Joi.object({
      type: Joi.string().required(),
    })
  }

  static order_quote = {
    body: Joi.object({
      crypto: Joi.string().required(),
      network: Joi.string().required(),
      fiat: Joi.string().required(),
      country: Joi.string().optional(),
      amount: Joi.string().required(),
      payWayCode: Joi.string().optional(),
      side: Joi.string().required(),


    })
  }









  static update_currency = {
    body: Joi.object({
      id: Joi.number().required(),
    })
  }


  static validate_push_notification_status = {
    query: Joi.object({
      status: Joi.number().required()
    })
  }

  static coin_list_validate = {
    body: Joi.object({
      limit: Joi.number().optional(),
      page: Joi.number().optional(),
      search: Joi.string().allow(null, '').optional(),
      fiat_type: Joi.string().required(),
      coin_family: Joi.array().required()
    })
  }

  static add_price_validate = {
    body: Joi.object({
      fiat_type: Joi.string().required(),
      wallet_address: Joi.string().required(),
      coin_symbol: Joi.string().required(),
      coin_name: Joi.string().required(),
      coin_family: Joi.number().required(),
      coin_image: Joi.string().required(),
      percentage: Joi.string().required(),
      token_address: Joi.string().allow(null, '').optional(),
      price_in_usd_per_unit: Joi.number().required(),
      alert_price: Joi.string().required(),
    })
  }

  static get_alerts_validate = {
    body: Joi.object({
      limit: Joi.number().optional(),
      page: Joi.number().optional(),
      wallet_address: Joi.string().required(),
      fiat_type: Joi.string().required(),
    })
  }
  static delete_price_alert = {
    body: Joi.object({
      id: Joi.number().required()
    })
  }
  static coin_deposit_validate = {
    body: Joi.object({
      tx_id: Joi.string().required(),
      to: Joi.string().required(),
    })
  }

  static save_withdraw_tax_validate = {
    body: Joi.object({
      tx_id: Joi.string().required(),
      from_address: Joi.string().required(),
    })
  }

  static get_nonce_validate = {
    body: Joi.object({
      wallet_address: Joi.string().required(),
    })
  }

  static gas_estimation_validate = {
    body: Joi.object({
      from: Joi.string().required(),
      to: Joi.string().required(),
      amount: Joi.number().optional()
    })
  }

  static overrideTrnx_validate = {
    body: Joi.object({
      withdraw_id: Joi.string().required(),
      tx_raw: Joi.string().required(),
      speedup: Joi.string().allow(null, '').optional(),
    })
  }

  static updateBroadcastTx_validate = {
    body: Joi.object({
      txid: Joi.string().required(),
      status: Joi.string().required(),
    })
  }

  static get_raw_data_string_validate = {
    body: Joi.object({
      my_address: Joi.string().required(),
      dest_address: Joi.string().required(),
      amount: Joi.string().required(),
    })
  }

  static coin_send_validate = {
    body: Joi.object({
      gas_estimate: Joi.string().required(),
      amount: Joi.string().required(),
      eth_gas_price: Joi.string().allow(null, '').optional(),
      gas_price: Joi.string().required(),
      tx_hash: Joi.string().allow(null, '').optional(),
      tx_status: Joi.string().allow(null, '').optional(),
      from: Joi.string().required(),
      tx_raw: Joi.string().required(),
    })
  }
  static add_NFTToken_validate = {
    body: Joi.object({
      tokenId: Joi.number().required(),
      walletAddress: Joi.string().required(),
      tokenAddress: Joi.string().required(),
      coinFamily: Joi.number().required(),
      name: Joi.string().required(),
      symbol: Joi.string().required(),
      image: Joi.string().required(),
      description: Joi.string().required(),
    })
  }

  static getNFTList_validate = {
    body: Joi.object({
      walletAddress: Joi.string().required(),
    })
  }

  static getGasEstimation_validate = {
    body: Joi.object({
      toAddress: Joi.string().required(),
      fromAddress: Joi.string().required(),
      tokenValue: Joi.string().required(),
      tokenAddress: Joi.string().required(),
    })
  }

  static addNFT_validate = {
    body: Joi.object({
      toAddress: Joi.string().required(),
      fromAddress: Joi.string().required(),
      tokenValue: Joi.string().required(),
      tokenAddress: Joi.string().required(),
    })
  }

  static btc_coin_send_validate = {
    body: Joi.object({
      gas_estimate: Joi.number().required(),
      amount: Joi.number().required(),
      from: Joi.string().required(),
      to: Joi.string().required(),
      tx_type: Joi.string().allow(null, '').optional(),
      nonce: Joi.number().optional(),
      eth_gas_price: Joi.number().optional(),
      tx_status: Joi.string().allow(null, '').optional(),
      tx_raw: Joi.string().allow(null, '').optional(),
    })
  }


  static coin_Graph_Data_validate = {
    body: Joi.object({
      wallet_address: Joi.string().allow(null, '').optional(),
      cmc_id: Joi.string().allow(null, '').optional(),
      filter: Joi.string().allow(null, '').optional(),
      fiat_type: Joi.string().allow(null, '').optional(),
    })
  }





  static transactionDetail_validate = {
    body: Joi.object({
      table_id: Joi.string().allow(null, '').optional(),
      fiat_currency: Joi.string().allow(null, '').optional(),
    })
  }
  static initiateTrnx_validate = {
    body: Joi.object({
      wallet_address: Joi.string().required(),
      tx_type: Joi.string().required(),
      coin_name: Joi.string().required(),
      amount: Joi.number().required(),
      price_in_usd: Joi.number().required(),
      fiat_type: Joi.string().required(),
      merchant_id: Joi.string().required(),
      gateway: Joi.string().required(),
    })
  }

  static getMrecuroTrnx_validate = {
    body: Joi.object({
      merchant_id: Joi.string().required(),
    })
  }

  static mercuroSupportedCoins_validate = {
    body: Joi.object({
      fiat_type: Joi.string().required(),
      addresses: Joi.string().required(),
    })
  }
  static getCoinsDetails_validate = {
    body: Joi.object({
      token_address: Joi.string().required(),
      currency: Joi.string().required(),
      coin_name: Joi.string().required(),
    })
  }

  static new_portfolio_validate = {
    body: Joi.object({
      page: Joi.number().required(),
      limit: Joi.number().required(),
      fiat_type: Joi.string().allow(null, '').optional(),
    })
  }
  static SupportTokens_validate = {
    body: Joi.object({
      chain: Joi.string().required(),
      addrsListKeys: Joi.array().required(),
    })
  }
  static CrossChainQuote_validate = {
    body: Joi.object({
      fromChain: Joi.string().required(),
      toChain: Joi.string().required(),
      fromToken: Joi.string().required(),
      amount: Joi.number().required(),
      toToken: Joi.string().required(),
    })
  }
  static TransferToMinterRaw_validate = {
    body: Joi.object({
      amount: Joi.number().required(),
      fromChain: Joi.string().required(),
      evmAddress: Joi.string().required(),
      fromAddress: Joi.string().required(),
      token: Joi.string().required(),
    })
  }
  // static submitCrossChain_validate = {
  //   body: Joi.object({
  //     certHash: Joi.string().required(),
  //     fromChain: Joi.string().required(),
  //     evmAddress: Joi.string().required(),
  //     fromAddress: Joi.string().required(),
  //     token: Joi.string().required(),
  //     amount: Joi.number().required(),
  //     toChain: Joi.string().required(),
  //     toToken: Joi.string().required(),
  //   })
  // }
  static sendToken_validate = {
    body: Joi.object({
      certHash: Joi.string().required(),
      fromChain: Joi.string().required(),
      evmAddress: Joi.string().required(),
      fromAddress: Joi.string().required(),
      token: Joi.string().required(),
      amount: Joi.number().required(),
      toChain: Joi.string().required(),
      toToken: Joi.string().required(),
      fromToken: Joi.string().required(),
      feeLevel: Joi.string().required(),
      tx_raw: Joi.string().required(),
      coin_id: Joi.number().required(),
    })
  }




  static NativeCoinFiatPrice_validate = {
    body: Joi.object({
      fiat_currency: Joi.string().required(),
      coin_family: Joi.number().required(),
    })
  }


  static th_send_validate = {
    body: Joi.object({
      nonce: Joi.number().required(),
      gas_estimate: Joi.number().required(),
      to: Joi.string().required(),
      amount: Joi.string().required(),
      eth_gas_price: Joi.string().allow(null, '').optional(),
      gas_price: Joi.number().required(),
      tx_type: Joi.string().allow(null, '').optional(),
      from: Joi.string().required(),
      tx_raw: Joi.string().required(),
    })
  }


  // NEW Card Module
  static view_card_status = {
    body: Joi.object({
      coin_family: Joi.number().required(),
      fiat_type: Joi.string().optional()
    })
  }




  static upload_kyc_details = {
    body: Joi.object({
      email: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      phone_number: Joi.string().required(),
      mobile_code: Joi.string().required(),
      address: Joi.string().required(),
      birthday: Joi.string().required(),
      city: Joi.string().required(),
      unique_id: Joi.string().required(),
      doc_no: Joi.string().required(),
      emergency_contact: Joi.string().required(),
      gender: Joi.number().required(),
      state: Joi.string().required(),
      zip_code: Joi.string().required(),
      doc_expire_date: Joi.string().required(),
      cardId: Joi.number().required(),
      docs_type: Joi.string().required()
    })
  }
  // static lmnnal_create_Wallet = {
  //   body: Joi.object({
  //     coin: Joi.string().required()
  //   })
  // }
  // static card_address_validation = {
  //   body: Joi.object({
  //     address: Joi.string().required(),
  //     limit: Joi.number().optional(),
  //     page: Joi.number().optional()
  //   })
  // }
  static shipping_data = {
    body: Joi.object({
      currency: Joi.string().required(),
      card_type: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      gender: Joi.number().required(), // 1 Male 2 Female
      country: Joi.string().required(),
      province: Joi.string().required(),
      city: Joi.string().required(),
      street_address: Joi.string().required(),
      post_code: Joi.string().required(),
      unique_id: Joi.string().required(),
      country_code: Joi.string().required(),
      phone_number: Joi.string().required(),
      email: Joi.string().required(),
      card_id: Joi.number().required()
    })
  }

  static bindingValidation = {
    body: Joi.object({
      card_no: Joi.string().required(),
      envelope_no: Joi.string().required(),
      name: Joi.string().required(),
      card_id: Joi.number().required()
    })
  }
  static kyc_details = {
    body: Joi.object({
      card_type: Joi.string().required(),
      card_id: Joi.number().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      dob: Joi.string().required(),
      nation: Joi.number().required(),
      docs_type: Joi.string().required(),
      docs_number: Joi.string().required(),
      emergency_no: Joi.string().required(),
      emergency_contact: Joi.string().required(),
    }),
  }
  // static physical_cardFeeData = {
  //   body: Joi.object({
  //     card_type: Joi.string().required()
  //   })
  // }

  static on_of_ramp_fiat_list = {
    body: Joi.object({
      search: Joi.string().allow(null, '').optional()
    })
  }
  static fetch_price = {
    body: Joi.object({
      transak_url: Joi.string().optional(),
      crypto: Joi.string().optional(),
      network: Joi.string().optional(),
      fiat: Joi.string().optional(),
      country: Joi.string().optional(),
      amount: Joi.number().optional(),
      payWayCode: Joi.string().allow('').optional(),
      side: Joi.string().optional(),
    })
  }
}