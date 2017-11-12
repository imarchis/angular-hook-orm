angular.module('angular-hook-orm', [])
.factory('JH', ['$injector', '$q', JH])
.factory('EntitiesManager', ['JH', EntitiesManager]);

function JH($injector, $q){
    function JH() {
        var h = this;
        h.v = [];
        h.acquire = function acquire(factoryName) {
            let obj;
            let ff;
            try {
                ff  = $injector.get(factoryName);
            } catch (e) {
                throw new Error('No "' + factoryName + '" class available. Cause: ' + "\n\n" + e);
            }
            try {
                obj = $injector.instantiate(ff);
            } catch (e) {
                throw new Error('Could not instantiate "'+ factoryName + '" class. ' + "\n\n" + e);
            }
            return obj;
        };
        h.vct = function vct() {
            if (h.v.length == 0) {
                for (var i = 0; i < 256; i++) {
                    h.v[i] = (i < 16 ? '0' : '') + (i).toString(16);
                }
            }
            return h.v;
        }();
        h.uuid = function uuid() {
            var d0 = Math.random()*0x100000000>>>0;
            var d1 = Math.random()*0x100000000>>>0;
            var d2 = Math.random()*0x100000000>>>0;
            var d3 = Math.random()*0x100000000>>>0;
            return h.vct[d0&0xff] + h.vct[d0>>8&0xff] + h.vct[d0>>16&0xff] + h.vct[d0>>24&0xff] + '-'+
                h.vct[d1&0xff] + h.vct[d1>>8&0xff] + '-' +
                h.vct[d1>>16&0x0f|0x40] + h.vct[d1>>24&0xff] + '-'+
                h.vct[d2&0x3f|0x80] + h.vct[d2>>8&0xff] + '-' +
                h.vct[d2>>16&0xff] + h.vct[d2>>24&0xff] +
                h.vct[d3&0xff] + h.vct[d3>>8&0xff] + h.vct[d3>>16&0xff] +h.vct[d3>>24&0xff];
        };
        h.empty = function empty(obj) {
            let k = Object.keys(obj).length;
            let s = JSON.stringify(obj);
            let ea = JSON.stringify([]);
            let eo = JSON.stringify({});
            return k === 0 || s === ea || s === eo;
        };
        String.prototype.sentenceCase = function sentenceCase() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };
        h.promise = function promise(data) {
            let defer = $q.defer();
            defer.resolve(data);
            return defer.promise;
        };
        h.defer = function defer() {
           return $q.defer();
        };
        h.containsObj = function containsObj(arr, obj) {
            let s = JSON.stringify(obj);
            return (arr.filter(function(pe)  { return s === JSON.stringify(pe)}).length > 0);
        };
        h.hasProp = function hasProp(obj, prop) {
            return obj[prop] !== undefined;
        };
        h.extractIfOne = function extractIfOne(arr) {
            return arr.length === 1 ? arr[0] : arr;
        };
    }
    return new JH;
}

