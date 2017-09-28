'use strict';
angular.module('basic.services', ['ui.bootstrap'])
  .service('createModel', ['$uibModal', function ($uibModal) {
    this.open = function (index) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: ['$location', '$rootScope', '$scope', '$filter', '$uibModalInstance', '$http',
          function ($location, $rootScope, $scope, $filter, $uibModalInstance, $http) {
            $scope.title = $filter('translate')('modelType_0' + index);
            $scope.content = $filter('translate')('modelType_0' + index);

            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
            $scope.create = () => {
              if ($scope.model.name) {
                //check in DB APP
                $http.get('/api/model/' + $scope.model.name).success((data) => {
                  if (data.result !== null) {
                    $scope.model.name = '';
                    $scope.model.nameTip = 'Please use another name!';
                  } else {
                    $rootScope.exploreName = 'modelType_01';
                    $rootScope.modelExpertName = $scope.model.name;
                    $rootScope.nowActive = 1;
                    $location.path('/explore/0' + index + '/new/' + $scope.model.name);
                    $uibModalInstance.dismiss();
                  }
                })
                  .catch(err => {
                    console.log(err);
                  });
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('createApp', ['$uibModal', function ($uibModal) {
    this.open = (appName) => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: ['$rootScope', '$location', '$scope', '$filter', '$uibModalInstance', '$http',
          ($rootScope, $location, $scope, $filter, $uibModalInstance, $http) => {
            $scope.title = $filter('translate')('web_common_data_app_layer_01');
            $scope.content = $filter('translate')('web_common_data_app_layer_02');
            $scope.url = 'app';
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.create = function () {
              if ($scope.model.name) {
                //check in DB APP
                $rootScope.modelAppName = $scope.model.name;
                $http.get('/api/app/' + $scope.model.name).success(data => {
                  if (data.result !== null) {
                    $scope.model.name = '';
                    $scope.model.nameTip = 'Please use another name!!';
                  } else {
                    $http.post('/api/app/' + $scope.model.name, {
                      APP_NAME: $scope.model.name,
                      USER_NAME: $rootScope.getUsername()
                    })
                      .success(data => {
                        if (data.result === 'success') {
                          $http.post('/api/appFile/' + data.app.APP_NAME, {
                            userName: $rootScope.getUsername(),
                            itemType: "app",
                            itemID: data.app.APP_ID
                          })
                            .success(data => {
                              if (data.result === 'success') {
                                $location.path('/app/new/' + $scope.model.name);
                                $uibModalInstance.dismiss();
                              }
                            })
                            .catch(err => {
                              console.log(err);
                            });
                        }
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  }
                });
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('openPreview', ['$uibModal', '$http', function ($uibModal, $http) {
    this.open = function (resultPreview) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/savePreview.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance', '$location', '$cookies',
          ($scope, $uibModalInstance, $location, $cookies) => {
            $scope.resultPreview = resultPreview;
            $scope.save = () => {
              $http.get('/api/jupyter/save')
                .success(data => {
                  if (data !== undefined && data !== null) {
                    if (data.msg === 'success') {
                      let date = new Date();
                      let projectType, projectName, path, appName;
                      if ($location.path().split(/[\s/]+/).pop() === data.projectType) {
                        projectType = '01';
                        projectName = data.projectType;
                        path = 'modelPath';
                      } else {
                        projectType = '00';
                        appName = data.projectType;
                        projectName = data.projectType;
                        path = 'appPath';
                      }
                      let savaData = {
                        MODEL_NAME: $location.path().split(/[\s/]+/).pop(),
                        MODEL_INFO: data.modelInfo,
                        USER_NAME: $cookies.get('username'),
                        TYPE_MENU_ID: projectType,
                        VIEW_MENU_ID: data.modelType,
                        UPDATED_TIME: date.getTime(),
                        FILE_PATH: $location.path().split(/[\s/]+/).pop() + '.ipynb',
                        NOTEBOOK_PATH: path,
                        COMMENT: 'Lets try it!',
                        APP_ID: appName
                      };
                      $http.post('/api/model/new', savaData)
                        .success(data => {
                          if (data.msg === 'success') {
                            if (projectType === '01') {
                              $location.path('/explore');
                            }
                            if (projectType === '00') {
                              $location.path('/app/update/' + projectName);
                            }
                          }
                          // console.log('Jupyter save:', data.msg);
                          $uibModalInstance.close({msg: data.msg});
                        })
                        .catch(err => {
                          $uibModalInstance.close({msg: err});
                          console.log('err in /api/model/new:', err);
                        });
                    } else {
                      // console.log('Jupyter save:', data.msg);
                      $uibModalInstance.close({msg: data.msg});
                    }
                  } else {
                    console.log('An unexpected error occurred in Preview Modal');
                    $uibModalInstance.close({msg: 'An unexpected error occurred in Preview Modal'});
                  }
                })
                .catch(err => {
                  $uibModalInstance.close({msg: err});
                  console.log('err in preview:', err);
                });
            };
            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
          }
        ]
      }).result;
    };
  }])
  .service('createAppModel', ['$uibModal', function ($uibModal) {
    this.open = function (appName) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createAppModel.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance',
          function ($scope, $uibModalInstance) {
            $scope.items = [
              {img: 'pic1', content: 'modelType_01', url: 'data', name: 'data', isActive: false},
              {img: 'pic2', content: 'modelType_02', url: 't1', name: 'data2', isActive: false},
              {img: 'pic3', content: 'modelType_03', url: 't2', name: 'data3', isActive: false},
              {img: 'pic4', content: 'modelType_04', url: 't3', name: 'data4', isActive: false},
              {img: 'pic5', content: 'modelType_05', url: 't4', name: 'data5', isActive: false},
              {img: 'pic6', content: 'modelType_06', url: 'notebook', name: 'notebook', isActive: false}
            ];
            $scope.appName = appName;
            $scope.items[0].isActive = true;
            let type = 1;
            $scope.urlcontent = $scope.items[0];
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.changeStyle = function (idx) {
              angular.forEach($scope.items, function (item) {
                item.isActive = false;
              });
              $scope.items[idx].isActive = true;
              type = idx + 1;
              $scope.urlcontent = $scope.items[idx];
            };
            $scope.create = function () {
              if ($scope.model.name) {
                $uibModalInstance.close({appName: appName, type: type, modelName: $scope.model.name});
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('createArrange', ['$uibModal', function ($uibModal) {
    this.open = (targetNameList, modelNameList, appName, makeFileName) => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createArrange.html',
        size: 'size',
        controller: ['$cookies', '$scope', '$filter', '$uibModalInstance', '$http',
          ($cookies, $scope, $uibModalInstance, $http) => {
            let opts = [];
            $scope.makeFileName = makeFileName;
            $scope.data = {
              targetModel: null,
              prereqModel: [],
              targetModelOptions: targetNameList,
              prereqModelOptions: [
                []
              ],
            };

            function makeOptions(tmp, prereqModelTmp) {
              return tmp.filter(option => {
                return !prereqModelTmp.includes(option);
              });
            }

            $scope.makePrereqOptions = target => {
              $scope.data.prereqModel = [];
              $scope.data.prereqModelOptions = [
                []
              ];
              opts = makeOptions(modelNameList, [target]);
              $scope.data.prereqModelOptions[0] = opts;
            };
            $scope.action = index => {
              if (index === $scope.data.prereqModelOptions.length - 1 && $scope.data.prereqModelOptions.length !== modelNameList.length - 1) {
                let tmp = makeOptions(opts, Object.values($scope.data.prereqModel));
                $scope.data.prereqModelOptions[index + 1] = tmp;
              } else {
                $scope.data.prereqModelOptions.splice(index, 1);
                $scope.data.prereqModelOptions.map(arr => {
                  if (!arr.includes($scope.data.prereqModel[index])) {
                    arr.push($scope.data.prereqModel[index]);
                  }
                });
                $scope.data.prereqModel.splice(index, 1);
              }
            };
            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
            $scope.save = () => {
              let savaData = {
                MAKEFILE_ID: $scope.makeFileName,
                USER_ID: $cookies.get('username'),
                APP_ID: appName,
                TARGET: $scope.data.targetModel,
                PREREQUISITES: Object.values($scope.data.prereqModel).join(' ')
              };
              $http.post('/api/appMakeFile/new', savaData).success((data) => {
                console.log('MAKEFILE save:', data.msg);
                $uibModalInstance.close(data.msg);
              });
            };
          }
        ]
      })
        .result;
    };
  }])
  .service('createTaskPlan', ['$uibModal', function ($uibModal) {
    this.open = function (createOrEdit, editSchedule) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createTaskPlan.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance',
          function ($scope, $uibModalInstance) {
            $scope.schedule = null;
            createOrEdit === 'edit' ? $scope.schedule = editSchedule : $scope.schedule;
            createOrEdit === 'edit' ? $scope.isEdit = true : $scope.isEdit = false;
            $scope.isPause = false;
            //计划设置1
            $scope.grids = {
              changestatus: '每周',
              status: [{name: '每天'}, {name: '每月'}, {name: '每周'}]
            };

            //每周设置
            $scope.weeks = {
              changestatus: '周一',
              status: [{name: '周一'}, {name: '周二'}, {name: '周三'}, {name: '周四'}, {name: '周五'}, {name: '周六'}, {name: '周日'}]
            };
            // console.log('1111', $scope.weeks);
            //每月设置
            $scope.months = {
              changestatus: '1',
              status: [{name: '1'}, {name: '2'}, {name: '3'}, {name: '4'}, {name: '5'}, {name: '6'}, {name: '7'}, {name: '8'}, {name: '9'}, {name: '10'}, {name: '11'}, {name: '12'}, {name: '13'}, {name: '14'}, {name: '15'}, {name: '16'}, {name: '17'}, {name: '18'}, {name: '19'}, {name: '20'}, {name: '21'}, {name: '22'}, {name: '23'}, {name: '24'}, {name: '25'}, {name: '26'}, {name: '27'}, {name: '28'}, {name: '29'}, {name: '30'}, {name: '31'}]
            };

            //每小时设置
            $scope.hours = {
              changestatus: '0',
              status: [{name: '0'}, {name: '1'}, {name: '2'}, {name: '3'}, {name: '4'}, {name: '5'}, {name: '6'}, {name: '7'}, {name: '8'}, {name: '9'}, {name: '10'}, {name: '11'}, {name: '12'}, {name: '13'}, {name: '14'}, {name: '15'}, {name: '16'}, {name: '17'}, {name: '18'}, {name: '19'}, {name: '20'}, {name: '21'}, {name: '22'}, {name: '23'}]
            };

            //每分钟设置
            $scope.minutes = {
              changestatus: '0',
              status: [{name: '0'}, {name: '1'}, {name: '2'}, {name: '3'}, {name: '4'}, {name: '5'}, {name: '6'}, {name: '7'}, {name: '8'}, {name: '9'}, {name: '10'}, {name: '11'}, {name: '12'}, {name: '13'}, {name: '14'}, {name: '15'}, {name: '16'}, {name: '17'}, {name: '18'}, {name: '19'}, {name: '20'}, {name: '21'}, {name: '22'}, {name: '23'}, {name: '24'}, {name: '25'}, {name: '26'}, {name: '27'}, {name: '28'}, {name: '29'}, {name: '30'}, {name: '31'}, {name: '32'}, {name: '33'}, {name: '34'}, {name: '35'}, {name: '36'}, {name: '37'}, {name: '38'}, {name: '39'}, {name: '40'}, {name: '41'}, {name: '42'}, {name: '43'}, {name: '44'}, {name: '45'}, {name: '46'}, {name: '47'}, {name: '48'}, {name: '49'}, {name: '50'}, {name: '51'}, {name: '52'}, {name: '53'}, {name: '54'}, {name: '55'}, {name: '56'}, {name: '57'}, {name: '58'}, {name: '59'}]
            };

            //初始值
            $scope.grids.changestatus = '每天';
            $scope.isWeekOk = false;
            $scope.isMonthOk = false;
            $scope.$watch('grids.changestatus', function (n, o) {
              if (n === o) {
                return;
              }
              if (n === '每天') {
                $scope.isWeekOk = false;
                $scope.isMonthOk = false;
              }
              if (n === '每周') {
                $scope.isWeekOk = true;
                $scope.isMonthOk = false;
              }
              if (n === '每月') {
                $scope.isWeekOk = false;
                $scope.isMonthOk = true;
              }
            });
            // if edit,the schedule_name can not change
            if (createOrEdit === 'edit' && editSchedule) {
              editSchedule.HOUR ? $scope.hours.changestatus = editSchedule.HOUR : $scope.hours.changestatus = 0;
              editSchedule.HOUR ? $scope.minutes.changestatus = editSchedule.MINUTE : $scope.minutes.changestatus = 0;
              editSchedule.STATE === 'RUNNING' ? $scope.isPause = false : $scope.isPause = true;
              editSchedule.APP_ID ? $scope.schedule.appId = editSchedule.APP_ID : $scope.schedule;

              if (editSchedule.DATE) {
                $scope.grids.changestatus = '每月';
                $scope.isWeekOk = false;
                $scope.isMonthOk = true;
                $scope.months.changestatus = editSchedule.DATE;
              } else if (editSchedule.DAYOFWEEK) {
                $scope.grids.changestatus = '每周';
                $scope.isWeekOk = true;
                $scope.isMonthOk = false;
                editSchedule.DAYOFWEEK === 1 ? editSchedule.DAYOFWEEK = '周一' : editSchedule.DAYOFWEEK === 2 ? editSchedule.DAYOFWEEK = '周二' : editSchedule.DAYOFWEEK === 3 ? editSchedule.DAYOFWEEK = '周三' : editSchedule.DAYOFWEEK === 4 ? editSchedule.DAYOFWEEK = '周四' : editSchedule.DAYOFWEEK === 5 ? editSchedule.DAYOFWEEK = '周五' : editSchedule.DAYOFWEEK === 6 ? editSchedule.DAYOFWEEK = '周六' : editSchedule.DAYOFWEEK === 7 ? editSchedule.DAYOFWEEK = '周日' : editSchedule.DAYOFWEEK;
                $scope.weeks.changestatus = editSchedule.DAYOFWEEK;
              } else {
                $scope.isWeekOk = false;
                $scope.isMonthOk = false;
              }
              $scope.schedule.name = editSchedule.SCHEDULE_NAME;
              $scope.schedule.command = editSchedule.COMMAND;
            }


            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.save = function () {
              if ($scope.grids.changestatus === '每周') {
                $scope.months.changestatus = null;
              } else if ($scope.grids.changestatus === '每月') {
                $scope.weeks.changestatus = null;
              } else if ($scope.grids.changestatus === '每天') {
                $scope.months.changestatus = null;
                $scope.weeks.changestatus = null;
              }
              $scope.schedule.choice = $scope.grids.changestatus;
              $scope.schedule.date = parseInt($scope.months.changestatus);
              $scope.schedule.hour = parseInt($scope.hours.changestatus);
              $scope.schedule.minute = parseInt($scope.minutes.changestatus);
              $scope.schedule.dayOfWeek = $scope.weeks.changestatus;
              $scope.isPause === false ? $scope.schedule.state = 'RUNNING' : $scope.schedule.state = 'SUSPEND';
              //console.log("on save >>>>$scope.isPause,$scope.schedule",$scope.isPause,$scope.schedule);
              $uibModalInstance.close($scope.schedule);
            };
          }
        ]
      })
        .result;
    };
  }])
  .service('createExpertModule', ['$uibModal', '$http', function ($uibModal, $http) {
    this.open = function (arrItem) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/chooseKernelPage.html',
        // templateUrl: 'views/layer/createExpertModel.html',
        size: 'size',
        controller: ['$uibModalInstance', '$scope', '$rootScope', '$location',
          function ($uibModalInstance, $scope, $rootScope, $location) {
            $http.get('/api/jupyter/kernels').then(data => {
              $scope.selectKernel = data.data.kernellist[2];
              $scope.kernels = data.data.kernellist;
            });
            $scope.projectType = 'explore';
            $scope.items = arrItem;
            $scope.items[0].isActive = true;
            let type = 1;
            $scope.urlcontent = $scope.items[0];
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.changeStyle = function (idx) {
              angular.forEach($scope.items, function (item) {
                item.isActive = false;
              });
              $scope.items[idx].isActive = true;
              type = idx + 1;
              $scope.urlcontent = $scope.items[idx];
            };
            $scope.create = function () {
              if ($scope.model.name) {
                //check in DB APP
                $rootScope.modelAppName = $scope.model.name;
                let date = new Date();
                $http.get('/api/model/' + $scope.model.name).success(data => {
                  if (data.result !== null) {
                    $scope.model.name = '';
                    $scope.model.nameTip = 'Please use another name!!';
                  } else {
                    console.log('kerker',$scope.selectKernel)
                    $http.post('/api/model/' + $scope.model.name, {
                      APP_ID: $scope.model.name,
                      USER_ID: $rootScope.getUsername(),
                      TYPE_MENU_ID: "01",
                      VIEW_MENU_ID: "06",
                      COMMENT: "heyyyy",
                      FILE_PATH: "FILE_PATH",
                      UPDATED_TIME: date.getTime(),
                      KERNEL: $scope.selectKernel
                    })
                      .success(data => {
                      if (data.result === 'success') {
                        $http.post('/api/appFile/' + data.model.MODEL_NAME, {
                          userName: $rootScope.getUsername(),
                          modelTemplate: $scope.urlcontent.content,
                          itemType: "expert",
                          itemID: data.model.MODEL_ID
                        })
                          .success(data => {
                            if (data.result === 'success') {
                              $rootScope.exploreName = 'modelType_06';
                              $rootScope.modelExpertName = $scope.model.name;
                              $rootScope.nowActive = 6;
                              $uibModalInstance.close({
                                modelTemplate: $scope.urlcontent.content,
                                modelName: $scope.model.name
                              });
                            }
                          })
                          .catch(err => {
                            console.log(err);
                          });
                      }
                    })
                      .catch(err => {
                        console.log(err);
                      });
                  }
                });
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('openNotebook', ['$uibModal', function ($uibModal) {
    this.open = function (modelTemplate, modelName, modelType) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/dataExplore/expertModule.html',
        size: 'lg',
        controller: ['$scope', '$cookies', '$uibModalInstance', '$http', '$sce',
          function ($scope, $cookies, $uibModalInstance, $http, $sce) {
            $scope.notebookPath = '';
            let ipyPath = '';
            let typeMenu = '00';
            let appName;
            let path;
            $scope.init = function () {
              $http.get('/api/expert/pathNoteBook', {
                params: {
                  modelTemplate: modelTemplate,
                  modelName: modelName,
                  modelType: modelType
                }
              }).then(function (response) {
                if (modelType === 'explore') {
                  typeMenu = '01';
                  path = 'modelPath';
                }
                if (modelType !== 'explore') {
                  appName = modelType;
                  typeMenu = '00';
                  path = 'appPath';
                }
                ipyPath = response.data.jpyPath;
                $scope.notebookPath = $sce.trustAsResourceUrl(ipyPath);
                let date = new Date();
                let savaData = {
                  MODEL_NAME: modelName,
                  USER_NAME: $cookies.get('username'),
                  TYPE_MENU_ID: typeMenu,
                  VIEW_MENU_ID: '06',
                  UPDATED_TIME: date.getTime(),
                  NOTEBOOK_PATH: path,
                  FILE_PATH: modelName + '.ipynb',
                  COMMENT: 'Lets try it!',
                  APP_ID: appName
                };
                // console.log('Data to DB savaData:', savaData);
                $http.post('/api/model/new', savaData).success(function (data) {
                  console.log('Expert MODE save:', data.msg);
                });
              });
            };
            $scope.init();
            $scope.cancel = function () {
              $uibModalInstance.close();
            };
          }
        ]
      }).result;
    };
  }])
  .service('appOperResult', ['$uibModal', function ($uibModal) {
    this.open = function (list) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/appOperResult.html',
        size: 'lg',
        controller: ['$scope', '$uibModalInstance',
          function ($scope, $uibModalInstance) {
            $scope.viewList = list;
            $scope.changeView = function (item) {
              document.getElementById('ifm').setAttribute('src', item.path);
            };
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        ]
      }).result;
    };
  }])
  .service('deletePage', ['$rootScope', '$uibModal', '$http', function ($rootScope, $uibModal, $http) {
    this.open = function (item) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/deletePage.html',
        size: 'size',
        controller: ['$scope', '$uibModalInstance',
          function ($scope, $uibModalInstance) {
            $scope.cancel = () => {
              $uibModalInstance.dismiss();
            };
            let itemID, type, path, user;
            if (item !== null && item !== undefined) {
              user = $rootScope.getUsername();
              $scope.isOwner = (item.USER_NAME === user);
              if (item.MODEL_ID !== null && item.MODEL_ID !== undefined) {
                type = 'model';
                itemID = item.MODEL_ID;
                if (item.APP_ID) {
                  path = item.NOTEBOOK_PATH + '/' + item.APP_ID + '/' + item.MODEL_NAME + '.ipynb';
                } else {
                  path = item.NOTEBOOK_PATH + '/' + item.MODEL_NAME;
                }
              } else {
                path = item.NOTEBOOK_PATH + '/' + item.APP_NAME;
                itemID = item.APP_NAME;
                type = 'app';
              }
            } else {
              console.log('Del item === null && item === undefined');
            }
            $scope.ok = () => {
              $http.put(`/api/${type}/delete`, {item: itemID, user: user})
                .success(data => {
                  if (data.msg === 'success') {
                    $http.put('/api/expert/delete', {
                      item: item,
                      type: type,
                      path: path
                    }).success(data => {
                      if (data !== null && data !== undefined) {
                        if (data.result === 'success') {
                          $uibModalInstance.dismiss();
                          window.location.reload();
                        }
                      } else {
                        console.log('Del data === null && data === undefined');
                      }
                    }).catch(err => {
                      console.log('is not ok now', err);
                    });
                  }
                })
                .catch(err => {
                  console.log('error', data.msg);
                });
            };
          }
        ]
      }).result;
    };
  }])
  .service('copyName', ['$uibModal', function ($uibModal) {
    this.open = (modelName, modelType) => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: ['$rootScope', '$location', '$scope', '$filter', '$uibModalInstance', '$http', '$cookies',
          ($rootScope, $location, $scope, $filter, $uibModalInstance, $http, $cookies) => {
            $scope.title = $filter('translate')('web_common_copy_layer_01');
            $scope.content = $filter('translate')('web_common_copy_layer_01');

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.create = function () {
              if ($scope.model.name) {
                $http.get('/api/expert/copyExpertModel', {
                  params: {
                    modelName: modelName,
                    newModelName: $scope.model.name,
                    modelType: modelType,
                    newUserName: $cookies.get('username')
                  }
                }).then(function (res) {
                  console.log('save:expertPage', res);
                  $uibModalInstance.dismiss();
                  $location.path('/explore');
                });
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('copyFolder', ['$uibModal', function ($uibModal) {
    this.open = (item, modelType) => {
      let modelName = item.MODEL_NAME;
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/createModel.html',
        size: 'size',
        controller: ['$scope', '$filter', '$uibModalInstance', '$http', '$cookies',
          ($scope, $filter, $uibModalInstance, $http, $cookies) => {
            $scope.title = $filter('translate')('web_common_copy_layer_01');
            $scope.content = $filter('translate')('web_common_copy_layer_01');
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
            $scope.create = function () {
              if ($scope.model.name) {
                $http.get('/api/expert/copyExpertModel', {
                  params: {
                    modelName: modelName,
                    newModelName: $scope.model.name,
                    modelType: modelType,
                    newUserName: $cookies.get('username')
                  }
                }).then(function (res) {
                  console.log('save:dataExplore', res);
                  $uibModalInstance.dismiss();
                  window.location.reload();
                });
              }
            };
          }
        ]
      }).result;
    };
  }])
  .service('loginModel', ['$uibModal', function ($uibModal) {
    this.open = () => {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/layer/loginModel.html',
        size: 'size',
        controller: ['$rootScope', '$location', '$scope', '$filter', '$uibModalInstance', 'hotkeys', 'ipCookie', '$http', '$cookies',
          ($rootScope, $location, $scope, $filter, $uibModalInstance, hotkeys, ipCookie, $http, $cookies) => {
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
              if ($scope.usermessage.password !== undefined) {
                $rootScope.login($scope.usermessage.username, $scope.usermessage.password);
                //$uibModalInstance.dismiss();
              }
            };
            //登录接口
            $rootScope.login = (username, password) => {
              $http.post('/api/user/login/', {username, password}).success(function (user) {
                $rootScope.error_name = false;
                if (user.status) {
                  console.log('LOGIN SUCCESS!');
                  $cookies.put('username', username);
                  $uibModalInstance.dismiss();
                  $location.path('/home');
                  $rootScope.iflogin = true;
                  $rootScope.username = $cookies.get("username");
                } else {
                  $rootScope.error_name = true;
                  //console.log('LOGIN FAILED!please, use login name:ocai and pass:123456');
                }
              })
            }
            //enter 进入页面
            $scope.enterLogin = (e) => {
              if (e.keyCode == 13) {
                //$state.go('dataExplore');
                if ($scope.usermessage.password !== undefined) {
                  $rootScope.login($scope.usermessage.username, $scope.usermessage.password);
                  //$uibModalInstance.dismiss();
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
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        ]
      }).result;
    };
  }]);
