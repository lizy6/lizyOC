'use strict';

/**
 * Controller of the LoginCtrl
 */

angular.module('basic')
  .controller('LoginCtrl', ['$scope', '$state', '$filter', '$location', '$rootScope', 'hotkeys', 'ipCookie', function ($scope, $state, $filter, $location, $rootScope, hotkeys, ipCookie) {
    $scope.homeIndex = () => {
      $state.go('index');
    };


    $scope.expires = 7;
    $scope.expirationUnit = 'days';

    let setMessage = function (message, messageStyle) {
      $scope.message = message ? message : null;
      $scope.messageStyle = messageStyle ? messageStyle : 'success';
    };


    $scope.saveCookie = function () {
      setMessage();
      $scope.messageStyle = 'success';
      // key, value, options
      console.log('saving cookie...');
      ipCookie('username', $scope.usermessage.username, {
        expires: $scope.expires,
        expirationUnit: $scope.expirationUnit
      });
      ipCookie('userpass', $scope.usermessage.password, {
        expires: $scope.expires,
        expirationUnit: $scope.expirationUnit
      });
      console.log('new cookie value...');
      console.log(ipCookie('username'));
      console.log(ipCookie('userpass'));
      setMessage("Cookie created. Use your browser cookie display to verify content or expiry.");
    };

    $scope.deleteCookie = function () {
      setMessage();
      console.log('removing cookie...');
      ipCookie.remove('username');
      ipCookie.remove('userpass');
      if (ipCookie() === undefined) {
        setMessage('Successfully deleted cookie.');
      } else {
        setMessage('Unable to delete cookie.', 'danger');
      }
    };

    $scope.username = $filter('translate')('web_common_010');
    $scope.password = $filter('translate')('web_common_011');
    $scope.signin = $filter('translate')('web_common_012');
    $scope.isForget = false;
    $scope.login = () => {
      //$state.go('dataExplore');
      if ($scope.usermessage.password !== undefined) {
        $rootScope.login($scope.usermessage.username, $scope.usermessage.password);

      }
    };
    //enter 进入页面
    $scope.enterLogin = (e) => {
      if (e.keyCode == 13) {
        //$state.go('dataExplore');
        if ($scope.usermessage.password !== undefined) {
          $rootScope.login($scope.usermessage.username, $scope.usermessage.password);
        }
      }
    };
    //图片预加载
    let images = new Array()

    function preload() {
      for (let i = 0; i < arguments.length; i++) {
        images[i] = new Image()
        images[i].src = arguments[i]
      }
    };

    preload(
      "images/homeBag.png",
      "images/logo.png"
    );

  }]);
