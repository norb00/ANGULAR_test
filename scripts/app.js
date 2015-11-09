function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

var app = angular.module('dbApp', ['ngRoute', 'ngCookies','artemdemo.popup', 'ngSanitize', 'ngAnimate']);

var user = {};

app.config(['$routeProvider', '$locationProvider', '$httpProvider' , function($routeProvider){
    $routeProvider
        .when('/', {
            controller : 'MainCtrl',
            templateUrl : 'main.html',
            activeMenu: 0
        })
        .when('/login', {
            controller : 'LoginCtrl',
            templateUrl : 'login-form.html',
            activeMenu: 1
        })
        .when('/in', {
            controller : 'InCtrl',
            templateUrl : 'in.html',
            activeMenu: 2
        })
        .when('/logout', {
            controller : 'LogoutCtrl',
            template: '<p>LOGGED OUT</p>',
            activeMenu: 3
        })        
        .when('/out', {
            controller : 'OutCtrl',
            templateUrl : 'out.html',
            activeMenu: 4
        });
}]);

