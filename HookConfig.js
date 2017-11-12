angular.module('myApp').factory('HookConfig', HookConfig);
function HookConfig(){
    function HookConfig(){
        var c = this;
        // What database adapter to use. Check in the adapters folder.
        c.adapter = 'PouchDBAdapter';
        // Database configuration.
        c.database = {
            name: 'myDB',
            adapter: 'websql',
            auto_compaction: true,
            revs_limit: 1
        };
        // Database debug options.
        c.db_debug = false;//'pouchdb:find';
        // Database connections options. Backup and sync.
        c.connections = {
            backupDB: {
                path:'path/to/backup/db',
                options: {
                    live: true,
                    retry: true
                }
            },
            syncDB: {
                path:'path/to/live/db',
                options: {
                    live: true,
                    retry: true
                }
            },
            backup_on_destroy: false
        };
        // Entities configuration
        c.entities = {
            // The primary key of your entities. '_id' is specific to PouchDB.
            key: '_id',
            // The name of a column that will hold the table name, the type distinction between your entities.
            table: 'table_column_name',
            // The name of a column that will hold the entities relations.
            relations: 'relations_column_name',
            // The name of a column that will hold the entities hooks (think of them as joins).
            hooks: 'hooks_column_name',
            // The name of a column that will be used to mark the entities as deleted.
            deleted: '_deleted'
        };
        // Entities repositories options
        c.repo = {
            suffix: 'Repo'
        };
    }
    return HookConfig;
}