function EntitiesManager(JH) {
    function EntitiesManager() {
        var em = this;
        var DBA;
        var _s = {};
        var _p = {};
        var _pc = {};
        var _c;
        var _e;
        var _q = [];
        (function () {
            _c = JH.acquire('HookConfig');
            DBA = JH.acquire(_c.adapter);
            _e = _c.entities;
            console.log('started Entity Manager');
        })();
        let _clone = function _clone(e) {
            _pc[e._id] = JSON.stringify(e);
        };
        em.uuid = function uuid() {
            return JH.uuid();
        };
        em.allInTable = function allInTable(table) {
            let queID = JH.uuid();
            addQue(queID);
            return que(queID).then(function () {
                return DBA.selectAll(table).then(function (r) {
                    let picks = [];
                    r.map(function (ent) {
                       if(JH.hasProp(_p, ent[_e.key])) {
                           picks.push(_p[ent[_e.key]]);
                       } else {
                           picks.push(_p[ent[_e.key]]);
                       }
                    });
                    clearQue(queID);
                    return em.convert(r);
                });
            });
        };
        em.find = function find(i) {
            let queID = JH.uuid();
            addQue(queID);
            return que(queID).then(function () {
                return DBA.findOne(i).then(function (r) {
                    clearQue(queID);
                    return em.convert(r);
                });
            });
        };
        em.clear = function clear() {
            _p = {};
            _pc = {};
            _s = {};
        };
        em.convert = function convert(docs) {
            if (docs === undefined) return null;
            let bulk = [];
            docs.map(function (l) {
                if(JH.hasProp(_p, l[_e.key])) {
                    bulk.push(_p[l[_e.key]]);
                } else {
                    let ent = em.entity(l, true);
                    if (ent != null) {
                        bulk.push(ent);
                    }
                }
            });
            return JH.promise(bulk);
        };
        em.findMany = function findMany(ids) {
            let links = angular.copy(ids);
            links = links.constructor === Array ? links : [links];
            let po = _findPersisted(links);
            if (links.length > 0) {
                return DBA.findThese(links).then(function (r) {
                    return em.convert(r).then(function (x) {
                        x.map(function (d) {
                            po.push(d);
                        });
                        return JH.promise(JH.extractIfOne(po));
                    });
                });
            }
            return JH.promise(JH.extractIfOne(po));
        };
        var _revive = function _revive(e) {
            if (!JH.hasProp(e, _e.key)) {
                e[_e.key] = JH.uuid();
            }
            e.grab = _grab;
            e.hook = _hook;
            e.unhook = _unhook;
            e.emptyHook = _emptyHook;
            e.assign = _assign;
            e.countAssigned = _countAssigned;
            return e;
        };
        var _prepare = function _prepare(e) {
            let rel = _e.relations;
            let hooks = _e.hooks;
            if (JH.hasProp(e, rel)) {
                e[rel] = JSON.stringify(e[rel]);
            }
            if (JH.hasProp(e, hooks)) {
                e[hooks] = JSON.stringify(e[hooks]);
            }
            return e;
        };
        em.entity = function entity(obj, persist = false) {
            let keys = Object.keys(obj);
            if (keys.length === 0 || !JH.hasProp(obj, _e.table)) {
                return null;
            } else {
                let t = obj[_e.table];
                let entity = JH.acquire(t.sentenceCase());
                keys.map(function (attr) {
                    if ([_e.relations, _e.hooks].indexOf(attr) !== -1) {
                        entity[attr] = JSON.parse(obj[attr]);
                    } else {
                        entity[attr] = obj[attr];
                    }
                });
                entity = _revive(entity);
                if (persist) {
                    _clone(entity);
                    em.persist(entity);
                }
                return entity;
            }
        };
        var _findPersisted = function _findPersisted(ids) {
            let picks = [];
            ids.map(function (id) {
                let x = ids.indexOf(id);
                if (JH.hasProp(_p, id)) {
                    picks.push(_p[id]);
                    ids.splice(x, 1);
                }
            });
            return picks;
        };
        var _hook_required = ['reverse', 'type','strict', 'mirror'];
        var _relations = ['o2o', 'o2m', 'm2o', 'm2m'];
        var _reverse = {
            'o2o': 'o2o',
            'o2m': 'm2o',
            'm2o': 'o2m',
            'm2m': 'm2m'
        };
        var _validHook = function _validHook(hook) {
            let keys = Object.keys(hook);
            let checks = _hook_required.length;
            _hook_required.map(function (r) {
                if (keys.indexOf(r) === -1) {
                    checks--;
                }
                if (r === 'type' && _relations.indexOf(hook[r]) === -1) {
                    throw new Error(
                        'Invalid relation type. Please use one of these: "' + _relations.join(', ') + '"'
                    );
                }
            });
            return checks === _hook_required.length;
        };
        var _flipHook = function _flipHook(name,table, old) {
            let nh = {};
            nh.reverse = name;
            nh.table = table;
            nh.type = _reverse[old.type];
            nh.mirror = old.mirror;
            nh.strict = old.strict;
            return nh;
        };
        var _grab = function _grab(name) {
            var subject = this;
            let rel = _e.relations;
            let hooks = _e.hooks;
            let gotHook = !_noHook(subject, name);
            if (gotHook) {
                let map = subject[hooks][name];
                let noRel = _noRel(subject, map.type, name);
                let lnk = subject[rel][map.type][name];
                if (!noRel && lnk) {
                    return em.findMany(lnk);
                } else {
                    return JH.promise(null);
                }
            }
            return JH.promise(null);
        };
        var ready = function ready() {
            let defer = JH.defer();
            var int = setInterval(function () {
                console.log('check');
                if (_q.length === 0) {
                    clearInterval(int);
                    defer.resolve(true);
                }
            }, 100);
            return defer.promise;
        };
        var que = function que(start) {
            let defer = JH.defer();
            var int = setInterval(function () {
                console.log('queuing');
                if (_q[0] === start) {
                    clearInterval(int);
                    defer.resolve(true);
                }
            }, 100);
            return defer.promise;
        };
        var addQue = function addQue(queID) {
            _q.push(queID);
        };
        var clearQue = function clearQue(queID) {
            _q.splice(_q.indexOf(queID), 1);
        };
        var _hook = function _hook(name, hook) {
            var subject = this;
            let hooks = _e.hooks;
            let exists = _noHook(subject, name);
            if (exists && _validHook(hook)) {
                this[hooks][name] = hook;
            }
        };
        var _unhook = function _unhook(name) {
            var subject = this;
            let gotHook = !_noHook(subject, name);
            if (gotHook) {
                let queID = JH.uuid();
                addQue(queID);
                que(queID).then(function () {
                     _clearHook(subject, name, 'drop').then(function () {
                         _rmHook(subject, name);
                         clearQue(queID);
                     });
                });
            }
        };
        var _emptyHook = function _emptyHook(name) {
            var subject = this;
            let gotHook = !_noHook(subject, name);
            if (gotHook) {
                let queID = JH.uuid();
                addQue(queID);
                que(queID).then(function () {
                     _clearHook(subject, name, 'empty').then(function () {
                         let type = subject[_e.hooks][name].type;
                         _emptyRel(subject, type, name);
                         clearQue(queID);
                     });
                });
            }
        };
        var _single = function _single(type) {
            return type === 'm2o' || type === 'o2o';
        };
        var _owner = function _owner(type) {
            return type === 'o2o' || type === 'o2m';
        };
        var _many = function _many(type) {
            return type === 'o2m' || type === 'm2m';
        };
        var _noRel = function _noRel(ent, type, name) {
            let rel = _e.relations;
            let no_rel = !JH.hasProp(ent, rel);
            if (no_rel) {
                ent[rel] = {};
            }
            let no_type = !JH.hasProp(ent[rel], type);
            if (no_type) {
                ent[rel][type] = {};
            }
            return !JH.hasProp(ent[rel][type], name);
        };
        var _rmRel = function _rmRel(ent, type, name) {
            let rel = _e.relations;
            delete ent[rel][type][name];
            if (JH.empty(ent[rel][type])) {
                delete ent[rel][type];
            }
        };
        var _noHook = function _noHook(ent, name) {
            let hooks = _e.hooks;
            let no_hooks = !JH.hasProp(ent, hooks);
            if (no_hooks) {
                ent[hooks] = {};
            }
            return !JH.hasProp(ent[hooks], name);
        };
        var _rmHook = function _rmHook(ent, name) {
            let hooks = _e.hooks;
            delete ent[hooks][name];
        };
        var _countAssigned = function _countAssigned(name) {
            var subject = this;
            let rel = _e.relations;
            let hooks = _e.hooks;
            if (_noHook(subject, name)) {
                return 0;
            } else {
                let map = subject[hooks][name];
                let noRel = _noRel(subject, map.type, name);
                if (noRel) {
                    return 0;
                } else {
                    let assigned = subject[rel][map.type][name];
                    if (assigned.constructor === Array) {
                        return assigned.length;
                    } else {
                        return assigned === null ? 0 : 1;
                    }
                }
            }
        };
        var _makeRel = function _makeRel(ent, type, name, id) {
            let rel = _e.relations;
            let noRel = _noRel(ent, type, name);
            if (_single(type)) {
                ent[rel][type][name] = id;
            } else {
                if (noRel) {
                    ent[rel][type][name] = [];
                }
                if (ent[rel][type][name].indexOf(id) === -1) {
                    ent[rel][type][name].push(id);
                }
            }
            return JH.promise(true);
        };
        var _defaults = function _defaults(option, type) {
            let defaults = {
                onDelete: 'abandon',
                onDrop: 'forget',
                onChange: 'abandon',
                onEmpty: 'abandon'
            };
            if (_owner(type)) {
                return defaults[option];
            } else {
                return 'vanish';
            }
        };
        var _takeAction = function _takeAction(ent, action, type, name, id) {
            let linkType = _reverse[type];
            if (['destroy', 'kill'].indexOf(action) !== -1) {
                em.remove(ent);
            } else {
                if (['abandon', 'forget'].indexOf(action) !== -1) {
                    _rmRel(ent, linkType, name);
                    _rmHook(ent, name);
                } else {
                    _vanish(ent, linkType, name, id);
                }
            }
        };
        var _vanish = function _vanish(ent, type, name, id) {
            let rel = _e.relations;
            if (_single(type)) {
                ent[rel][type][name] = null;
            } else {
                ent[rel][type][name].splice(id, 1);
            }
        };
        var _emptyRel = function _emptyRel(ent, type, name) {
            let rel = _e.relations;
            if (_single(type)) {
                ent[rel][type][name] = null;
            } else {
                ent[rel][type][name] = [];
            }
        };
        var _mark = function _mark(ent, type, name, id, clear = false) {
            if (clear === true) {
                return _clearHook(ent, name, 'change').then(function () {
                    return _makeRel(ent, type, name, id);
                });
            } else {
                return _makeRel(ent, type, name, id);
            }
        };
        /*
         * methods = [
         * 'change', --- when assign different (o2o, m2o only, if m2m or o2m no effect)
         * 'empty', --- when truncate hook
         * 'drop', --- when 'unhook'
         * 'delete' --- when entity is deleted
         * ];
         */
        var _clearHook = function _clearHook(ent, name, method) {
            let hooks = _e.hooks;
            let gotHook = !_noHook(ent, name);
            if (gotHook) {
                let map = ent[hooks][name];
                let type = map.type;
                let option = 'on'+ method.sentenceCase();
                let action;
                if (JH.hasProp(map, option)) {
                    action = map[option];
                } else {
                    action = _defaults(option, type);
                }
                if (_many(type) && method === 'change') {
                    return JH.promise(true);
                } else {
                    _clearRel(ent, name, action).then(function () {
                        if (['destroy', 'forget', 'detach'].indexOf(action) > -1) {
                            _rmRel(ent, type, name);
                            _rmHook(ent, name);
                        }
                    });
                }
            }
            return JH.promise(null);
        };
        var _clearRel = function _clearRel(ent, name, action) {
            let rel = _e.relations;
            let hooks = _e.hooks;
            let map = ent[hooks][name];
            let type = map.type;
            let gotRel = !_noRel(ent, type, name);
            if (gotRel) {
                if (map.mirror) {
                    let reverse = map.reverse;
                    let links = ent[rel][type][name];
                    if (links) {
                        return _mirror(links, action, type, reverse, ent[_e.key]).then(function () {
                            return JH.promise(true);
                        });
                    }
                }
            }
            return JH.promise(true);

        };
        var _mirror = function _mirror(links, action, type, name, key) {
            return em.findMany(links).then(function (pack) {
                let isArray = pack != null && pack.constructor === Array;
                pack = isArray ? pack : [pack];
                pack.map(function (link) {
                    _takeAction(link, action, type, name, key);
                });
                return JH.promise(true);
            });
        };
        var _markHook = function _markHook(subject, name, ent) {
            let hooks = _e.hooks;
            let table = _e.table;
            let key = _e.key;
            if (!JH.hasProp(ent, key)) {
                throw new Error(
                    'Association Entity is invalid: Missing primary UUID key "'+ key + '"'
                );
            }
            if (!JH.hasProp(subject, key)) {
                throw new Error(
                    'Current Entity is invalid: Missing primary UUID key "'+ key + '"'
                );
            }
            if (JH.hasProp(subject[hooks], name)) {
                let map = subject[hooks][name];
                let mt = map.type;
                if (map.strict) {
                    if (map.table !== ent[table]) {
                        throw new Error(
                            'Hook "strict" restriction violated: ' +
                                'Entity must be from "'+ map.table +'" table only.'
                        );
                    }
                }
                if (map.mirror) {
                    return _mark(subject, mt, name, ent[key], true).then(function () {
                        let hn = map.reverse;
                        return _mark(ent, _reverse[mt], hn, subject[key]).then(function () {
                            let fh = _flipHook(name, subject[table], map);
                            if (!JH.hasProp(ent, hooks)) {
                                ent[hooks] = {};
                            }
                            ent[hooks][hn] = fh;
                            return JH.promise(true);
                        });
                    });
                } else {
                   return _mark(subject, mt, name, ent[key]).then(function () {
                       return JH.promise(true);
                    });
                }
            }
            return JH.promise(null);
        };
        var _assign = function _assign(name, ent){
            var subject = this;
            let queID = JH.uuid();
            addQue(queID);
            que(queID).then(function () {
                _markHook(subject, name, ent).then(function () {
                    clearQue(queID);
                });
            });
        };
        em.getRepository = function getRepository(t) {
            if (!t) return null;
            return JH.acquire(t.sentenceCase() + _c.repo.suffix);
        };
        em.remove = function remove(e) {
            e[_e.deleted] = true;
            let queID = JH.uuid();
            addQue(queID);
            que(queID).then(function () {
                let hooks = e[_e.hooks];
                console.log(hooks);
                Object.keys(hooks).map(function (name) {
                    let queHookID = JH.uuid();
                    addQue(queHookID);
                    que(queHookID).then(function () {
                        _clearHook(e, name, 'delete').then(function () {
                            let type = hooks[name].type;
                            _rmRel(e, type, name);
                            _rmHook(e, name);
                            clearQue(queHookID);
                        });
                    });
                });
                clearQue(queID);
            });
        };
        em.stack = function stack(e) {
            let ss = JSON.stringify(e);
            let cs = _pc[e[_e.key]];
            if (cs !== undefined && cs === ss)  return;
            _s[e[_e.key]] = ss;
        };
        em.persist = function persist(e) {
            if (!JH.hasProp(_p, e[_e.key])) {
                _p[e[_e.key]] = e;
            }
        };
        em.flush = function flush() {
            return ready().then(function () {
                let b = [];
                if (!JH.empty(_p)) {
                    for (var p in _p) {
                        if (!_p.hasOwnProperty(p)) continue;
                        _p[p] = _prepare(_p[p]);
                        em.stack(_p[p]);
                    }
                }
                if (!JH.empty(_s)) {
                    for (var s in _s) {
                        if (!_s.hasOwnProperty(s)) continue;
                        b.push(JSON.parse(_s[s]));
                    }
                }
                if (!JH.empty(b)) {
                    return DBA.bulk(b);
                }
                return JH.promise(null);
            });
        };
    }
    return new EntitiesManager;
}