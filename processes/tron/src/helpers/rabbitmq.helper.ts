import * as amqp from "amqplib/callback_api";
import { LogsConstants } from "../constant/index";
import { config } from "../config/index";
class rabbitMq {
   public channel: amqp.Channel;

   constructor() {
      this.startServer();
   }

   public startServer = async () => {
      try {
         await this.connect();
      } catch (error: any) {
         console.error((error as Error).message);
      }
   };

   public connect = async () => {
      amqp.connect(config.RABBIT_MQ || "", (err, conn) => {
         if (err) console.error(LogsConstants.RABBIT_MQ_CONNECTION_FAILED, err);
         console.log(LogsConstants.RABBIT_MQ_CONNECTED);

         conn.createChannel((err, ch) => {
            if (err) console.error(LogsConstants.RABBIT_MQ_CHANNEL_FAILED, err);
            this.channel = ch;

            console.log(LogsConstants.RABBIT_MQ_CHANNEL_CREATED);
         });
      });
   }
   public async send_tx_to_queue(queueName: string, data: Buffer) {
      await this.only_assert_queue(queueName)
      if (queueName == config.PENDING_WITHDRAWAL_TX_PROCESS_TRON) {
         const expirationTimeWs: number = 10 * 60 * 1000; //  10 minutes in milliseconds
         this.channel.sendToQueue(queueName, data, { expiration: expirationTimeWs.toString() });
      } else {
         this.channel.sendToQueue(queueName, data)
      }
   }

   public async assertQueueDurableFalse(queueName: string) {
      this.channel.assertQueue(queueName, { durable: false }, (err, res) => {
         if (err) console.error(`${LogsConstants.ASSERT_QUEUE_FAILED} ${queueName}`);
      });
   };
   public sendToQueue = async (queueName: string, msg: Buffer) => {
      this.channel.sendToQueue(queueName, msg);
   };

   public async only_assert_queue(queueName: any) {
      this.channel.assertQueue(queueName, { durable: true }, (err: any, res: any) => {
         if (err) console.error(`assertQueue err`, err);
      });
   }
   public async only_consume_queue(queue: string, fun: any) {
      this.channel.consume(queue, async (msg: any) => {
         let data = JSON.parse(msg.content.toString());
         fun(data, msg);
         this.channel.ack(msg);
         return true;
      },
         { noAck: false });
   }
   public async queue_length(queueName: string) {
      try {
         let queue_length: any = await this.assertQueueToGetLength(queueName)
         console.log("queue_length>>>", queue_length)
         return queue_length;

      } catch (err: any) {
         console.error("Error in queue_length>>", err);
      }
   }
   public assertQueueToGetLength = async (queueName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
         this.channel.assertQueue(queueName, { durable: true }, (err, res) => {
            if (err) {
               console.error(`Error in ${LogsConstants.ASSERT_QUEUE_FAILED} ${queueName}`);
               reject(err);
            } else {
               resolve(res.messageCount);
            }
         });
      });
   }


   public consumeQueue = async (
      queueName: string,
      cb: (data: any) => Promise<void>
   ) => {
      await this.only_assert_queue(queueName);
      this.channel.prefetch(1);
      this.channel.consume(queueName, async (msg) => {
         if (!msg) return;
         const data: any = JSON.parse(msg.content.toString());
         await cb(data);
         this.channel.ack(msg);
      });
   }
}

export let RabbitMq = new rabbitMq();

