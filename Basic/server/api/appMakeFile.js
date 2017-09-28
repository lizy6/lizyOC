'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let MakeFile = require('../model/APP_MAKEFILE')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();
const path = require('path');
const config = require('./../config');
const env = config.env || 'dev';
const appPath = config[env].appPath;
import {writeFile} from 'fs';
function writeFilePromisified(filename,text) {
    return new Promise(
        function (resolve, reject) {
            writeFile(filename, text, { encoding: 'utf8' },
                (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
        });
}
router.get('/getMakeFileList/:appID', (req, res) => {   
  let appID = req.params.appID;
  if (appID !== null){
    MakeFile.findAll({
        where: { APP_ID: appID},
        order: [['MAKEFILE_ID']],//'MAKEFILE_ID DESC',
        raw: true
    })
    .then(appMakeFileList => {   
      res.send({appMakeFileList: appMakeFileList});
    })
    .catch(err =>{console.log('err',err);});
  }
});

// create new makeFileID
router.post('/new', (req, res) => {
    let makeFile = req.body.MAKEFILE_ID;
    let userName = req.body.USER_NAME;
    let appID = req.body.APP_ID;
    let target = req.body.TARGET;
    let prerequisites = req.body.PREREQUISITES;
    let flag = req.body.FLAG;
    sequelize.transaction(t => {
        return MakeFile.create({
            ID: t.id, 
            MAKEFILE_ID: makeFile, 
            USER_NAME: userName,
            APP_ID: appID, 
            TARGET: target,
            PREREQUISITES: prerequisites,
            FLAG: flag,
            isNewRecord:true})
            .then(() => {res.send({ msg:'success' });})
            .catch(err =>{console.log('err', err);});
    }); 
});
router.post('/create/makeFile', (req, res) => {
  let appName = req.body.appName;
  let content = req.body.content;
  let makeFilePath = path.join(__dirname, '../../' + appPath, appName ,'/Makefile.user_rules');
  if (makeFilePath !== ''){
    writeFilePromisified(makeFilePath, content)
    .then(() => {
      res.send({ result:'success'});
    })
    .catch(err =>{
      res.send({ result:'failed'})
      console.log('err', err);
    });
  }

});


module.exports = router;