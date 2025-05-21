import AwsSecretManagerConfig from './helpers/common/awsSecrets.config';
import ZooKeeper from './helpers/common/zookeeper.helper';


(async () => {
    // await ZooKeeper.connectZookeeper();
    // await require('./config/index');
    // await require('./server.cron');
    await AwsSecretManagerConfig.connectAwsSecretManager();
    await require('./config/index');
    await require('./server.cron');
})();