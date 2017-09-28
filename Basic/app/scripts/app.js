'use strict';
angular
    .module('basic', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'pascalprecht.translate',
        'ngFileUpload',
        'isteven-multi-select',
        'dndLists',
        'ui.bootstrap',
        'ui-notification',
        'angularSpinner',
        'ngCookies',
        'ui.select',
        'toggle-switch',
        'cfp.hotkeys',
        'ui.bootstrap.datetimepicker',
        'angularMoment',
        'chart.js',
        'ui.router',
        'basic.routers',
        'basic.resource',
        'basic.services',
        'ui.router.state.events',
        'angularFileUpload',
        'hc.marked',
        'ipCookie',
        'ui.codemirror'
    ])
    .constant('GLOBAL', {
        host_cdm: '',
        host_jupyter: './api/dataSource',
        host_user: './api/user',
        host_model: './api/model',
        host_app: './api/app',
        host_expert: './api/expert',
        host_makefile: './api/appMakeFile',
    })
    .config(['$translateProvider', '$windowProvider', function($translateProvider, $windowProvider) {
        let window = $windowProvider.$get();
        let lang = window.navigator.userLanguage || window.navigator.language;
        console.log('lang', lang);
        if (lang) {
            lang = lang.substr(0, 2);
            $translateProvider.preferredLanguage(lang);
        }
    }])
    .config(['NotificationProvider', 'usSpinnerConfigProvider', 'ChartJsProvider', function(NotificationProvider, usSpinnerConfigProvider, ChartJsProvider) {
        NotificationProvider.setOptions({
            delay: 10000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'bottom'
        });
        usSpinnerConfigProvider.setDefaults({ color: 'orange', radius: 0 });

        ChartJsProvider.setOptions({
            chartColors: ['#4da9ff', '#79d2a6', '#ff9900', '#ff704d', '#669999', '#4d0000']
        });
    }])
    .run(['$rootScope', '$location', '$http', '$cookies', function($rootScope, $location, $http, $cookies) {
        $rootScope.nowActive = 0;
        $rootScope.findWay = function() {
            $location.path('/explore');
        }
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            console.log('toState', toState.name);
            $rootScope.active = toState.name;
            $rootScope.username = $cookies.get('username');
        });

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState && toState.name === 'login' || toState && toState.name === 'index') {
                $('#pageTitle').css('display', 'none');
            } else {
                $('#pageTitle').css('display', 'block');
            }
            if (toState && toState.name === 'dataExplore' || toState && toState.name === 'home' || toState && toState.name === 'knowledgeMap' || toState && toState.name ==='settings') {
                $rootScope.isshow = true;
            } else {
                if (toState && toState.name === 'appInfo' || toState && toState.name === 'dataApp' || toState && toState.name === 'expertApp') {
                    $rootScope.appInfoShow = true;
                } else {
                    $rootScope.appInfoShow = false;
                }
                if (toState && toState.name === 'expert' || toState && toState.name === 'data' || toState && toState.name === 'expert') {
                    $rootScope.expertShow = true;
                } else {
                    $rootScope.expertShow = false;
                }
                $rootScope.isshow = false;
            }
        });

        //退出
        $rootScope.logout = () => {
            $location.path('/');
        };
        $rootScope.getUsername = () => {
            return $cookies.get('username');
        };
    }]);
