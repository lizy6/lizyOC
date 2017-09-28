'use strict';
angular.module('basic')
  .controller('AppFileCtrl', ['deletePage', 'openNotebook', 'createAppModel', '$location', '$scope', 'projectList',
    (deletePage, openNotebook, createAppModel, $location, $scope, projectList) => {
      $scope.appName = $location.path().split(/[\s/]+/).pop();

      $scope.listAllProject = [];
      let handleSuccess = data => {
        let listAllProject = data.model;
        if (listAllProject !== null && listAllProject !== undefined) {
          listAllProject.forEach(model => {
            if (model.APP_ID !== null && model.APP_ID !== undefined) {
              if (model.TYPE_MENU_ID === '00' && model.APP_ID === $scope.appName) {
                let showName = model.MODEL_NAME;
                model.SHOW_NAME = model.MODEL_NAME;
                if (model.APP_ID == '医保控费') {
                  var x = showName.indexOf('-');
                  for (var i = 0; i < 1; i++) {
                    x = showName.indexOf('-', x + 1);
                  }
                  model.SHOW_NAME = showName.substring(x + 1, showName.length);
                } else {
                  model.SHOW_NAME = showName;
                }

                $scope.listAllProject.push(model);
              }
            }
          });
        }
      };

      projectList.get({}, res => {
        handleSuccess(res);
      });
      $scope.createModel = appName => {
        createAppModel.open(appName).then((model) => {
          console.log('model in AppFile: ', model.appName, model.type, model.modelName);
          if (model.type === 6) {
            $location.path('app/expert/new/' + model.modelName).search({
              type: 'app',
              appName: model.appName
            });
          }
          if (model.type !== 6) {
            $location.path('app/' + model.appName + '/0' + model.type + '/new/' + model.modelName);
          }
        });
      };
      $scope.delModel = item => {
        deletePage.open(item);
      };
      $scope.openProject = item => {
        $location.path('app/expert/view/' + item.MODEL_NAME).search({type: 'app', appName: item.APP_ID});
      };
      $scope.delete = () => {
        deletePage.open();
      }
    }])
  .directive('file', () => {
    return {
      templateUrl: 'views/dataApp/appModel/appFile.html'
    };
  });
