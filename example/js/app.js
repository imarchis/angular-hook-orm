var myApp = angular.module('myApp', ['angular-hook-orm']);
myApp.controller(
    'MainCtrl',
    ['$scope', 'EntitiesManager', 'List', '$timeout',
    function($scope, em, dbm, List) {
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