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

        DB.getDB = function () {
            return _db;
        };
        DB.indexes = function () {
            return _db.getIndexes();
        };
        DB.index = function (f, n, d = null, t = 'json') {
            if (JH.empty(f)) return false;
            let i = {fields: f};
            if (n) if (!d) {d = n;} i.name = n; i.ddoc = d;
            if (t) i.type = t;
            return _db.createIndex({index:i});
        };
        DB.status = function () {
            return _db.info();
        };
        (function () {
            let config = JH.acquire('HookConfig');
            _c = config.connections;
            _e = config.entities;
            _d = config.database;
            let debug = config.db_debug;
            if (debug) {
                PouchDB.debug.enable(debug);
            } else {
                PouchDB.debug.disable();
            }
            _db = new PouchDB(_d);
            if (_db) {
                var existing = [];
                DB.indexes().then(function(r){
                    r.indexes.map(function(i){
                        existing.push(i.name);
                    });
                    if (existing.indexOf('JTPs') == -1) {
                        DB.index( [_e.table, _e.parents], 'JTPs');
                    }
                    if (existing.indexOf('JTs') == -1) {
                        DB.index( [_e.table], 'JTs');
                    }
                    if (existing.indexOf('JPs') == -1) {
                        DB.index( [_e.parents], 'JPs');
                    }
                });
            }
        })();
        DB.backup = function () {
            let bDB = _c.backupDB;
            if (!_c || !bDB) return false;
            return _db.replicate.to(bDB.path, bDB.options);
        };
        DB.restore = function () {
            let bDB = _c.backupDB;
            if (!_c || !bDB) return false;
            return _db.replicate.from(bDB.path, bDB.options);
        };
        DB.sync = function () {
            let sDB = _c.backupDB;
            if (!_c || !sDB) return false;
            return _db.sync(sDB.path, sDB.options);
        };
        DB.drop = function () {
            if (_c.backup_on_destroy) {
                return DB.backup().then(function() {
                    return _db.destroy();
                });
            } else {
                return  _db.destroy();
            }
        };
        DB.empty = function () {
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
            return _db.close();
        };
    }
    return  PouchDBWrapper;
}

function PouchDBAdapter(JH) {
    function PouchDBAdapter() {
        var pa = this;
        var DBP;
        var _db;
        var _c;
        var _e;

        (function() {
            DBP = JH.acquire('PouchDBWrapper');
            _db = DBP.getDB();
            _c = JH.acquire('HookConfig');
            _e = _c.entities;
            console.log('started PouchDB Adapter');
        })();
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
        pa.children = function(id, table = null) {
            let s = {};
            s[_e.parents] = {$gt: [], $elemMatch: {$eq : id}};
            if (table != null) {
                s[_e.table] = table;
            }
            return _db.find({selector: s});
        };
        pa.join = function join (name) {
            var hkn = function hkn () {
                return name;
            };
            var mf = function map (doc, emit) {
                let join = hkn();
                let hooks = JSON.parse(doc[_e.hooks]);
                if (hooks[join] != undefined) {
                    let rel = doc[_e.relations];
                    let r = {};
                    r[_e.key] = rel[join];
                    emit(r);
                }
            };
            return _db.query(mf, {include_docs : true}).then(function(r) {
                let objects = [];
                let key= hkn();
                r.rows.map(function(a){
                    objects.push(a.doc);
                });
                let results = [];
                results[key] = JH.extractIfOne(objects);
                return JH.promise(results);
            });
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