import ZooKeeper from './connections/zookeeper.conn';
(async () => {
    await ZooKeeper.connectZookeeper();
    await require('./config/index');
    await require('./index');
})();