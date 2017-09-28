/**
 * Created by JiYi on 17/6/21.
 */
'use strict';
angular.module('basic')
  .controller('AppInfoCtrl',['$location', '$rootScope', '$scope','$http', '$filter','Upload', 'Notification', '$timeout','$window','openPreview',
    ( $location, $rootScope, $scope, $filter) => {
      $scope.tab=0;
      //左边导航自动变化
      let left_by_block = function(){
        let thisheight = $(window).height()-$(".header").height();
        $('.dataLeft').height(thisheight);
      };
      $(window).resize(function(){
        left_by_block();
      });
      $(function(){
        left_by_block();
      });
      //按钮展开收缩
      $(".zx_set_btn").on("click",function(){
        $(this).toggleClass("zx_set_btn_rotate");
        $(".dataLeft").toggleClass("sider_zx");
      });

      //图片预加载
      var images = new Array()
      function preload() {
        for (var i = 0; i < arguments.length; i++) {
          images[i] = new Image()
          images[i].src = arguments[i]
        }
      };

      preload(
        "images/logo.jpg",
        "images/zx_set.png",
        "images/zx_set_hover.png",
        "images/zx_set_active.png",
        "images/zx_set_active_hover.png",
        "images/yywj_nor.png",
        "images/yywj_active.png",
        "images/rwjh_nor.png",
        "images/rwjh_active.png",
        "images/yybp_nor.png",
        "images/yybp_active.png",
        "images/yyjg_nor.png",
        "images/yyjg_active.png",
        "images/yygl_nor.png",
        "images/yygl_active.png",
        "images/add_btn.png",
        "images/pic1.png",
        "images/pic2.png",
        "images/pic3.png",
        "images/pic4.png",
        "images/pic5.png",
        "images/pic6.png",
        "images/pic_cion.png",
        "images/delete.png"
      );

      $scope.clicked=function(num){
        $scope.tab = num;
        if(num===4){
          $scope.$broadcast('tab',num);
          $scope.tab = 4
        }if(num===3){
          $scope.$broadcast('tab',num);
          $scope.tab = 3
        }if(num===2){
          $scope.$broadcast('tab',num);
          $scope.tab = 2
        }
        if(num===1){
          $scope.tab = 1;
          $scope.$broadcast('tab',num);
        }
        if(num===0){
          $scope.tab = 0;
          $scope.$broadcast('tab',num);
        }
      }
    }]);
