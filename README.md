angular-hook-orm
=====================
A client-side ORM system with a built-in Persistence Manager for Angular.
It allows you to use Angular factories as entities, and provides a way to dynamically define "hooks" between them.


## Table of contents:
- [Get Started](#get-started)
- [Configuration](#configuration)
  - [Configuration Template](#configuration-template)
- [Documentation](#documentation)
  - [Adapters](#adapters)
  - [Wrappers](#wrappers)
  - [Database Manager](#database-manager)
     - [.connect()](#connect)
     - [.status()](#status)
     - [.backup()](#backup)
     - [.restore()](#restore)
     - [.sync()](#sync)
     - [.drop()](#drop)
     - [.createIndex()](#createindex)
     - [.indexes()](#indexes)
     - [.close()](#close)
  - [Entity Manager](#entity-manager)
     - [.model()](#model)
     - [.persist()](#persist)
     - [.remove()](#remove)
     - [.clear()](#clear)
     - [.flush()](#flush)
     - [.getRepository()](#getrepository)
     - [.allInTable()](#allintable)
     - [.find()](#find)
     - [.findMany()](#findmany)
  - [Hooks](#hooks)
  - [Entities](#entities)
     - [.hook()](#hook)
     - [.unhook()](#unhook)
     - [.emptyHook()](#emptyhook)
     - [.assign()](#assign)
     - [.grab()](#grab)
     - [.countAssigned()](#countassigned)
  - [Repositories](#repositories)
  - [Query Builder](#query-builder)
- [Usage](#usage)
  - [Example](#example)
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

Download and include any adapter dependencies (PouchDBAdapter requires 'pouchdb' and 'pouchdb-find' version 6.2.0 +).

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

```javascript
  webapp.layers = {
    "Storage Layer" : "Storage - DB",
    "Data Access Layer" : ["Storage Wrapper", "Transactions Adapter"],
    "Data Mapper Layer" : "Persistence Manager",
    "Domain Objects Layer" : ["Data Helpers - Repositories", "Data Models - Entities"],
    "Service Layer" : ["Services", "Controllers"],
    "Presentation Layer" : ["Views", "Directives", "Templates", "Pages"]
  }
```
angular-hook-orm is designed to offer solutions for interactions that reside between the Service layer and the Storage layer: 
 - it offers exchangeable solutions for the Data Access Layer, in the form of "Adapters";
 - it has a built in "Entity Manager" which is a solution for the Data Mapper Layer;
 - it provides a means to easily define connections between the entities in the form of "Hooks";
 - it offers guidance for designing the Entities and Repositories of your application;
 - it has (will have) a built in "Query Builder" to offer easier ways interract with the data of your application.  

 ### Adapters
 
 Adapters are a set of factories that provide interraction between the Entity Manager and the Database Wrappers, wich communicates with your storage solution (Database).
 They have a serie of specific methods need for manipulating data like: save, update, remove, bulk, findOne, selectAll, findThese etc which hold the solution specific functionality needed for those methods.
 
 They are envisioned to be exchangeable, meaning switching between the adapters should not affect the overall normal functionality.
 
 Note: Currently there's only a  PouchDBAdapter implemented.
  
 ### Wrappers
 
 Wrappers are a set of factories that provide interraction between the Adapters and your storage solution (Database). Think of them as a database interface. They have a serie of specific methods need for interacting with your database like: connect, sync, restore, empty, status, drop etc which hold the solution specific functionality needed for those methods.

 They are envisioned to be exchangeable, meaning switching between the wrappers should not affect the overall normal functionality. They are however strictly (so far) connected to the adapaters
 
Note: Currently there's only a PouchDBWrapper implemented.


### Database Manager

  The Database Manager seeks for the selected Adaptare from the HookCongif factory, from it it gets the Database Wrappper associated, by calling the getWrapper() method of the Adapter.
  
   #### connect()
   Used for creating or re-establishing a database connection.
   
```javascript 
  dbm.connect()
```
   #### status()
   Used for getting information / statistics about the database.
   
```javascript 
  dbm.status()
```
   #### backup()
   Used for performing a backup of the databse.
   
```javascript 
  dbm.backup()
```
   #### restore()
   Used for restoring a previously backup of the databse.
   
```javascript 
  dbm.restore()
```
   #### sync()
   Used for triggering a sync process between the database and a server.

```javascript 
  dbm.sync()
```
   #### drop()
   Used for deleting the entire database. If the "backup_on_destroy" attribute of the datbase configuration details is set to true, it will perform a backup of the dabase before it deletes it.
   
```javascript 
  dbm.drop()
```
   #### empty()
   Used for truncating the database, empty the database without deleting it.
   
```javascript 
  dbm.empty()
```
   #### createIndex()
   Used for creating a database index, for improving the speed of a specific database query.
   
```javascript 
  dbm.createIndex(index)
```
   #### indexes()
   Used for retrieving a list of existing database indexes.
   
```javascript 
  dbm.indexes()
```
   #### close()
   Used for severing the database connection. 
   
```javascript 
  dbm.close()
```   

   
### Entity Manager
  The Entity Manager is the most important factory of the angular-hook-orm system. 
  It's offers solutions for:
   - fetching data from the database;
   - mapping the data fetched from the database to their designated entities;
   - saving or removing data into and from the database;
   - ensures the persistence of the entities;
   - manages subsequent changes to the entities so that no data is lost (it has a built-in queue system);
   - bundles the changes and bulk updates the database (sends all the changes at once) for improving performence;
   - ensures persistent management of both newly created entities and those fetched from the database;
   - reuses the persisted entities in the search results first and only fetches missing entities from the database.

  #### model()
  This method is used create entities out of objects. It assigns (if missing) an universally unique identifier (uuid), it assignes the predefined Entity methods (check the [Entities](#entities) section bellow), and also persists the newly created entity if specified (by default it doesn't).
  
```javascript 
  em.model(obj, false)
```
   #### persist()
   This method is used to persist an entity, for the system to keep track of their changes. By persisting an entity records of any of it's changes are kept and will be included (if changed or new) in the next bulk update when the em.flush() method is called.
   
```javascript 
  em.persist(entity)
```
   #### remove()
   This method is used for "marking" an entity as deleted, which will ensure it gets removed from the database on the next flush()
   
```javascript 
  em.remove(entity)
```
   #### clear()
   This method is used for removing all persistence data, including persisted entities from queries. 
   Note: all entities will have to be [re-persisted](#persist) after this point, for the system to keep track of their changes.
   
```javascript 
  em.clear()
```
   #### flush()
   This method prepares the bundle of recorded changes and saves them to the database via a bulk update.
   
```javascript 
  em.flush()
```
   #### getRepository() 
   This method return a new instance of the Repository for a specified entity (if any defined).
   
```javascript 
  em.getRepository('table')
```
   #### allInTable()
   This method returns all the information found in a specific database table (equivalent of "SELECT * FROM 'table'").
   
```javascript 
  em.allInTable('table')
```
   #### find()
   Given a uuid, it fetches that record (if found) from the (persistence pool or if not found from the) database .
   
```javascript 
  em.find(id)
```
   #### findMany(),
   Given an array of uuids, it fetches the records (if found) from the (persistence pool or if not found from the) database.
```javascript 
  em.findMany([id1, id2, ...])
```
   
   
 ### Hooks
 
 Hooks are similar to RDBMS relations, only they are not table-based restricted, but custom to each individual entity.

 The best way to think of the hooks is to envision them as "personal" relationships of your entites.
 
 Hooks are designed to offer a higher level of freedom for creating interactions between entities.
 
 As seen in the example, this is how you define and assign a hook:
```javascript
    ...
    list1.hook('bro', {
        type: 'o2o',
        strict: false,
        mirror: true,
        reverse: "dude"
    });
    list1.assign('bro', list2);
    em.flush();
    ...
```
To define a hook you need:
 - a hook name - anything that make sense to your app's logic ("bro" in the example above);
 - details about the hook functionality;

```javascript
  {
    // The type of relation o2o, o2m, m2o, m2m [one-to-one, one-to-many, many-to-one, many-to-many] 
    type: 'o2o',
    // just from one table?
    strict: false,
    // [optional] - required only when strict = true. 
    // These combined allows only one type of entity to be used for this hook.
    table: 'lists',
    // add double reference? keep relationship details in both entities?
    mirror: true,
    // the name of the reversed hook. What should the other entity "call" this one?
    reverse: "dude",
    
    // Cascade options. What should happen to the related entities? 
    // [optional] - when this entity is deleted?
    onDelete: 'destroy',
    // [optional] - when the hook is removed?
    onDrop: 'abandon',
    // [optional] - when a different entity is assigned to this hook?
    onChange: 'forget',
    // [optional] - when the hook is emptied?
    onEmpty: 'kill',    
  };
  
  // if no cascades are defined the defaults will be used:
  //  if the entity has "ownership" of the hook (o2o, o2m)
      {
          onDelete: 'abandon',
          onDrop: 'forget',
          onChange: 'abandon',
          onEmpty: 'abandon'
      };
  //  else 
      action = 'vanish'
```
The Cascades values:
- 'destroy' - remove both this entity and all related entities.
- 'kill' - remove the related entities.
- 'abandon' - remove this entity's hook, remove the reference to this entity from the related entities but keep their hook.
- 'forget' - remove all references and hooks 
- 'vanish' - remove the entity's reference


 ### Entities 
   Entites are objects of your system that have an established identity, meaning they are instances of your objects that also have/will have a record of their data stored in the database.
   
   #### hook()
   This method is used to define a "hook" for the entity. (see the [Hooks](#hooks) section above for more details).
   
```javascript 
  entity.hook('hook_name', details_obj)
```
   #### unhook()
   This method is used to remove a pre-defined hook.
   
```javascript 
  entity.unhook('hook_name')
```
   #### emptyHook()
   This method is used for resetting the previously defined associations of this hook.
   
```javascript 
  entity.emptyHook('hook_name')
```
   #### assign()
   This method is used to assign an entity to this pre-defined hook.
   
```javascript 
  entity.assign('hook_name', entity2)
```
   #### grab()
   This method is used for fetching the entities previously assigned to this hook.
   
```javascript 
  entity.grab('hook_name')
```
   #### countAssigned() 
   This method is returns the number of entities currently associated to this hook.
   
```javascript 
  entity.countAssigned('hook_name')
```

 
 ### Repositories
 Repositories are factories that are designed to hold custom methods for fetching entities of a specific table.
 Think of them as the place to save all your entity specific logic, like specific queries or operations.
 
 
 
 ### Query Builder


## Usage:

### Example

index.html:

```html
<!doctype html>
<html ng-app="myApp">
    <head>
        <title>My App Demo</title>
    </head>
    <body data-ng-controller="MainCtrl">
        <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>
        <script src="js/app.js"></script>
        <script src="js/factories/HookConfig.js"></script>
        <script src="js/factories/entities.js"></script>
        <script src="lib/pouchdb/pouchdb-6.2.0.min.js"></script>
        <script src="lib/pouchdb/pouchdb.find.js"></script>
        <script src="lib/angular-hook-orm/angular-hook-orm.js"></script>
        <script src="lib/angular-hook-orm/adapters/PouchDBAdapter.js"></script>
    </body>
</html>
```
js/factories/HookConfig.js the same as above.

js/factories/entities.js

```javascript
angular.module('myApp')
    .factory('List', ['EntitiesManager',  List])
    .factory('ListRepo', ['EntitiesManager', ListRepo]);

function ListRepo(em){
    function ListRepo(){
        var lr = this;
        lr.findAll = function() {
            return em.allInTable('list');
        };
        lr.find = function(id) {
            return em.find(id).then(function(r){
                return r;
            })
        }
    }
    return ListRepo;
}

function List(em) {
    function List(){
        var l = this;
        this.myT = 'list';
        this.name = null;
        this.created =  new Date();
        this.modified = 0;

        (function() {
            l = em.model(l);
            console.log('new List');
        })();

        this.setName = function (n) {
            this.name = n;
            this.setModified();
        };

        this.getName = function () {
           return this.name;
        };

        this.setModified = function () {
            this.modified = new Date();
        };

        this.getModified = function () {
           return this.modified;
        };

    }
    return List;
}
```

js/app.js

```javascript
var myApp = angular.module('myApp', ['angular-hook-orm']);
myApp.controller('MainCtrl', [ '$scope', 'EntitiesManager', 'List', function($scope, em, List) {
    let repo = em.getRepository('list');
    repo.findAll().then(function(r){
        console.log(r);
        if (r.length == 0) {
            var list1 = new List;
            var list2 = new List;
            list1.setName('First List');
            list2.setName('Second List');
            em.persist(list1);
            em.persist(list2);
            list1.hook('bro', {
                type: 'o2o',
                strict: false,
                mirror: true,
                reverse: "dude"
            });
            list1.assign('bro', list2);
            em.flush();
        } else {
            list1 = r[0];
            list2 = r[1];
        }

        list1.grab('bro').then(function(b){
            console.log('The bro is: '+ b.getName());
            console.log(b);
            list2.grab('dude').then(function(d){
                console.log('The dude is: '+ d.getName());
                console.log(d);
            });
        });
    });
}]);
```

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



