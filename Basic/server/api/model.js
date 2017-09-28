'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();
let moment = require('moment');
const config = require('./../config');
let env = config.env || 'dev';

router.get('/getProjectList', function (req, res) {
  Model.findAll({raw: true})
    .then(model => {
      res.send({model});
    })
    .catch(err => {
      console.log('err', err);
    });
});

router.post('/:modelName', function (req, res) {
  let modelName = req.params.modelName;
  //let modelName = req.body.MODEL_NAME;
  let modelInfo = req.body.MODEL_INFO;
  let userName = req.body.USER_ID;
  let typeMenuID = req.body.TYPE_MENU_ID;
  let viewMenuID = req.body.VIEW_MENU_ID;
  let time = moment(req.body.UPDATED_TIME).format('YYYY-MM-DD');
  let filePath = req.body.FILE_PATH;
  let notebookPath = 'notebookPath'; //config[env][req.body.NOTEBOOK_PATH]; //req.body.NOTEBOOK_PATH;
  let comment = req.body.COMMENT;
  let appName = req.body.APP_ID;
  let kernel = req.body.KERNEL;
  sequelize.transaction(t => {
    return Model.create({
      MODEL_ID: t.id,
      MODEL_NAME: modelName,
      MODEL_INFO: modelInfo,
      USER_NAME: userName,
      TYPE_MENU_ID: typeMenuID,
      VIEW_MENU_ID: viewMenuID,
      UPDATED_TIME: time,
      FILE_PATH: filePath,
      NOTEBOOK_PATH: notebookPath,
      COMMENT: comment,
      APP_ID: appName,
      KERNEL: kernel,
      isNewRecord: true
    })
      .then(model => {
        res.send({result: 'success', model: model});
      })
      .catch(err => {
        res.send({result: err.name});
        console.log('err', err);
      });
  });
});

router.get('/:modelName', function (req, res) {
  let modelName = req.params.modelName;
  if (modelName !== null) {
    Model.findOne({
      where: {MODEL_NAME: modelName},
      raw: true
    })
      .then(model => {
        res.send({result: model, msg: 'success'});
      })
      .catch(err => {
        console.log('err', err);
        res.send({result: null, msg: err.name});
      });
  }
});

router.get('/modelList/:appName', function (req, res) {
  let appName = req.params.appName;
  if (appName !== null) {
    Model.findAll({
      where: {APP_ID: appName},
      raw: true
    })
      .then(modelList => {
        res.send({modelList: modelList});
      })
      .catch(err => {
        console.log('err', err);
        res.send({result: null, msg: err.name});
      });
  }
});

router.put('/delete', function (req, res) {
  let item = req.body.item;
  if (item !== null) {
    Model.destroy({
      where: {MODEL_ID: item}
    })
      .then(() => {
        res.send({msg: 'success'});
      })
      .catch(err => {
        console.log('err', err);
        res.send({msg: 'failed'});
      });
  }
});

module.exports = router;
