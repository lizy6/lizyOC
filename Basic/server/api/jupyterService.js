'use strict';
import {Session, ContentsManager, Kernel} from '@jupyterlab/services';
import {readFile, writeFile, existsSync, readFileSync, mkdir, createReadStream, createWriteStream} from 'fs';
import {XMLHttpRequest} from 'xmlhttprequest';
import {default as WebSocket} from 'ws';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
global.XMLHttpRequest = XMLHttpRequest;
global.WebSocket = WebSocket;
const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('./../config');
const env = config.env || 'dev';
const {exec} = require('child_process');
const fs = require('fs');
const node_ssh = require('node-ssh');
const ssh = new node_ssh();
const sshJupyterHubOpts = {
  host: config[env].jupyterHubHost, //'10.20.51.5', //'10.1.236.84'
  // port: 22,
  username: config[env].jupyterHubUserName, //'root',
  //privateKey: '/Users/luodina/.ssh/id_rsa'
  password: config[env].jupyterHubPassword, //'Asiainfo123456' // 'Ocai@131415'
};

let type,
  userName,
  modelName,
  mode;
let userPath;
let sourceCodes = [];
let outputs = [];
let source = [];
const templDir = path.join(__dirname, '../../template/');

const templDataProfile = templDir + 'dataProfile-V4.0.ipynb';
const templExpertModelDir = templDir + 'notebookTemplates';
const templAppDir = templDir + 'data_apply_demo';
const templTemp = templDir + 'temp.ipynb';

let mysession;
let kernel;

let dataFileName;
let command;
let modelContent;
let token;
let jupyterOpts;
let kernellist;


router.get('/kernels', function (req, res) {
  let options = {
    baseUrl: "http://10.20.51.5:8000/user/admin",
    token: "57fb7f5be0b748f0be4ff2d2805f35b3"
  }
  Kernel.getSpecs(options).then(function (data) {
    let kk = data.kernelspecs;

    function getItemsArr(object) {
      let tmpArr = [];
      for (let item in object) {
        tmpArr.push(item);
      }
      return tmpArr;
    }

    function getItemsValue(object) {
      let array = [];
      let temp = getItemsArr(object);
      for (let i in temp) {
        array.push(kk[temp[i]].display_name);
      }
      return array;
    }

    kernellist = getItemsValue(kk);
    res.send({kernellist: kernellist})
  }).catch(function (err) {
    console.log("err", err.xhr.responseText)
  })
});
router.post('/initNotebook', function (req, res) {
  // console.log('req.body.modelName',req.body.modelName)
  if (!req.body.modelName) {
    res.send({result: null, msg: 'modelName can not null'});
    return
  }
  Model.findOne({
    where: {MODEL_NAME: req.body.modelName},
    raw: true
  }).then(function (model) {
    if (!model || !model.KERNEL) {
      res.send({result: null, msg: 'KERNEL can not null'});
      return
    }
    let modelId = "model_";
    let userName = "marta";
    let file = '/notebook.ipynb';
    let kernelName = model.KERNEL;
    ssh.connect(sshJupyterHubOpts).then(() => {
      command = 'docker exec -i auradeploy_hub_1 sh -c "jupyterhub token ' + userName + '"\nexit\n';
      //get token
      ssh.execCommand(command).then(result => {
        if (result.stdout !== '') {
          let kernelSpecs;
          token = result.stdout;
          console.log('token:', result.stdout);
          //res.status(200).send({ msg: 'success' });
          if (token !== '') {
            // Kernel.getSpecs({ baseUrl: config[env].notebookUrl + 'user/' + userName, token: token }).then(kernelSpecs => {
            //     kernelSpecs = kernelSpecs;
            //     console.log('Default spec:', kernelSpecs.default);
            //     console.log('Available specs', Object.keys(kernelSpecs.kernelspecs));
            // }).catch(function(err) {
            //     console.log('Kernel err', err);
            // });
            jupyterOpts = {
              baseUrl: config[env].notebookUrl + 'user/' + userName,
              token: token,
              kernelName: kernelName,
              path: modelId + file
            };
            // console.log('jupyterOpts', jupyterOpts);
            let contents = new ContentsManager(jupyterOpts);
            contents.get(modelId + file)
              .then(model => {
                modelContent = model.content;
                // console.log('model.content:', model.content);
                for (let i = 0; i < model.content.cells.length; i++) {
                  sourceCodes[i] = model.content.cells[i].source;
                }
                let obj = model.content;
                let cells = Array(obj.cells.length);
                for (let i = 0, len = obj.cells.length; i < len; i++) {
                  cells[i] = {};
                  cells[i].cell_type = obj.cells[i].cell_type;
                  cells[i].execution_count = obj.cells[i].execution_count;
                  cells[i].metadata = obj.cells[i].metadata;
                  if (obj.cells[i].source !== undefined && obj.cells[i].source !== null) {
                    if (obj.cells[i].source.length !== 0) {
                      cells[i].code = obj.cells[i].source;
                    }
                  }
                  if (obj.cells[i].outputs !== undefined && obj.cells[i].outputs !== null) {
                    cells[i].outputs = obj.cells[i].outputs;
                  }
                }
                //console.log("cells", cells)
                Session.listRunning(jupyterOpts).then(function (sessionModels) {
                  let sessionNums = sessionModels.length;
                  let existSession = false;
                  for (let _i = 0; _i < sessionNums; _i++) {
                    let _path = sessionModels[_i].notebook.path;
                    if (_path === modelName + '/' + modelName + '.ipynb') {
                      Session.connectTo(sessionModels[_i].id, jupyterOpts).then(function (session) {
                        kernel = session.kernel;
                        mysession = session;
                        console.log('connected to running Jupyter Notebook session');
                        res.status(200).send({cells: cells});
                      });
                      existSession = true;
                      break;
                    }
                  }
                  if (!existSession) {
                    Session.startNew(jupyterOpts).then(function (session) {
                      kernel = session.kernel;
                      mysession = session;
                      console.log('New Jupyter Notebook session started');
                      res.status(200).send({cells: cells});
                    }).catch(function (err) {
                      console.log(err, err);
                    });
                  }
                }).catch(function (err) {
                  console.log(err);
                });
                //-------------
              }).catch(function (err) {
              console.log(err);
            });
          }
        }
      })
    }).catch(function (err) {
      console.log(err);
    });

  }).catch(function (err) {
    console.log('err', err);
    res.send({result: null, msg: err.name});
  });
});

