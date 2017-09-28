'use strict';
angular.module('basic')
.controller('KnowledgeMapCtrl',['cdmSource','$location', '$rootScope', '$scope', '$filter',
(cdmSource, $location, $rootScope, $scope, $filter) => {
    $scope.datasets =[];
    let handleSuccesscdmSource = (data, status)=> {
      $scope.titles = Object.keys(data[0]);
      $scope.datasets = data;

      console.log('handleSuccesscdmSource cdmSource',$scope.datasets,$scope.titles);
    }

    cdmSource.query({}, function (res) {
      handleSuccesscdmSource(res);
    });
}]);
