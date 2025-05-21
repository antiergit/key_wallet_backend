import AwsSecretManagerConfig from './helpers/awsSecrets.config';
import ZooKeeper from './helpers/zookeeper.helper';


(async () => {
  // await ZooKeeper.connectZookeeper();
  // await require('./config/index');
  // await require('./server.eth');
  await AwsSecretManagerConfig.connectAwsSecretManager();
  await require('./config/index');
  await require('./server.eth');
})();