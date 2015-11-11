
app.controller('LoginCtrl', function($scope, $location, $route, UserService, MenuServiceFactory, USER_ROLES, AuthService, $timeout){
    $scope.title = "LOGIN";
    $scope.showerror = false;
   
    MenuServiceFactory.setActive($route.current.activeMenu);
    
    $scope.user = UserService.getUser();
    
   if (isEmpty($scope.user)) {
      $scope.loggedin = false;
    }
    else{
      $scope.loggedin = true;
      $location.path("/");
    }
    
    $scope.login = function(){

      var ul = UserService.login($scope.username, $scope.password);
      if (ul === false){
         $scope.showerror = true;
      }else{
   //      $modalStack.dismissAll("nothin");

//          $timeout(function(){
//            UserService.logout();
//          }, 500000);
         $location.path("/");
      }

    };
 
  $scope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
 
  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };   
});

app.controller('InCtrl', function($scope, $location, $http, MenuServiceFactory, UserService, $cookies, $popup, AuthService, AccountService, $q){
    $scope.title = "IN";
//    $scope.items = $cookies.getObject("items");

    $scope.numPerPage = 10;
    $scope.currentPage = 1;

    $scope.items = AccountService.getList();

//    $scope.showedItems = $scope.items.slice($scope.currentPage-1, $scope.numPerPage);

    console.log($scope.items);

//    if (!$scope.items){

/*
    $q.when(r = AccountService.getList()).then(function(result){
        console.log(r);
        $scope.items = r;
        $scope.showedItems = $scope.items.slice(0, $scope.numPerPage);
    });
*/


//      $cookies.putObject("items", $scope.items);
//    }

    $scope.activeMenu = MenuServiceFactory.menuActive;


//    $scope.maxSize = 5;
/*
     $scope.$watch('currentPage', function() {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
        , end = begin + $scope.numPerPage;

        $scope.showedItems = $scope.items.slice(begin, end);
        console.log($scope.showedItems);
     });
*/
    $scope.orderDirection = false;
    $scope.orderField = 'id';

    if (isEmpty(UserService.getUser()))
      $location.path("/login");
    
    $scope.handleState = function(s){
      MenuServiceFactory.menuChanged(s);
    };

    $scope.pagesNum = function(){
//        console.log(Math.ceil($scope.items.length / $scope.numPerPage));
        return Math.ceil($scope.items.length / $scope.numPerPage);
    }

    $scope.totalItems = function(){
//        console.log($scope.items.length);
        return $scope.items.length;
    }

    $scope.confirmRemoveItem = function(index){
        $popup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to delete?',
            scope: $scope,
            okText: 'OK',
            cancelText: 'Cancel',
            okTap: function(e) {

                // template scope will be available via 'this'
//                console.log(e);
                return e;
            }
        }).then(function( value ){
//                console.log(value);
                $scope.removeItem(index);
        });
    }
    
    $scope.removeItem = function(index){
        if (index != -1) {
          $scope.items.splice(index, 1);
        }
      $cookies.putObject("items", $scope.items, {expires: new Date((new Date()).valueOf() + 1000*3600*1)});
    };

    $scope.changeOrder = function(field){
        if (field == $scope.orderField){
            $scope.orderDirection = !$scope.orderDirection;
        }else{
            $scope.orderDirection = false;
            $scope.orderField = field;
        }
    }


    
//    MenuServiceFactory.setActive($route.current.activeMenu);
    
});

app.controller('MainCtrl', function($scope, $location, $route, MenuServiceFactory, UserService, $cookies, AuthService){
    if (isEmpty(UserService.getUser()))
      $location.path("/login");
    $scope.title = "MAIN PAGE";
    MenuServiceFactory.setActive($route.current.activeMenu);
});

app.controller('LogoutCtrl', function($scope, $location, UserService, MenuServiceFactory,$cookies, AuthService){
    UserService.logout();
    $cookies.remove("items");
    $location.path("/login");
//    MenuServiceFactory.setActive($route.current.activeMenu);
});

app.controller('OutCtrl', function($scope, $location, MenuServiceFactory, UserService, USER_ROLES, AuthService){
    if (isEmpty(UserService.getUser()))
      $location.path("/login");
    $scope.title = "OUT";
//    MenuServiceFactory.setActive($route.current.activeMenu);
});

app.controller('MenuController', function($scope, MenuServiceFactory, USER_ROLES, AuthService, UserService){
  
  $scope.active = 0;
  $scope.status = "";
  $scope.isActive = function(m){
    return MenuServiceFactory.isActive(m);
  };
  $scope.setActive = function(m){
    MenuServiceFactory.setActive(m);
  }

  $scope.$on('menuStateChanged', function() {
//        MenuServiceFactory.setActive(MenuServiceFactory.menuActive);
        $scope.status = "STATUS: " + MenuServiceFactory.menuActive;
  });
 
   $scope.$on('userStateChanged', function() {
//        MenuServiceFactory.setActive(MenuServiceFactory.menuActive);
      $scope.user = UserService.getUser();
    console.log($scope.user);
  }); 


});

app.directive('loginDialog', function (AUTH_EVENTS) {
  return {
    restrict: 'A',
    template: '<div ng-if="visible" ng-include="\'login.html\'">',
    link: function (scope) {
      var showDialog = function () {
        scope.visible = true;
      };
  
      scope.visible = false;
      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
    }
  };
});
