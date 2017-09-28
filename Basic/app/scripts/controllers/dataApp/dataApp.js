'use strict';
angular.module('basic')
    .controller('DataAppCtrl', ['createApp', '$rootScope', '$scope', '$filter', 'appList', 'deletePage',
        (createApp, $rootScope, $scope, $filter, appList, deletePage) => {
            $scope.projectType = ['web_common_data_app_02', 'web_common_data_app_03', 'web_common_data_app_04'];
            $scope.listAllApp = [
                []
            ];
            let handleSuccess = function(data, status) {
                let listAllApp = data.app;
                if (listAllApp) {
                    listAllApp.forEach(function(app) {
                        if (app.USER_NAME) {
                            app.mode = 'view';
                            if (app.USER_NAME === $rootScope.getUsername()) {
                                app.mode = 'update';
                                $scope.listAllApp[0].push(app);
                            };
                            if ($scope.listAllApp[1] === undefined) {
                                $scope.listAllApp[1] = [];
                            }
                            $scope.listAllApp[1].push(app);
                        }
                    }, this);
                }
            };
            $scope.delete = item => {
                deletePage.open(item);
            };
            $scope.copy = item => {
                console.log('item', item);
                createApp.open(item.APP_NAME).then((res) => {
                    if (res === 'success') {
                        appList.get({}, res => { handleSuccess(res); });
                    }
                });
            };

            $scope.unfoldPath = (name, nameSecond) => {
                $rootScope.modelAppName = nameSecond.APP_NAME;
            };

            appList.get({}, function(res) {
                console.log('appList', res);
                handleSuccess(res);
            });

            $scope.newApp = function() {
                createApp.open();
            };
        }
    ]);