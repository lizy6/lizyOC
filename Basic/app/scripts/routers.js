/**
 * Created by JiYi on 17/7/5.
 */
'use strict';
angular.module('basic.routers', ['ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    let states = [
      {
        name: 'index',
        url: '/',
        templateUrl: 'views/homeIndex.html',
        controller: 'HomeCtrl'
      },
      {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      },
      {
        name: 'home',
        url: '/home',
        templateUrl: 'views/dataApp/dataApp.html',
        controller: 'DataAppCtrl'
      },
      {
        name: 'appInfo',
        url: '/app/{mode}/{name}',
        templateUrl: 'views/dataApp/appInfo.html',
        controller: 'AppInfoCtrl'
      },
      {
        name: 'notebookApp',
        url: '/app/notebook/{mode}/{name}',
        templateUrl: 'views/dataExplore/expertModule.html',
        controller: 'NotebookCtrl'
      },
      {
        name: 'dataApp',
        url: '/app/{appNm}/{type}/{mode}/{modelNm}',
        templateUrl: 'views/dataExplore/data.html',
        controller: 'DataCtrl'
      },
      {
        name: 'expertApp',
        url: '/app/expert/{mode}/{name}',
        templateUrl: 'views/dataExplore/expertPart.html',
        controller: 'ExpertCtrl'
      },
      {
        name: 'dataExplore',
        url: '/explore',
        templateUrl: 'views/dataExplore/dataExplore.html',
        controller: 'DataExploreCtrl'
      },
      {
        name: 'knowledgeMap',
        url: '/map',
        templateUrl: 'views/knowledgeMap/knowledgeMap.html',
        controller: 'KnowledgeMapCtrl'
      },
      {
        name: 'data',
        url: '/{appNm}/{type}/{mode}/{modelNm}',
        templateUrl: 'views/dataExplore/data.html',
        controller: 'DataCtrl'
      },
      {
        name: 'notebook',
        url: '/notebook/{mode}/{name}',
        templateUrl: 'views/dataExplore/expertModule.html',
        controller: 'NotebookCtrl'
      },
      {
        name: 'expert',
        url: '/expert/{mode}/{modelNm}',
        templateUrl: 'views/dataExplore/expertPart.html',
        controller: 'ExpertCtrl'
      },
      {
        name: 'console.taskSchedule',
        url: '/schedule',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      },
      {
        name: 'settings',
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      }
    ];
    // Loop over the state definitions and register them
    states.forEach(function (state) {
      $stateProvider.state(state);
    });
  });
