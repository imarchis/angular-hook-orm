angular-hook-orm
=====================
An Angular ORM wrapper that allows you to use Angular factories as entities,
and provides a way to dynamically define "hooks" between them.


## Table of contents:
- [Get Started](#get-started)
- [Configuration](#configuration)
  - [Configuration Template](#configuration-template)
- [Documentation](#documentation)
  - [Adapters](#adapters)
  - [Entity Manager](#entity-manager)
  - [Hooks](#hooks)
  - [Entities and Repositories](#entities-and-repositories)
  - [Query Builder](#query-builder)
- [Usage](#usage)
  - [Example](#usage-example)
- [Todo](#todo)


## Get Started:

Download this project.

Add an 'angular-hook-orm' folder into your lib or third-party folder.

Copy the 'angular-hook-orm.js' file into 'lib/angular-hook-orm' folder.

Include angular-hook-orm as a dependecy in your angular app

```javascript
// js/app.js
var myApp = angular.module('myApp', ['angular-hook-orm']);
```

Create an 'adapters' folder in the 'lib/angular-hook-orm' folder.

Select and copy the adapter you'd like to use in 'lib/angular-hook-orm/adapters' folder.

For instance, 'PouchDBAdapter.js'.

Download and include any adapter dependencies (PouchDBAdapter requires 'pouchdb' and 'pouchdb-find' version 6.20 +).

Create a 'HookConfig' factory as seen in the Configuration Template file ('HookConfigTemplate.js'), name it 'HookConfig.js' and place it anywhere in your project, for instance in your 'js/factories' folder and add your configuration details, similar to this:

```javascript
// js/factories/HookConfig.js
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

```
When you're done, your index file should look similar to this:

```html
<!doctype html>
<html ng-app="myApp">
<head>

</head>
<body>
    ...
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>
    <script src="js/app.js"></script>
    <script src="js/factories/HookConfig.js"></script>
    <script src="lib/js/pouchdb/pouchdb-6.2.0.min.js"></script>
    <script src="lib/js/pouchdb/pouchdb.find.js"></script>
    <script src="lib/js/angular-hook-orm/angular-hook-orm.js"></script>
    <script src="lib/js/angular-hook-orm/adapters/PouchDBAdapter.js"></script>
    ...
</body>
</html>
```

## Configuration:

angular-hook-orm seeks for a configuration factory called 'HookConfig' to get particular details need for the overall functionality, things like database adapters, special entities attributes, database connections, entities repository details, debugging level settings.

An example of required details is written into the Configuration Template file.

  ### Configuration Template 
The Configuration Template file ('HookConfigTemplate.js') is where you define your configuration details, like this:

```javascript
// HookConfigTemplate.js
angular.module('angular-hook-orm').factory('HookConfigTemplate', HookConfigTemplate);
function HookConfigTemplate(){
    function HookConfigTemplate(){
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
    return HookConfigTemplate;
}
```

## Documentation:

A basic web application generally has the following layers:

- Storage Layer

    Storage - DB

- Data Access Layer

    Storage Wrapper

    Transactions Adapter 

- Data Mapper Layer

    Persistence Manager 

- Domain Objects Layer

    Data Helpers - Repositories

    Data Models - Entities

- Service Layer

    Services 

    Controllers 

- Presentation Layer

    Views - Directives, Templates

    UI/UX - Pages, CSS

angular-hook-orm is designed to offer solutions for interactions that reside between the Service layer and the Storage layer: 
 - it offers exchangeable solutions for the Data Access Layer, in the form of "Adapters";
 - it has a built in "Entity Manager" which is a solution for the Data Mapper Layer;
 - it provides a means to easily define connections between the entities in the form of "Hooks";
 - it offers guidance for designing the Entities and Repositories of your application;
 - it has (will have) a built in "Query Builder" to offer easier ways interract with the data of your application.  

 ### Adapters
 
 ### Entity Manager

 ### Hooks

 Hooks are similar to DB joins, only they are not table-based restricted,
 but custom to each individual entity.

 Hooks are designed to offer a higher level of freedom for creating interactions between entities.

 ### Entities and Repositories
 
 ### Query Builder


## Usage:


## Todo:
- documentation
- errors
- logger
- tests
- hook query builder

- standard query builder?
- qb with aliases ?
- auto-increment ids?
- annotations?

- different & exchangeable data layers:
  - PouchDB - done ( + support attachments),
  - MongoDB,
  - REST
- Doc to Rel exports & imports (for RDBMS)



