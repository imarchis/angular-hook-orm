angular.module('myApp').factory('HookConfig', HookConfig);
function HookConfig(){
    function HookConfig(){
        var c = this;
        c.adapter = 'PouchDBAdapter';
        c.database = {
            name: 'myDB',
            adapter: 'websql',
            auto_compaction: true,
            revs_limit: 1
        };
        c.db_debug = 'pouchdb:find';
        c.entities = {
            key: '_id',
            table: 'myT',
            relations: 'myR',
            hooks: 'myH',
            deleted: '_deleted'
        };
        c.repo = {
            suffix: 'Repo'
        };
    }
    return HookConfig;
}