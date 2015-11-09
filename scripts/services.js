app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});

app.service('UserService', function($rootScope){
  var user = {};
  this.login = function(username, password){
      user2 = {username:"user", password: "pass"};
      if (username == user2.username && password == user2.password){
        user = user2;
        //$location.path("/");
        $rootScope.$broadcast('userStateChanged');

        return user;
      }else {
        return false;
      }
    };
    
  this.logout = function(){
    user = {};
    $rootScope.$broadcast('userStateChanged');
    return false;
  }
  
  this.getUser = function(){

    return user;
  };

});

app.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
  };
});

app.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    return $http
      .post('/login', credentials)
      .then(function (res) {
        Session.create(res.data.id, res.data.user.id, res.data.user.role);
        return res.data.user;
      });
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
});


app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
});

app.factory('MenuServiceFactory', function($rootScope) {

  var menuService = {};
  
  menuService.menuActive = 0;
  
  menuService.menuChanged = function(m){
  
    this.menuActive = m;
    this.updateMenu();
  
  };
  
  menuService.updateMenu = function(){

    $rootScope.$broadcast('menuStateChanged');  
  };

  menuService.isActive = function(m){
    return this.menuActive === m;
  };

  menuService.setActive = function(m){
    this.menuActive = m;
  }

  return menuService;
});