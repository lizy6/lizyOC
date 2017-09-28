/**
 * Controller
 */
'use strict';
angular.module('basic')
  .controller('DataReportCtrl',['$rootScope', '$scope','$http', '$sce', function ($rootScope, $scope, $http, $sce) {
    $scope.msg = "DataReportCtrl";
    $scope.$on('model',(el, dataModel) => {
      $scope.mode = dataModel.mode;
      $scope.model = dataModel.model;
      $scope.$on('tab',function(el, num){
        if (num === 1) {
          let tmp = $scope.model ? $scope.model.FILE_PATH : "";
          $http.get('/api/jupyter/report/' + tmp)
          .then(response => {
            $scope.$emit("unableNext", true);
            $scope.rawHtml = $sce.trustAsHtml(response.data.data);
          })
          .catch(response => {
              $scope.rawHtml = $sce.trustAsHtml('<div>There is no html file with report! Please, run your code one more time!</div>');
          });
        }
      })
    });
  }])
  .directive('report', function() {
    return {
      templateUrl: 'views/directive/dataReport.html'
    };
});






