'use strict';
angular.module('basic')
    .controller('DataCtrl', ['Notification', '$location', '$rootScope', '$scope', '$http',
        (Notification, $location, $rootScope, $scope, $http) => {
            $scope.unableNext = false;
            $scope.unablePreview = false;
            $scope.tab = 0;
            let left_by_block = () => {
                let thisheight = $(window).height() - $('.header').height();
                $('.exploreModelLeft').height(thisheight);
            };
            $(window).resize(() => { left_by_block(); });
            $(() => { left_by_block(); });
            let right_by_block = () => {
                let thisheight = $(window).height() - $('.header').height() - 20;
                $('.exploreModelRight').height(thisheight);
            };
            $(window).resize(() => { right_by_block(); });
            $(() => { right_by_block(); });
            let projectType = $location.path().split(/[\s/]+/)[1];
            // let modelType = $location.path().split(/[\s/]+/)[2];
            let modelMode = $location.path().split(/[\s/]+/)[3];
            let modelName = $location.path().split(/[\s/]+/)[4];
            let userName = $rootScope.getUsername();
            let initNotebook = (fileName, notebookPath, projectName, userName, modelMode, projectType) => {
                return $http.post('/api/jupyter/init/', { fileName, notebookPath, projectName, userName, modelMode, projectType })
                    .success(data => {
                        if (data !== null && data !== undefined) {
                            if (data.msg !== 'success') {
                                Notification.error(data.msg);
                                console.log('data.msg', data.msg);
                            }
                        } else {
                            Notification.error('An unexpected error occurred in initNotebook() function');
                            console.log('err in initNotebook():');
                        }
                    })
                    .catch(err => {
                        Notification.error('An unexpected error occurred in initNotebook() function', err.xhr.statusText);
                        console.log('err in initNotebook():', err);
                    });
            };
            $scope.init = () => {
                $http.get('/api/model/' + modelName).success(data => {
                        $scope.modelDB = data.result;
                        if ($scope.modelDB !== null && $scope.modelDB !== undefined) {
                            if (modelMode === 'new') {
                                $location.path('/explore');
                            }
                            initNotebook($scope.modelDB.FILE_PATH, $scope.modelDB.NOTEBOOK_PATH, $scope.modelDB.MODEL_NAME, $scope.modelDB.USER_NAME, modelMode, projectType)
                                .then(data => {
                                    if ($scope.modelDB.USER_NAME === userName) {
                                        if (modelMode !== 'update') {
                                            //$location.path('/explore');
                                            Notification.error('Error! Please, Check mode!');
                                            console.log('Error! Please, Check mode!');
                                        }
                                        $scope.$broadcast('model', { notebook: data.data, model: $scope.modelDB, mode: 'update' });
                                    } else {
                                        if (modelMode !== 'view') {
                                            //$location.path('/explore');
                                            Notification.error('Error! Please, Check mode!');
                                            console.log('Error! Please, Check mode!');
                                        }
                                        $scope.$broadcast('model', { notebook: data.data, model: {}, mode: 'view' });
                                    }
                                })
                                .catch(err => {
                                    Notification.error('An unexpected error occurred in initNotebook() call', err.xhr.statusText);
                                    console.log('err in initNotebook():', err);
                                });
                        } else {
                            initNotebook(null, null, modelName, userName, modelMode, projectType);
                            $scope.$broadcast('model', { notebook: {}, model: {}, mode: 'new' });
                        }
                    })
                    .catch(err => {
                        Notification.error('An unexpected error occurred in init', err.xhr.statusText);
                        console.log('err in init:', err);
                    });
            };
            $scope.init();
            $scope.$on('unableNext', (event, data) => {
                $scope.unableNext = data;
            });
            $scope.$on('unablePreview', (event, data) => {
                $scope.unablePreview = data;
            });
            $scope.clicked = num => {
                $scope.tab = num;
                if (num === 2) {
                    document.getElementById('secondNext').style.background = '#fff';
                    document.getElementById('secondNext').style.color = '#4874ff';
                    document.getElementById('secondNext').style.border = 'solid 1px #4874ff';
                    $scope.tab = 2;
                    $scope.$broadcast('tab', num);
                }
                if (num === 1) {
                    document.getElementById('firstNext').style.background = '#fff';
                    document.getElementById('firstNext').style.color = '#4874ff';
                    document.getElementById('firstNext').style.border = 'solid 1px #4874ff';
                    $scope.tab = 1;
                    $scope.$broadcast('tab', num);
                }
                if (num === 0) {
                    $scope.tab = 0;
                    $scope.$broadcast('tab', num);
                }
            };
        }
    ]);