import AwsSecretManagerConfig from './connections/awsSecrets.config';
(async () => {
    // await ZooKeeper.connectZookeeper();
    // await require('./config/index');
    // await require('./index');
    await AwsSecretManagerConfig.connectAwsSecretManager();
    await require('./config/index');
    await require('./index');
})();