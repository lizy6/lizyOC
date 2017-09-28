/**
 * Created by niuniu on 2017/8/15.
 */
'use strict';
import {mkdir, readdir, createReadStream, createWriteStream} from 'fs';
import {copySync, moveSync} from 'fs-extra';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('./../config');
let env = config.env || 'dev';
let moment = require('moment');

let templatIpynbPath = path.join(__dirname, '../../template/notebookTemplates/');
let baseNotebookPath;
let baseNotebookUrl = config[env].notebookUrl;
let templatIpynbFile = 'new.ipynb';
const modelPath = config[env].modelPath;
const appPath = config[env].appPath;
let exec = require('child_process').exec;

//notebook
function notebookPath(type) {
  if (type === 'explore') {
    return path.join(__dirname, '../../' + modelPath);
  } else {
    return path.join(__dirname, '../../' + appPath);
  }
}
//notebook
function getNotebookPathByConfig(type) {
  return path.join(__dirname, '../../' + type);
}
function notebookDir(type) {
  if (type === 'explore') {
    return modelPath;
  } else {
    return appPath;
  }
}

function deleteall(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteall(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

router.get('/pathNoteBook', function (req, res) {
  let modelName = req.query.modelName;
  let type = req.query.modelType;
  let appName = req.query.appName;
  baseNotebookPath = notebookPath(type);

  if (type === 'explore') {
    let destPath = path.join(notebookPath(type), modelName);
    let templateDir = req.query.modelTemplate;
    templatIpynbFile = req.query.modelTemplate + '.ipynb';
    mkdir(destPath, function (error) {
      if (error) {
        console.error('exec error: ' + error);
        return;
      }
      let destUrl = baseNotebookUrl + 'notebooks/' + notebookDir(type) + '/' + modelName + '/' + modelName + '.ipynb';
      copySync(templatIpynbPath + templateDir, destPath);
      moveSync(destPath + '/notebook.ipynb', destPath + '/' + modelName + '.ipynb');
      res.send({jpyPath: destUrl, notebookPath: notebookDir(type)});
    });
  } else {
    let destUrl = baseNotebookUrl + 'notebooks/' + notebookDir(type) + '/' + appName + '/' + modelName + '.ipynb';
    createReadStream(templatIpynbPath + templatIpynbFile).pipe(createWriteStream(baseNotebookPath + '/' + appName + '/' + modelName + '.ipynb'));
    res.send({jpyPath: destUrl, notebookPath: notebookDir(type)});
  }
});

router.put('/delete', function (req, res) {
  let item = req.body.item;
  let type = req.body.type;
  let baseNotebookPath = path.join(__dirname, '../../' + req.body.path);
  deleteall(baseNotebookPath);
  res.send({result: 'success'});
});

router.get('/notebook/templateList', function (req, res) {
  readdir(templatIpynbPath, (error, files) => {
    if (error) {
      console.error('exec error: ' + error);
      return;
    }
    res.send({files: files});
  });

});
router.get('/notebook/open/:modelName/:projectType', function (req, res) {
  let userName = req.query.userName;
  let destUrl;
  let outputPath;
  let projectType = req.params.projectType;
  let modelName = req.params.modelName;

  Model.findOne({
    where: {MODEL_NAME: modelName},
    raw: true
  }).then((list) => {
    if (projectType === 'explore') {
      destUrl = baseNotebookUrl + 'notebooks/' + list.NOTEBOOK_PATH + '/' + modelName + '/' + modelName + '.ipynb';
      outputPath = path.join(getNotebookPathByConfig(list.NOTEBOOK_PATH), modelName);
    } else {
      destUrl = baseNotebookUrl + 'notebooks/' + list.NOTEBOOK_PATH + '/' + list.APP_ID + '/' + modelName + '.ipynb';
      outputPath = path.join(getNotebookPathByConfig(list.NOTEBOOK_PATH), list.APP_ID);
    }
    if (list.USER_NAME === userName) {
      res.send({
        jpyPath: destUrl,
        difUser: false
      });
    } else {
      if (projectType === 'explore') {
        let comms = 'cd ' + outputPath + ' && jupyter ' + 'nbconvert ./' + modelName + " --output=./" + modelName;
        outputPath = baseNotebookUrl + 'notebooks/' + list.NOTEBOOK_PATH + '/' + modelName + '/' + modelName + '.html';
        exec(comms, [''], function (error, stdout) {
          if (error) {
          } else {
            res.send({
              difUser: true,
              outputPath: outputPath
            });
          }
        });
      } else {
        let comms = 'cd ' + outputPath + ' && jupyter ' + 'nbconvert ./' + modelName + " --output=./" + modelName;
        outputPath = baseNotebookUrl + 'notebooks/' + list.NOTEBOOK_PATH + '/' + list.APP_ID + '/' + modelName + '.html';
        exec(comms, [''], function (error, stdout) {
          if (error) {
          } else {
            res.send({
              difUser: false,
              outputPath: outputPath
            });
          }
        });
      }
    }
  });
});
router.get('/copyExpertModel', function (req, res) {
  let modelName = req.query.modelName;
  let newModelName = req.query.newModelName;
  let modelType = req.query.modelType;
  let newUserName = req.query.newUserName;
  Model.findOne({
    where: {MODEL_NAME: modelName},
    raw: true
  }).then((list) => {
    let destUrl;
    let srcPath;
    let outputPath;
    if (modelType === 'explore') {
      destUrl = baseNotebookUrl + 'notebooks/' + list.NOTEBOOK_PATH + '/' + newModelName + '/' + newModelName + '.ipynb';
      srcPath = path.join(getNotebookPathByConfig(list.NOTEBOOK_PATH), modelName);
      outputPath = path.join(getNotebookPathByConfig(list.NOTEBOOK_PATH), newModelName);

      mkdir(outputPath, function (error) {
        if (error) {
          console.error('exec error: ' + error);
          return;
        }
        let time = moment(req.body.UPDATED_TIME).format('YYYY-MM-DD');
        sequelize.transaction(t => {
          return Model.create({
            MODEL_ID: t.id,
            MODEL_NAME: newModelName,
            MODEL_INFO: list.MODEL_INFO,
            USER_NAME: newUserName,
            TYPE_MENU_ID: list.TYPE_MENU_ID,
            VIEW_MENU_ID: list.VIEW_MENU_ID,
            UPDATED_TIME: time,
            FILE_PATH: newModelName + '.ipynb',
            NOTEBOOK_PATH: list.NOTEBOOK_PATH,
            COMMENT: list.COMMENT,
            APP_ID: list.APP_ID,
            isNewRecord: true
          })
            .then(() => {
              copySync(srcPath, outputPath);
              moveSync(outputPath + '/' + modelName + '.ipynb', outputPath + '/' + newModelName + '.ipynb');
              res.send({jpyPath: destUrl, notebookPath: list.NOTEBOOK_PATH});
              console.log('type===explore', destUrl);
            })
            .catch(err => {
              res.send({msg: err.name});
              console.log('err', err);
            });
        });
      });

    } else {
      console.log('...');
    }
  });
});

module.exports = router;
