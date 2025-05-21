import AwsSecretManagerConfig from "./connections/awsSecrets.config";
import zookeeperConfig from "./connections/zookeeper.conn";

(async () => {
   // await zookeeperConfig.connectZookeeper();
   // await require("./config/index");
   // await require("./server.tron");
   await AwsSecretManagerConfig.connectAwsSecretManager();
   await require("./config/index");
   await require("./server.tron");
})();

