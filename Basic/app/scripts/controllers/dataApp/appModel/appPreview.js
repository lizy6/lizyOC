'use strict';
angular.module('basic')
  .controller('PreviewCtrl',['$location', '$scope', '$http', ($location, $scope, $http) => {
      $scope.appName = $location.path().split(/[\s/]+/).pop();
      $scope.markdown = "";
      if ($scope.appName == "医保控费") {
        $http.get('/api/appFile/'+ $scope.appName + '/overview')
          .success((data)=> {
            $scope.markdown = data;
          })
          .catch(err =>{console.log('err', err);})
      }
      $scope.isShow = true;
      $scope.isError = true;
      $scope.isWaring = false;

      $scope.change = () => {
        $scope.isShow = !$scope.isShow;
        $scope.isError = !$scope.isError;
        $scope.isWaring = !$scope.isWaring;
      };

      $scope.save = () => {
        $scope.isShow = !$scope.isShow;
        $scope.isError = !$scope.isError;
        $scope.isWaring = !$scope.isWaring;
      }
    }
  ])
  .directive('preview', () => {
    return {
      templateUrl: 'views/dataApp/appModel/appPreview.html'
    };
  });


