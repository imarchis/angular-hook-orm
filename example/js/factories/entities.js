angular.module('myApp')
    .factory('List', ['EntitiesManager',  List])
    .factory('ListRepo', ['EntitiesManager', ListRepo])
;

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

