'use strict';
angular.module('basic')
  .controller('ExpertCtrl', ['copyName', '$cookies', '$sce', '$location', '$rootScope', '$scope', '$http',
    function (copyName, $cookies, $sce, $location, $rootScope, $scope, $http) {
      $scope.model = {};
      let modelName = $location.path().split(/[\s/]+/).pop();
      function isValidCodeModel(cell) {
        return cell.cell_type === 'code' && !!cell.code;
      }
      $scope.init = function () {
        $http.post('/api/jupyter/initNotebook', {
          modelName: modelName
        })
          .then(data => {
            console.log('----hghghhghh--->', data);
            if (data.data.cells) {
              let tmpArr = data.data.cells;
              tmpArr.forEach(function (cell) {
                if (cell.outputs) {
                  if (cell.outputs.data) {
                    if (cell.outputs.data['text/html'] !== null) {
                      cell.outputs.data['text/html'] = $sce.trustAsHtml(cell.outputs.data['text/html']);
                    }
                    if (cell.outputs.data['image/png'] !== null) {
                      cell.outputs.data['image/png'] = 'data:image/png;base64,' + cell.outputs.data['image/png'];
                    }
                  }
                }

              }, this);
              let runIndex = 0;
              $scope.model.sourceCells = tmpArr;
              $scope.codeStyle = ['code','markdown'];
              $scope.selectStyle = $scope.codeStyle[0];
              $scope.cmOption = {
                lineNumbers: false,
                indentWithTabs: true,
                lineWrapping: true,
                theme: 'default',
                mode: 'python',
                styleActiveLine: true,
                matchBrackets: true
              };
              $scope.handleGlobalClick = () => {
                console.log('handleGlobalClick')
                $scope.model.sourceCells.forEach((item, idx) => {
                  // console.log('forEach((item, idx)', item);
                  $scope.model.sourceCells[idx].isShow = false;
                  document.getElementsByClassName('content')[idx].style.background = '#fff';
                });
              };
              $scope.openToolTip = (index) => {
                runIndex = index;
                $scope.model.sourceCells.forEach((item, idx) => {
                  document.getElementsByClassName('content')[idx].style.background = '#fff';
                  item.isShow = false;
                });
                $scope.model.sourceCells[index].isShow = true;
                // $scope.model.sourceCells[index].execution_count = $scope.model.sourceCells[index].execution_count + 1;
                document.getElementsByClassName('content')[index].style.background = '#f3f3f3';
                console.log('openToolTip', $scope.model.sourceCells);
                if ($scope.isShow == true) {
                  $scope.model.sourceCells[index].isShow = true;
                  // $scope.model.sourceCells[index].execution_count = $scope.model.sourceCells[index].execution_count + 1;
                  document.getElementsByClassName('content')[index].style.background = '#f3f3f3';
                }
              };

              $scope.runCell = () => {
                if ($scope.model.sourceCells.length === 0) return;
                if (runIndex >= $scope.model.sourceCells.length) {
                  runIndex = 0;
                }
                if (!isValidCodeModel($scope.model.sourceCells[runIndex])) {
                  $scope.openToolTip(++runIndex);
                  return;
                }
                $http.post('/api/jupyter/run', {sourceCodes: $scope.model.sourceCells[runIndex].code})
                  .then(data => {
                    console.log('runIndexdatadatadata--->', data);
                    if (data) {
                      $scope.model.sourceCells[runIndex].isShowCode = true;
                      let tmp = data.data.result;
                      tmp.output_type = data.data.type;
                      $scope.model.sourceCells[runIndex].outputs = [tmp];
                      $scope.openToolTip(++runIndex);
                      console.log('runIndex--->', runIndex);

                    }
                  }).catch(err => {
                  console.log('dataerr', err);
                })
              };

              $scope.run = function (index) {
                if (!isValidCodeModel($scope.model.sourceCells[index])) {
                  return;
                }
                $scope.model.sourceCells[index].isShowCode = true;
                $scope.model.sourceCells[index].execution_count = $scope.model.sourceCells[index].execution_count + 1;
                //$scope.model.sourceCells[index].result = 1;
                // console.log($scope.model.sourceCells[index]);
                $http.post('/api/jupyter/run', {sourceCodes: $scope.model.sourceCells[index].code})
                  .then(data => {
                    console.log('-------->', data);
                    if (data !== null && data !== '') {
                      console.log("$scope.model.sourceCells[index].outputs",
                        $scope.model.sourceCells[index].outputs);
                      let tmp = data.data.result;
                      tmp.output_type = data.data.type;
                      $scope.model.sourceCells[index].outputs = [tmp];
                      //$scope.model.sourceCells[index].outputs.output_type = data.data.type;
                      // console.log("$scope.model.sourceCells[index].outputs", $scope.model.sourceCells[index].outputs);
                    }
                  })
              };
              $scope.runAll = function () {
                console.log("runAll");
                $scope.model.sourceCells.isShowCode = true;
                $scope.model.sourceCells.forEach(function (cell) {
                  if (!isValidCodeModel(cell)) return;

                  cell.isShowCode = true;
                  cell.execution_count = cell.execution_count + 1;
                  //$scope.model.sourceCells[index].result = 1;
                  // console.log('cell', cell);
                  $http.post('/api/jupyter/run', {sourceCodes: cell.code})
                    .then(data => {
                      if (data) {
                        // console.log("cell.outputs", cell.outputs);
                        let tmp = data.data.result;
                        tmp.output_type = data.data.type;
                        cell.outputs = [tmp];
                        //$scope.model.sourceCells[index].outputs.output_type = data.data.type;
                        // console.log("$scope.model.sourceCells[index].outputs", cell.outputs);
                      }
                    })
                });
              };
              $scope.upAdd = (index, item) => {
                $scope.model.sourceCells.splice(index, 0, {cell_type: 'code'});
              };
              $scope.downAdd = (index, item) => {
                $scope.model.sourceCells.splice(index + 1, 0, {cell_type: 'code'});
              };
              $scope.codeMirrorDelete = (index, item) => {
                $scope.model.sourceCells.splice(index, 1);
              };

              $scope.difUser = false;
              $scope.openProject = function () {
                copyName.open(modelName, modelType);
              }
            }
          })
          .catch(err => {
            console.log('err', err);
          })
      };
      $scope.init();
      $scope.saveAll = function () {
        $http.post('/api/jupyter/saveNotebook', {
          newContent: $scope.model.sourceCells
        })
          .then(data => {
            if (data) {
              console.log('data', data)
            }
          })
      }

    }
  ]);
