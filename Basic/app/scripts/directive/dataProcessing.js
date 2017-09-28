
'use strict';
angular.module('basic')
  .controller('DataProcessingCtrl',['$rootScope','$location','$scope','$http','$sce','Notification', '$timeout', '$filter','openPreview',
  ($rootScope,$location, $scope, $http, $sce, Notification, $timeout, $filter,openPreview) => {
  $scope.resultPreview = "Preview";
  $scope.person = {};
  $scope.isShowImputer = true;
  $scope.isShowScalar = true;
  $scope.isNew = false;
  $scope.$on('model',(el, dataModel) => {
    if(dataModel!== undefined && dataModel !== null) {
      $scope.model = dataModel.model;
      $scope.notebook = dataModel.notebook;
      $scope.mode = dataModel.mode;
      if ($scope.mode !== 'new'&& $scope.notebook.outputs){
        //1.get highCorr
        let highCorrRes = $scope.notebook.outputs[2];
        if(highCorrRes){
          let data =highCorrRes['text/plain'][0]==="'"?highCorrRes['text/plain']:highCorrRes['text/plain'][0];
          data = data.substring(1, data.length - 1);
          if(typeof(JSON.parse(data).highCorr)!=='undefined'){
            $scope.dataHighCorr = JSON.parse(data).highCorr;
          }
          //which one checked  "deleteCols="petal width (cm)"
          //var highCorrSource=$scope.notebook.sources[3][1];
          let highCorrSource=null;
          if(typeof($scope.notebook.sources[3])==='string'){
            let arr = $scope.notebook.sources[3].split('\n')
            highCorrSource = arr[1]
          }else{
            highCorrSource = $scope.notebook.sources[3][1];
          }
          let corrChecked =highCorrSource.substring(12,highCorrSource.length-2).split(',');
          if($scope.dataHighCorr){
            for(let i =0;i<$scope.dataHighCorr.length;i++){
              for(let j = 0;j<corrChecked.length;j++){
                if($scope.dataHighCorr[i].varName=corrChecked[j]){
                  $scope.dataHighCorr[i].varNameStatus=true;
                }
              }
            }
          }
        }
        //2.get imputer
        let imputerRes = $scope.notebook.outputs[4];
        if(imputerRes){
          let data = imputerRes['text/plain'][0]==="'"?imputerRes['text/plain']:imputerRes['text/plain'][0];
          data = data.substring(1, data.length - 1);
          if(typeof(JSON.parse(data).p_missing)!=='undefined'){
            data = JSON.parse(data).p_missing
            let jsonObj = [];
            for (let key in data) {
              let arr =
                {
                  "varName": key,
                  "imputerRatio": data[key],
                  "status": ""
                };
              jsonObj.push(arr);
            }
            $scope.dataImputer = jsonObj;
            //document.getElementById("divCorr").style.display = "none";
            document.getElementById('divImputer').style.display = 'block';
          }
          //imputer check   col_input={'petal length (cm)':'mean','sepal length (cm)':'median','sepal width (cm)':'min'}
          let imputerSource=null;
          if(typeof($scope.notebook.sources[5])==='string'){
            let arr = $scope.notebook.sources[5].split('\n');
            imputerSource = arr[4];
          }else{
            imputerSource = $scope.notebook.sources[5][4];
          }
          let imputerChecked =imputerSource.substring(10,imputerSource.length);
          let imputerJson = eval('('+imputerChecked+')');
          if($scope.dataImputer){
            for(let i =0;i<$scope.dataImputer.length;i++){
              let varName = $scope.dataImputer[i].varName;
              if(imputerJson[varName]){
                $scope.dataImputer[i].status=imputerJson[varName];
              }
            }
          }
        }
        //3.get dataScalar
        let scalaRes = $scope.notebook.outputs[6];
        if(scalaRes){
          let data = scalaRes['text/plain'][0]=="'"?scalaRes['text/plain']:scalaRes['text/plain'][0];
          data = data.substring(1, data.length - 1);
          data = JSON.parse(data);
          let jsonObj = [];
          for (let key in data.std) {
            let mini_histogram = data.mini_histogram[key];
            if(mini_histogram){
              mini_histogram = mini_histogram.replace(/[\\]/g, '');
            }
            let arr =
              {
                'varName': key,
                'stdValue': data.std[key],
                'miniHistogram': mini_histogram,
                'status': ''
              };
            jsonObj.push(arr);
          }
          $scope.dataScalar = jsonObj;
          document.getElementById('divScalar').style.display = 'block';
          let scalarSource=null;
          if(typeof($scope.notebook.sources[7])=='string'){
            let arr = $scope.notebook.sources[7].split('\n');
            scalarSource = arr[1];
          }else {
            scalarSource =$scope.notebook.sources[7][1];
          }
          let scalarChecked =scalarSource.substring(11,scalarSource.length);
          let scalarJson = eval('('+scalarChecked+')');
          if($scope.dataScalar){
            for(let i =0;i<$scope.dataScalar.length;i++){
              let varName = $scope.dataScalar[i].varName;
              if(scalarJson[varName]){
                $scope.dataScalar[i].status=scalarJson[varName]
              }
            }
          }
        }
      }
      $scope.$on('tab',(el, num) => {
        if (num === 2) {             
          $http.get('/api/jupyter/step2').success(data => {
            if(data!== undefined && data !== null) {
              if (data.msg==='success'){
                data = data.result.substring(1, data.result.length - 1);
                if(typeof(JSON.parse(data).highCorr)!=='undefined'){
                  $scope.dataHighCorr = JSON.parse(data).highCorr;
                }else{
                  $scope.getImputer();
                }
              }else{
                Notification.error(data.result);
                console.log('/api/jupyter/step4/:',data.result);
              }
            }else{
              Notification.error('An unexpected error occurred in /api/jupyter/step2');
              console.log('An unexpected error occurred in /api/jupyter/step2');
            }
          })
          .catch(err =>{
            Notification.error('An unexpected error occurred in /api/jupyter/step2', err);
            console.log('err in /api/jupyter/step2:',err);
          });              
        }
      });
    }
  });
  $scope.$on('model',(el, dataModel) => {
      $scope.model = dataModel;
  });
  $scope.getImputer = () => {
    let dataDel = "deleteCols=" + "\"" + "\"";
    $http.post('/api/jupyter/step3/', {deleteCols: dataDel}).success(data => {
      if(data!== undefined && data !== null) {
        if (data.msg==='success'){
          data = data.result.substring(1, data.result.length - 1);
          if(typeof(JSON.parse(data).p_missing)!=='undefined'){
            data = JSON.parse(data).p_missing;
            let jsonObj = [];
            for (let key in data) {
              let arr =
                {
                  "varName": key,
                  "imputerRatio": data[key],
                  "status": ""
                }
              jsonObj.push(arr)
            }
            $scope.dataImputer = jsonObj;
            document.getElementById('divCorr').style.display = 'none';
            document.getElementById('divImputer').style.display = 'block';
          }else {
            $scope.getStandard();
            document.getElementById('divCorr').style.display = 'none';
          }
        }else{
          Notification.error(data.result);
          console.log('/api/jupyter/step3/:',data.result);
        }
      }else{
          Notification.error('An unexpected error occurred in /api/jupyter/step3/');
          console.log('err in getImputer:');
      }
    })
    .catch(err =>{
      Notification.error('An unexpected error occurred in /api/jupyter/step3/', err);
      console.log('err in getImputer:',err);
    });
  };
  $scope.getStandard = () => {
    let dataImputer = 'col_input={}'
    $http.post('/api/jupyter/step4/', {imputerCols: dataImputer}).success(data => {
      if(data!== undefined && data !== null) {
        if (data.msg==='success'){
          data = data.result.substring(1, data.result.length - 1);
          data = JSON.parse(data)
          let jsonObj = [];
          for (let key in data.std) {
            let mini_histogram = data.mini_histogram[key];
            if(mini_histogram){
              mini_histogram = mini_histogram.replace(/[\\]/g, '');
            }
            var arr =
              {
                'varName': key,
                'stdValue': data.std[key],
                'miniHistogram': mini_histogram,
                'status': ''
              };
            jsonObj.push(arr);
          }
          $scope.dataScalar = jsonObj;
          document.getElementById('divScalar').style.display = 'block';
        }else{
          Notification.error(data.result);
          console.log('/api/jupyter/step4/:',data.result);
        }
      }else{
        Notification.error('An unexpected error occurred in /api/jupyter/step4/');
        console.log('err in getStandard:'); 
      }
    })
    .catch(err =>{
      Notification.error('An unexpected error occurred in /api/jupyter/step4/', err);
      console.log('err in getStandard:',err);
    });

  };
  $scope.preview = () => {
    if ($scope.resultPreview) {
      $http.get('/api/jupyter/step6').success(data => {
        if(data!== undefined && data !== null) {
          if (data.msg==='success'){
              openPreview.open($scope.resultPreview).then(data => {
                if (data.msg==='success'){
                  console.log('openPreview',data.msg);
                  Notification.success('Success!!!');
                } else {
                  Notification.error(data.msg);
                  console.log('error openPreview:',data.msg);  
                }
              });              
          } else {
              Notification.error(data.result);
              console.log('/api/jupyter/step6/:',data.result);  
          }
        } else {
          Notification.error('An unexpected error occurred in /api/jupyter/step6');
          console.log('err in /api/jupyter/step6:');
        }
      })
      .catch(err =>{
        Notification.error('An unexpected error occurred in Preview', err);
        console.log('err in preview:',err);
      });
    }
  };
  $scope.apply = (newDataDel, newDataImputer, newDataScalar) => {
      let dataDel = "", dataImputer = "", dataScalar = "";
      if (newDataDel) {
        newDataDel.forEach((el) => {
          if (el.varNameStatus === true) { // choose the features to delete
            if (dataDel !== "") {
              dataDel = dataDel + ',';
            }
            dataDel = dataDel + el.varName;
          }         
          if (el.corrVarNameStatus === true) {
            if (dataDel !== "") {
              dataDel = dataDel + ',';
            }
            dataDel = dataDel + el.corrVarName;
          }
        }, this);
        // if (dataDel === "") {
        //   dataDel = "''";
        // }
        dataDel = "deleteCols=" + "\"" + dataDel + "\"";
        $http.post('/api/jupyter/step3/', {deleteCols: dataDel}).success(data => {
          if(data!== undefined && data !== null) {
            if (data.msg==='success'){
              data = data.result.substring(1, data.result.length - 1);
              if(typeof(JSON.parse(data).p_missing)!=='undefined'){
                data = JSON.parse(data).p_missing
                let jsonObj = [];
                for (let key in data) {
                  let arr =
                    {
                      "varName": key,
                      "imputerRatio": data[key],
                      "status": ''
                    };
                  jsonObj.push(arr);
                }
                $scope.dataImputer = jsonObj;
                document.getElementById('divCorr').style.display = 'block';
                document.getElementById('divImputer').style.display = 'block';
              }else{
                $scope.getStandard();
              }
              //Notification.success('Success!!!');
            } else {
              Notification.error(data.result);
              console.log('/api/jupyter/step3/:',data.result); 
            } 
          } else {
            Notification.error('An unexpected error occurred in /api/jupyter/step3');
            console.log('err in /api/jupyter/step3:');
          }
        })
        .catch(err =>{
          Notification.error('An unexpected error occurred in Apply', err);
          console.log('err in apply:',err);
        });
        ;
      };
      if (newDataImputer) {
        newDataImputer.forEach(el => {
          if (el.status) {
            if (dataImputer !== '') {
              dataImputer = dataImputer + ',';
            }
            dataImputer = dataImputer + "'" + el.varName + "':'" + el.status + "'";
          }
        }, this);
        dataImputer = 'col_input={' + dataImputer + '}';       
        $http.post('/api/jupyter/step4/', {imputerCols: dataImputer})
        .success(data => {
          if(data!== undefined && data !== null) {
            if (data.msg==='success'){
              data = data.result.substring(1, data.result.length - 1);
              data = JSON.parse(data)
              let jsonObj = [];
              for (let key in data.std) {
                let mini_histogram = data.mini_histogram[key];

                if(mini_histogram){
                  mini_histogram = mini_histogram.replace(/[\\]/g, '');
                }
                let arr =
                  {
                    "varName": key,
                    "stdValue": data.std[key],
                    "miniHistogram": mini_histogram,
                    "status": ''
                  };
                jsonObj.push(arr);
              }
              $scope.dataScalar = jsonObj;
              document.getElementById('divScalar').style.display = 'block';
              //Notification.success('Success!!!');
            } else{
              Notification.error(data.result);
              console.log('/api/jupyter/step4/:',data.result);
            }
          }else{
            Notification.error('An unexpected error occurred in /api/jupyter/step4');
            console.log('err in /api/jupyter/step4:');
          }
        })
        .catch(err =>{
          Notification.error('An unexpected error occurred in /api/jupyter/step4', err);
          console.log('err in /api/jupyter/step4:',err);
        });
      }
      if (newDataScalar) {
        newDataScalar.forEach(function (el) {
          if (el.status) {
            if (dataScalar !== '') {
              dataScalar = dataScalar + ',';
            }
            dataScalar = dataScalar + "'" + el.varName + "':'" + el.status + "'";
          }
        }, this);
        dataScalar = 'col_input ={' + dataScalar + '}';
        $http.post('/api/jupyter/step5/', {standardCols: dataScalar})
        .success(data => {
          if(data!== undefined && data !== null) {
            if (data.msg==='success'){
              $scope.$emit('unablePreview', true);
              $scope.resultPreview = $sce.trustAsHtml(data.result.content.data['text/html']);
              //Notification.success('Success!!!');
            }else{
              Notification.error(data.result);
              console.log('err in /api/jupyter/step4:', data.result);
            }
          }else{
            Notification.error('An unexpected error occurred in /api/jupyter/step5');
            console.log('err in /api/jupyter/step4:');
          }
        })
        .catch(err =>{
          Notification.error('An unexpected error occurred in /api/jupyter/step5', err);
          console.log('err in /api/jupyter/step5:',err);
        });
      }
    };
  }])
  .directive('processing', () => {
    return {
      templateUrl: 'views/directive/dataProcessing.html'
    };
  });