router.post('/run', function (req, res) {
  let sourceCodes = req.body.sourceCodes;

  let future = kernel.requestExecute({code: sourceCodes});
  console.log(`CODE:'${sourceCodes}
                future ${future }`);

  // future.onDone = () => {
  //     console.log('Future is fulfilled');
  // };
  future.onIOPub = msg => {
    // console.log(`msg`);

    //return res.send({ result: msg.content, msg: 'success' });
    // if (msg.header.msg_type === 'error') {
    //     console.log(`
    // ERROR: '${msg.content.evalue}
    // CODE: $ { sourceCodes[2] }
    // `);
    //     return res.status(200).send({ result: msg.content.evalue, msg: 'error' });
    // }
    if (msg.header.msg_type === 'execute_result') {
      //console.log(`msg.content: '${msg.content} ${ msg.header.msg_type } `)
      return res.send({type: 'execute_result', result: msg.content, msg: 'success'});
    }
    if (msg.header.msg_type === 'stream') {
      //console.log(`msg.content: '${msg.content}  ${ msg.header.msg_type }`)
      return res.send({type: 'stream', result: msg.content, msg: 'success'});
    }
    if (msg.header.msg_type === 'display_data') {
      //console.log(`msg.content: '${msg.content} ${ msg.header.msg_type } `)
      return res.send({type: 'display_data', result: msg.content, msg: 'success'});
    }
    if (msg.header.msg_type === 'error') {
      //console.log(`msg.content: '${msg.content}  ${ msg.header.msg_type }`)
      return res.send({
        type: 'error',
        result: msg.content,
        msg: 'success'
      });
    }
    //console.log(`msg.content: '${msg.content}`)

  };
});

router.post('/saveNotebook', function (req, res) {
  let modelId = "notebookTemplates/文本聚类分析";
  let userName = "marta";
  let file = '/new.ipynb';
  let path = "/var/lib/docker/volumes/jupyterhub-user-" + userName + "/_data/";
  let token;
  let jupyterOpts;
  // console.log(' req.body: ' + req.body);
  let newContent = req.body.newContent;
  // console.log('newContent: ' + newContent);
  let oldContent = modelContent;

  for (let i = 0, len = newContent.length; i < len; i++) {

    oldContent.cells[i].cell_type = newContent[i].cell_type;
    oldContent.cells[i].execution_count = newContent[i].execution_count;
    oldContent.cells[i].metadata = newContent[i].metadata;
    oldContent.cells[i].source = newContent[i].code ? newContent[i].code : [];
    if (newContent[i].outputs !== undefined && newContent[i].outputs !== null) {
      oldContent.cells[i].outputs = newContent[i].outputs;
    }
  }

  function writeFilePromisified(filename, text) {
    return new Promise(
      function (resolve, reject) {
        writeFile(filename, text, {encoding: 'utf8'},
          (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
      });
  }

  let json = JSON.stringify(oldContent); //convert it back to json
  // console.log('json: ' + json);
  writeFilePromisified(templTemp, json)
    .then(() => {
      ssh.connect(sshJupyterHubOpts).then(function () {
        let command = 'rm -rf ' + path + modelId + file;
        ssh.execCommand(command)
          .then(result => {
            console.log('STDOUT: ' + result.stdout);
            ssh.putFiles([{
              local: templTemp,
              remote: path + modelId + file
            }]).then(function () {
              res.status(200).send({result: "succeess"})
              console.log("The File thing is done");
            }, function (error) {
              res.status(200).send({result: "failed"})
              console.log("Something's wrong");
              console.log(error);
            });
          })
      });
    })

});



module.exports = router;
