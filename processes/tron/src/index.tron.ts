import zookeeperConfig from "./connections/zookeeper.conn";

(async () => {
   await zookeeperConfig.connectZookeeper();
   await require("./config/index");
   await require("./server.tron");
})();

