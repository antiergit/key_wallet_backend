import AwsSecretManagerConfig from './helpers/awsSecrets.config';
// import Zookeeper from './helpers/zookeeper.helper';
(async () => {
  // await Zookeeper.connectZookeeper();
  // await require('./config/index');
  // await require('./server.btc');
  await AwsSecretManagerConfig.connectAwsSecretManager();
  await require('./config/index');
  await require('./server.btc');
})();