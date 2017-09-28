'use strict';
angular.module('basic')
    .controller('DataSourceCtrl', ['cdmSource', '$rootScope', '$sce', '$filter', '$scope', '$http', 'Upload', 'Notification', '$timeout', 'FileUploader',
        (cdmSource, $rootScope, $sce, $filter, $scope, $http, Upload, Notification, $timeout, FileUploader) => {
            $scope.name = $filter('translate')('web_common_data_explore_001');
            $scope.bigData = false;
            $scope.bigData = 2;
            $scope.unablePreview = false;
            let uploader = $rootScope.uploader = new FileUploader({
                url: 'upload.php',
                queueLimit: 1,
                removeAfterUpload: true
            });
            $rootScope.clearItems = () => {
                uploader.clearQueue();
            };
            $scope.$on('model', (el, dataModel) => {
                $scope.model = dataModel.model;
                $scope.notebook = dataModel.notebook;
                $scope.mode = dataModel.mode;
                if ($scope.mode !== 'new') {
                    $scope.result = $scope.notebook.outputs ? $scope.notebook.outputs[1]['text/html'] : 'Result...';
                }
            });

            function getFileExtension(filename) {
                return filename
                    .split('.') // Split the string on every period
                    .slice(-1)[0]; // Get the last item from the split
            }

            function getFileName(filename) {
                return filename.replace('.' + getFileExtension(filename), ''); // Get the first item from the split
            }
            $scope.upload = () => {
                if ($scope.file) {
                    console.log($scope.file);
                    document.getElementById('fileUpload').style.background = '#f4f4f4';
                    document.getElementById('fileUpload').style.color = '#999';
                    document.getElementById('fileUpload').style.border = 'solid 1px #999';
                    if (getFileExtension($scope.file.name) === 'csv') {
                        $scope.uploadFile($scope.file);
                    } else {
                        Notification.error($filter('translate')('Choose csv file!'));
                    }
                }
            };
            $scope.uploadFile = file => {
                Upload.upload({ url: '/api/jupyter/upload', data: { file: file } })
                    .then(data => {
                        $scope.unablePreview = true;
                        $timeout(() => {
                            $scope.fileName = data.data.fileName;
                            $scope.htmlFileName = getFileName(data.data.fileName) + '_report.html';
                            Notification.success($filter('translate')('web_common_explore_013'));
                        }, 1000);
                    }, err => {
                        Notification.success($filter('translate')(err.data));
                    });
            };
            $scope.run = () => {
                document.getElementById('sourcePreview').style.color = '#4874ff';
                document.getElementById('sourcePreview').style.border = 'solid 1px #4874ff';
                if ($scope.file !== undefined && $scope.file !== '') {
                    $scope.runFile($scope.fileName, $scope.htmlFileName);
                }
            };
            $scope.runFile = (fileName, htmlFileName) => {
                $http.post('/api/jupyter/step1/', { fileName, htmlFileName })
                    .success(data => {
                        if (data !== undefined && data !== null) {
                            if (data.msg === 'success') {
                                $scope.$emit('unableNext', true);
                                $scope.result = $sce.trustAsHtml(data.result.content.data['text/html']);
                            } else {
                                Notification.error(data.result);
                                console.log('/api/jupyter/step1/:', data.result);
                            }
                        } else {
                            Notification.error('An unexpected error occurred in /api/jupyter/step1/');
                        }
                    })
                    .catch(err => {
                        Notification.error('An unexpected error occurred in runFile', err);
                        console.log('err in init:', err);
                    });
            };
            $scope.save = () => {
                $http.get('/api/jupyter/save/')
                    .success(data => {
                        console.log('data.msg', data.msg);
                    })
                    .catch(err => {
                        Notification.error('An unexpected error occurred in init', err);
                        console.log('err in init:', err);
                    });
            };
            cdmSource.query({}, data => {
                if (data !== undefined && data !== null) {
                    $scope.cmdDataset = data;
                } else {
                    Notification.error('An unexpected error occurred in CDM Source');
                }
            });
        }
    ])
    .directive('source', () => {
        return {
            templateUrl: 'views/directive/dataSource.html'
        };
    });