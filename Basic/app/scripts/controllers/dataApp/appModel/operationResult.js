
"use strict";
angular.module('basic')
  .controller('ResultCtrl',['appOperResult','$location','$rootScope','$filter','$scope','$http',
  (appOperResult,$location,$rootScope,$filter, $scope,$http) => {
    $scope.appName = $location.path().split(/[\s/]+/).pop();
    $scope.projectType=[];
    $scope.projectTypeList=[];

    $http.get('/api/appResults/getScheduleNames/'+ $scope.appName )
      .success((data)=> {
        let result = data.results;
        if (result !== null && result !== undefined){
          $scope.projectType = result;
          result.forEach((projectType,  i)=> {
            console.log('!!!!!projectType',projectType)
            $http.get('/api/appResults/getResultsList/' + projectType.SCHEDULE_NAME )
            .success((resList) => {
              if (resList !== null && resList !== undefined){
                $scope.projectType[i].resList = resList.resultArr;
                console.log('111111111111',$scope.projectType[i].resList)
              }
            })
            .catch(err =>{console.log('err', err);})
          })
        }

      });


    $scope.getViewList = function (item) {


      };


    $scope.view =(item) => {
      console.log(".... list====>", item);
      $http.post('/api/appResults/getViews', {
        'appName': item.APP_NAME,
        'scheduleName':item.SCHEDULE_NAME,
        'executeTime':item.EXECUTE_TIME
      }).success(function (data) {
        console.log("item0000000 item0000000====>", data);
        $scope.vlist= data.results;
        console.log(".-----... $scope.vlist====>", $scope.vlist);
        appOperResult.open($scope.vlist);

      });
    }
  }])
  .directive('result', () => {
    return {
      templateUrl: 'views/dataApp/appModel/operationResult.html'
    };
  })
