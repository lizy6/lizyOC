'use strict';
/**
 * Controller of the HomeCtrl
 */
angular.module('basic')
  .controller('HomeCtrl', ['$rootScope', '$scope','loginModel',
    function ($rootScope, $scope,loginModel) {
      $scope.login = () => {
        // $state.go('login');
        loginModel.open();
      };
    }]);









