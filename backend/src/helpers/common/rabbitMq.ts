import * as amqp from "amqplib/callback_api";
import { LogsConstants } from "../../constants/logs.constants";
import { config } from "../../config";
// import { ErrorMessages } from "../../constants";

class RabbitMq {
  public channel: amqp.Channel;

  constructor() {
    this.startServer();
  }

  public async startServer() {
    try {
      await this.connect();
    } catch (error: any) {
      console.error(error.message);
    }
  };
  public async connect() {
    amqp.connect(config.RABBIT_MQ_CONN || "", (err, conn) => {
      if (err) console.error(LogsConstants.RABBIT_MQ_CONNECTION_FAILED, err);
      console.log(LogsConstants.RABBIT_MQ_CONNECTED);
      conn.createChannel((err, ch) => {
        if (err) console.error(LogsConstants.RABBIT_MQ_CHANNEL_FAILED, err);
        this.channel = ch;

        console.log(LogsConstants.RABBIT_MQ_CHANNEL_CREATED);
      });
    });
  };
  public async addToQueue(queueName: string, msg: Buffer) {
    this.assertQueue(queueName);
    this.sendToQueue(queueName, msg);
  };
  public async assertQueue(queueName: string) {
    this.channel.assertQueue(queueName, { durable: false }, (err, res) => {
      if (err) console.error(`${LogsConstants.ASSERT_QUEUE_FAILED} ${queueName}`);
    });
  };
  public async sendToQueue(queueName: string, msg: Buffer) {
    this.channel.sendToQueue(queueName, msg);
  };
  public async consumeQueue(
    queueName: string,
    cb: (data: any) => Promise<void>
  ) {
    this.channel.prefetch(1);
    this.channel.consume(queueName, async (msg) => {
      if (!msg) return;
      const data: any = JSON.parse(msg.content.toString());
      await cb(data);
      this.channel.ack(msg);
    });
  };
}

export default new RabbitMq();
