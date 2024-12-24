import { Op } from "sequelize";
import { config } from "../../config";
import { coinGeckoHelper, redisClient } from "../../helpers/common/index";
import { coinPriceInFiatQueries, coinQueries, currencyQueries } from "../../helpers/dbHelper";

const {
    current_price_coin_counter: CURRENT_PRICE_COIN_COUNTER,
    current_price_currency_counter: CURRENT_PRICE_CURRENCY_COUNTER
} = config.REDISKEYS.COIN_LIMIT_COUNT_FIELD;
class CoinPriceInFiatController {
    public async fetchCoinGeckoPrice() {
        try {

            console.log("********* fetchCoinGeckoPrice *************");

            /** coins pagination */
            let coinLimitCount: number = 0;
            let limit: number = 10;
            let findCoinCounter: any = await redisClient.getKeyValuePair(
                config.REDISKEYS.COIN_LIMIT_COUNTS,
                `${CURRENT_PRICE_COIN_COUNTER}`
            );
            if (findCoinCounter) {
                coinLimitCount = Number(findCoinCounter);
            }

            /** currencies pagination */
            let currencyLimitCount: number = 0;
            let currencyLimit: number = 5;
            let findCurrencyCounter: any = await redisClient.getKeyValuePair(
                config.REDISKEYS.COIN_LIMIT_COUNTS,
                `${CURRENT_PRICE_CURRENCY_COUNTER}`
            );
            if (findCurrencyCounter) {
                currencyLimitCount = Number(findCurrencyCounter);
            }

            // find the currency now we want to go for
            let currencyData: any =
                await currencyQueries.findAndCountAll(
                    ["currency_code"],
                    { status: 1 },
                    [["currency_id", "ASC"]],
                    currencyLimit, currencyLimitCount
                )

            // setting variable for the coin data count
            let coinDataCount: number = 0;

            if (currencyData.count > 0) {
                const codes = currencyData.rows.map((el: any) => el.currency_code);

                const coinGeckoIds: string[] = [];

                let coinsToRead: any = await coinQueries.findAndCountAll(
                    ["coin_gicko_id"],
                    { coin_gicko_id: { [Op.ne]: null } },
                    [["coin_id", "ASC"]],
                    limit, coinLimitCount
                )

                coinDataCount = coinsToRead.count; // for setting offset in coin limit count

                if (coinsToRead.count > 0) {
                    for await (const iterator of coinsToRead.rows) {
                        coinGeckoIds.push(iterator?.coin_gicko_id as string);
                    }
                }

                console.log("coin_gecko_ids_price fetching", coinGeckoIds + "\n");
                console.log("fetching price of these currencies", codes + "\n");

                if (coinGeckoIds.length > 0) {
                    let convertArrayToTokenFormat = coinGeckoIds
                        .toString()
                        .replace(/[\[\]']+/g, "");
                    console.log("convertArrayToTokenFormat::", convertArrayToTokenFormat);

                    // loop starts
                    for await (let currency of codes) {
                        //quotes api calling

                        let coinGeckoMarketData: any = await coinGeckoHelper.coinGeckoQuotesLatestApi(
                            currency.toLowerCase(),
                            convertArrayToTokenFormat
                        );

                        if (coinGeckoMarketData.data.length) {
                            // data returned from the array
                            for await (let specific_coin_data of coinGeckoMarketData.data) {
                                // check if the specfic data is present in the coin price table on basis of coin id and fiat or fiat type and coingecko id

                                let coinData: any = await coinQueries.findOne(
                                    ["coin_id", "coin_symbol", "coin_name", "coin_family", "token_address"],
                                    { coin_gicko_id: specific_coin_data.id }
                                )

                                if (coinData) {
                                    let checkIfCoinExistInCoinPriceTable: any = await coinPriceInFiatQueries.findOne(
                                        ["id", "coin_id"],
                                        {
                                            fiat_type: currency,
                                            [Op.or]: [
                                                { coin_id: coinData?.coin_id },
                                                { coin_gicko_id: specific_coin_data.id },
                                            ],
                                        }
                                    )

                                    // if coinExists
                                    let latest_price: any = {
                                        price: specific_coin_data.current_price,
                                        timestamp: specific_coin_data.last_updated,
                                        volume_24h: specific_coin_data.total_volume,
                                        price_change_24h:
                                            specific_coin_data.price_change_percentage_24h || 0,
                                    };
                                    if (checkIfCoinExistInCoinPriceTable) {
                                        let coin_id = coinData.coin_id;

                                        const updateData = {
                                            coin_gicko_id: specific_coin_data.id,
                                            coin_id: coin_id,
                                            value: specific_coin_data.current_price,
                                            price_change_24h:
                                                specific_coin_data.price_change_24h || 0,
                                            price_change_percentage_24h:
                                                specific_coin_data.price_change_percentage_24h || 0,
                                            volume_24h: specific_coin_data.total_volume,
                                            total_supply: specific_coin_data.total_supply,
                                            latest_price: latest_price,
                                            latest_price_source: "current",
                                        };
                                        await coinPriceInFiatQueries.update(
                                            {
                                                coin_gicko_id: specific_coin_data.id,
                                                coin_id: coin_id,
                                                value: specific_coin_data.current_price,
                                                price_change_24h:
                                                    specific_coin_data.price_change_24h || 0,
                                                price_change_percentage_24h:
                                                    specific_coin_data.price_change_percentage_24h || 0,
                                                volume_24h: specific_coin_data.total_volume,
                                                total_supply: specific_coin_data.total_supply,
                                                latest_price: latest_price,
                                                latest_price_source: "current",
                                            },
                                            { id: checkIfCoinExistInCoinPriceTable.id }
                                        )
                                    }
                                    // new entry in the coin table
                                    else {
                                        let dataToInsert: any = {
                                            coin_id: coinData.coin_id,
                                            coin_symbol: coinData.coin_symbol,
                                            coin_name: coinData.coin_name,
                                            coin_family: coinData.coin_family,
                                            // cmc_id: 0,
                                            coin_gicko_id: specific_coin_data.id,
                                            fiat_type: currency.toLowerCase(),
                                            value: specific_coin_data.current_price,
                                            price_change_24h:
                                                specific_coin_data.price_change_24h || 0,
                                            price_change_percentage_24h:
                                                specific_coin_data.price_change_percentage_24h || 0,
                                            market_cap: specific_coin_data.market_cap,
                                            circulating: specific_coin_data.circulating_supply,
                                            total_supply: specific_coin_data.total_supply,
                                            rank: specific_coin_data.market_cap_rank,
                                            volume_24h: specific_coin_data.total_volume,
                                            token_address: coinData.token_address,
                                            max_supply: specific_coin_data.max_supply,
                                            latest_price: latest_price,
                                            roi: null,
                                            open: null,
                                            high: null,
                                            average: null,
                                            close: null,
                                            low: null,
                                            change_price: null,
                                        };

                                        console.log("entry in new table ===>", dataToInsert);
                                        await coinPriceInFiatQueries.create(dataToInsert)
                                    }
                                } else {
                                    console.log(
                                        `no coin is present with this coin_gicko_id${specific_coin_data.id} in coin table`
                                    );
                                }
                            }
                        } else {
                            console.log(`no data is given from the api of coin market`);
                        }
                    }
                    // loop ends
                }
            }
            // for checking next coins and all operations

            currencyLimitCount = currencyLimitCount + currencyLimit;
            let currencyCounter =
                currencyLimitCount >= currencyData.count ? 0 : currencyLimitCount;
            console.log(
                "currency_counter >>>",
                currencyCounter
            );

            if (currencyCounter == 0) {
                /** update coins pagination */
                coinLimitCount = coinLimitCount + limit;
                let counter =
                    coinLimitCount >= coinDataCount ? 0 : coinLimitCount;
                console.log("coin counter >>>", counter);

                await redisClient.setKeyValuePair(
                    config.REDISKEYS.COIN_LIMIT_COUNTS,
                    `${CURRENT_PRICE_COIN_COUNTER}`,
                    counter.toString()
                );
            }
            /** update currencies pagination */
            await redisClient.setKeyValuePair(
                config.REDISKEYS.COIN_LIMIT_COUNTS,
                `${CURRENT_PRICE_CURRENCY_COUNTER}`,
                currencyCounter.toString()
            );
        } catch (err: any) {
            console.error("Error in fetchCoinGeckoPrice 🔥 ~ ~", err.message)
        }
    };

}
const coinPriceInFiatController = new CoinPriceInFiatController();
export default coinPriceInFiatController;