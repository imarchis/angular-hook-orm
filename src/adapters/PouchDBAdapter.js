// Requires pouchdb and pouchdb-find plugin 6.2.0
angular.module('angular-hook-orm')
    .factory('PouchDBWrapper', ['JH', PouchDBWrapper])
    .factory('PouchDBAdapter', ['JH', PouchDBAdapter]);

function PouchDBWrapper(JH) {
    function PouchDBWrapper() {
        var DB = this;
        var _db;
        var _c;
        var _d;
        var _e;
        var _cfg;
        var ndxs = [];

        (function () {
            _cfg = JH.acquire('HookConfig', true);
            _c = _cfg.connections;
            _e = _cfg.entities;
            _d = _cfg.database;
        })();
        var _checkIndexes = function _checkIndexes () {
            DB.indexes().then(function(r){
                r.indexes.map(function(i){
                    ndxs.push(i.name);
                });
                if (ndxs.indexOf('JTs') == -1) {
                    _index( [_e.table], 'JTs');
                }
            });
        };
        DB.debugging = function debugging() {
            let debug = _cfg.db_debug;
            if (debug) {
                PouchDB.debug.enable(debug);
            } else {
                PouchDB.debug.disable();
            }
        };
        DB.connect = function connect() {
            if (!_d) return;
            _db = new PouchDB(_d);
            if (_db) {
                if (ndxs.length == 0) {
                    _checkIndexes();
                }
            }
        };
        DB.getDB = function getDB () {
            if (!_db) return false;
            return _db;
        };
        DB.indexes = function () {
            if (!_db) return false;
            return _db.getIndexes();
        };
        DB.createIndex = function (i) {
            if (!_db) return false;
            return _db.createIndex({index:i});
        };
        var _index = function _index(f, n, d = null, t = 'json') {
            if (JH.empty(f)) return false;
            let i = {fields: f};
            if (n) if (!d) {d = n;} i.name = n; i.ddoc = d;
            if (t) i.type = t;
            return DB.createIndex(i);
        };
        DB.status = function () {
            if (!_db) return false;
            return _db.info();
        };
        DB.backup = function () {
            if (!_db || !_c) return false;
            let bDB = _c.backupDB;
            if (!bDB) return false;
            return _db.replicate.to(bDB.path, bDB.options);
        };
        DB.restore = function () {
            if (!_db || !_c) return false;
            let bDB = _c.backupDB;
            if (!bDB) return false;
            return _db.replicate.from(bDB.path, bDB.options);
        };
        DB.sync = function () {
            if (!_db || !_c) return false;
            let sDB = _c.backupDB;
            if (!sDB) return false;
            return _db.sync(sDB.path, sDB.options);
        };
        DB.drop = function () {
            if (!_db || !_c) return false;
            if (_c.backup_on_destroy) {
                return DB.backup().then(function() {
                    return _db.destroy();
                });
            } else {
                return  _db.destroy();
            }
        };
        DB.empty = function () {
            if (!_db) return false;
            let s = {};
            s[_e.table] = {$gt: null};
            return _db.find({selector: s}).then(function(r){
                let docs = r.docs;
                docs.map(function(doc){
                    doc._deleted = true;
                });
                return _db.bulkDocs(docs);
            });
        };
        DB.close = function () {
            if (!_db) return false;
            return _db.close();
        };
    }
    return  PouchDBWrapper;
}

function PouchDBAdapter(JH) {
    function PouchDBAdapter() {
        var pa = this;
        var DBW;
        var _db;
        var _c;
        var _e;

        (function() {
            DBW = JH.acquire('PouchDBWrapper');
            DBW.connect();
            _db = DBW.getDB();
            _c = JH.acquire('HookConfig', true);
            _e = _c.entities;
            console.log('started PouchDB Adapter');
        })();
        pa.getWrapper = function getWrapper() {
            return DBW;
        };
        pa.selectAll = function (table) {
            let s = {};
            s[_e.table] = {$eq: table};
            return _db.find({
                selector:s
            }).then(function(r) {
                return JH.promise(r.docs);
            });
        };
        pa.findOne = function(i){
            return _db.get(i);
        };
        pa.findThese = function(ids) {
            let s = {};
            s[_e.key] = {$gt: null,$in: ids};
            return _db.find({selector: s}).then(function(r) {
                return JH.promise(r.docs);
            });
        };
        pa.save = function (e) {
            return _db.post(e);
        };
        pa.update = function (e) {
            return _db.put(e);
        };
        pa.remove = function (e) {
            return _db.remove(e);
        };
        pa.bulk = function (b) {
            return _db.bulkDocs(b);
        };
    }
    return PouchDBAdapter;
}