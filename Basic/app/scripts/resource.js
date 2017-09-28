'use strict';
angular.module('basic.resource', ['ngResource'])
  .factory('projectList', ['$resource', 'GLOBAL',function ($resource,GLOBAL) {
    let projectList = $resource(GLOBAL.host_model+'/getProjectList', {}, {
    });
    return projectList;
  }])
  .factory('appList', ['$resource', 'GLOBAL',function ($resource,GLOBAL) {
    let appList = $resource(GLOBAL.host_app+'/getAppList', {}, {
    });
    return appList;
  }])
  .factory('makefileList', ['$resource', 'GLOBAL',function ($resource,GLOBAL) {
    let makefileList = $resource(GLOBAL.host_makefile+'/getMakeFileList/:appName', {appName:'@appName'}, {
    });
    return makefileList;
  }])
  .factory('cdmSource', ['$resource', 'GLOBAL',function ($resource,GLOBAL) {
    let cdmSource = $resource(GLOBAL.host_cdm +'/datasets/queryDS/all', {}, {
    });
    return cdmSource;
  }])
  .factory('templateList', ['$resource', 'GLOBAL',function ($resource,GLOBAL) {
    let templateList = $resource(GLOBAL.host_expert +'/notebook/templateList', {}, {
    });
    return templateList;
  }])
  ;

