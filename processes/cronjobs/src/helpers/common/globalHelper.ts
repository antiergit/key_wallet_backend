import { redisClient, RabbitMq } from "./index";

class GlobalHelper {

    public async getCoinDetailsFromRedis(key: any, coinId: number) {
        try {
            let value: any = await redisClient.getRedisSting(key)
            const coins: any = value ? JSON.parse(value) : [];
            const coin = coins.find(
                (el: any) => Number(el.coin_id) == coinId
            );
            if (coin) return coin;
            return null;
        } catch (err: any) {
            console.error("Error in getCoinDetailsFromRedis: 🔥 ~ ~", err.message);
            return null;
        }
    }

    public async addingCoinsToQueue(queueName: string, data: any) {
        try {
            await RabbitMq.assertQueue(queueName)
            await RabbitMq.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in addingCoinsToQueue: 🔥 ~ ~", err.message);
            return false;
        }
    }

}
const globalHelper = new GlobalHelper();
export default globalHelper;