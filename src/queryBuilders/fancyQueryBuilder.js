angular.module('angular-hook-orm')
.factory('fancyQueryBuilder', ['JH', FancyQueryBuilder]);

function FancyQueryBuilder(JH){
    function QB() {
        var qb = this;
        var _c;
        var _q = {};
        (function () {
            _c = JH.acquire('HookConfig');
            console.log('started fancy Query Builder');
        })();
        qb.select = function select() {
            let args = Object.values(arguments);
            _q.action = 'select';
            _q.select = args.join(', ');
            return qb;
        };
        qb.update = function select() {
            let args = Object.values(arguments);
            _q.action = 'select';
            _q.select = args.join(', ');
            return qb;
        };
        qb.select = function select() {
            let args = Object.values(arguments);
            _q.action = 'select';
            _q.select = args.join(', ');
            return qb;
        };
        qb.from = function from(table, alias = null) {
            _q.from = table;
            if (alias) {
                _q.from += ' ' + alias;
            }
            return qb;
        };
        qb.sqlSafe = function from(str) {
            if (typeof str != 'string') {
                return str;
            }
//            var regex = new RegExp(/[\0\x08\x09\x1a\n\r"'\\\%]/g);
//            var swapper = function swapper(char){
//                var m = ['\\0', '\\x08', '\\x09', '\\x1a', '\\n', '\\r', "'", '"', "\\", '\\\\', "%"];
//                var r = ['\\\\0', '\\\\b', '\\\\t', '\\\\z', '\\\\n', '\\\\r', "''", '""', '\\\\', '\\\\\\\\', '\\%'];
//                return r[m.indexOf(char)];
//            };
//            return str.replace(regex, swapper);
            // https://stackoverflow.com/a/32648526
            return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
                switch (char) {
                    case "\0":
                        return "\\0";
                    case "\x08":
                        return "\\b";
                    case "\x09":
                        return "\\t";
                    case "\x1a":
                        return "\\z";
                    case "\n":
                        return "\\n";
                    case "\r":
                        return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%":
                        return "\\"+char;
                }
            });
        };
        qb.condition  = function condition(type, field, operator, value) {
            if (!JH.hasProp(_q, 'conditions')) {
               _q.conditions = {};
            }
            _q.conditions[type] = [field, operator, value];
            return qb;
        };
        qb.where = function where(field, operator, value) {
            qb.condition('where' , field, operator, value);
            return qb;
        };
        qb.andWhere = function andWhere(field, operator, value) {
            qb.condition('andWhere' , field, operator, value);
            return qb;
        };
        qb.orWhere = function orWhere(field, operator, value) {
            qb.condition('orWhere' , field, operator, value);
            return qb;
        };
        qb.join = function join(table, alias = null) {
            if (!JH.hasProp(_q, 'joins')) {
               _q.joins = [];
            }
            if (alias) {
                _q.joins[alias] = table;
            } else {
                _q.joins.push(table);
            }
            return qb;
        };
        qb.orderBy = function orderBy(field, method) {
            if (!JH.hasProp(_q, 'orderBy')) {
               _q.orderBy = [];
            }
            _q.orderBy.push([field, method]);
            return qb;
        };
        // TBD
        qb.groupBy = function groupBy(field) {
            if (!JH.hasProp(_q, 'groupBy')) {
               _q.groupBy = [];
            }
            _q.groupBy.push(field);
            return qb;
        };
        qb.sqlStart = function sqlStart() {
            let sql = '';
            let actions = {
                'select':'SELECT',
                'update': 'UPDATE',
                'delete': 'DELETE'
            };
            if (_q.action === 'select') {
                sql += 'SELECT '+ _q.select.replace(/,\s*$/, "") + ' FROM '+ _q.from;

            }

        };
        qb.dumpSql = function dumpSql() {
            let sql = '';
            let words = {
                'where':'WHERE',
                'andWhere': 'AND WHERE',
                'orWhere': 'OR WHERE'
            };
            sql += 'SELECT '+ _q.select.replace(/,\s*$/, "") + ' FROM '+ _q.from;
            if (JH.hasProp(_q, 'joins')) {
                Object.keys(_q.joins).forEach(function(k) {
                    let v = _q.joins[k];
                    if (typeof k === 'string' && k != 0) {
                        sql += ' JOIN ' + v + ' ' + k;
                    } else {
                        sql += ' JOIN ' + v;
                    }
                });
            }
            for (var clause in _q.conditions) {
                if (!_q.conditions.hasOwnProperty(clause)) continue;
                var data = _q.conditions[clause];
                let last = data.length - 1;
                data[last] = "'" + qb.sqlSafe(data[last]) + "'";
                sql += ' ' + words[clause] + ' ' + data.join(' ');
            }
            if (_q.action == 'select' && JH.hasProp(_q, 'orderBy')) {
                sql += ' ORDER BY ';
                let orders = [];
                _q.orderBy.forEach(function(v) {
                    orders.push(v.join(' '));
                });
                sql += orders.join(', ');
            }
            if (_q.action == 'select' && JH.hasProp(_q, 'groupBy')) {
                sql += ' GROUP BY ';
                sql += _q.groupBy.join(', ');
            }

            return sql;
        };
    }
    return QB;
}