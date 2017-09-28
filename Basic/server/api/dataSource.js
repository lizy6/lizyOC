'use strict';
import { Session, ContentsManager} from '@jupyterlab/services';
import { XMLHttpRequest } from 'xmlhttprequest';
import { default as WebSocket } from 'ws';
import { readFile, writeFile, existsSync, readFileSync, mkdir, createReadStream, createWriteStream } from 'fs';
global.XMLHttpRequest = XMLHttpRequest;
global.WebSocket = WebSocket;
const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('./../config');
const env = config.env || 'dev';

const templatIpynbPath = path.join(__dirname, '../../template');
const templatIpynbFile = '/dataProfile-V4.0.ipynb';
const modelPath = config[env].modelPath;
const appPath = config[env].appPath;
let baseNotebookPath;
let baseNotebookDir;
let projectType;
let modelName;
let userName;
let type;
function notebookPath(type){
    if (type === 'explore'){
        return path.join(__dirname, '../../' + modelPath);
    } else {
        return path.join(__dirname, '../../' + appPath);
    }
}
function notebookDir(type){
    if (type === 'explore'){
        return modelPath;
    } else {
        return appPath;
    }
}
function notebookOpts(type){
    return {
        baseUrl: config[env].notebookUrl,
        token: config[env].token,
        kernelName: 'python',
        path: notebookPath('app'),
    };
}

let outputs = Array(10);
let source = Array(10);
let sourceCodes = [];
let mode;
let dataFileName;
let htmlFileName;
let modelInfo;
let mysession;
let kernel;

let multer = require('multer');
let storage = multer.diskStorage({
    destination:
    function destination(req, destination, cb) {
    cb(null, baseNotebookPath + '/' + projectType);
    },

    filename: function filename(req,file, cb) {
        cb(null, file.originalname);
        dataFileName = file.originalname;
    }
});

let upload = multer({ storage: storage });

function ensureExists(path, mask, cb) {
    if (typeof mask === 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = '0777';
    }
    mkdir(path, mask, function(err) {
        if (err) {
            (err.code === 'EEXIST')? cb(null):cb(err); // ignore the error if the folder already exists
        }else {
            cb(null);
        } // successfully created folder
    });
}
function init(){
    console.log("here")
    if (sourceCodes[0] !== undefined){
        let future = kernel.requestExecute({ code: sourceCodes[0]});
        future.onIOPub = msg => {
            if (msg.header.msg_type === 'error') {
                console.log(`ERROR:'${msg.content.evalue}
                             CODE: ${sourceCodes[0]}`);
                res.status(200).send({ msg: msg.content.evalue});
                
            }
        };
    }
}
function runNewSession(options){
    Session.listRunning(options).then(sessionModels => {
        let sessionNums = sessionModels.length;
        let existSession = false;
        for (let i = 0; i < sessionNums; i++) {
            let path = sessionModels[i].notebook.path;
            if (path === templatIpynbPath) {
                Session.connectTo(sessionModels[i].id, options).then(session => {
                    kernel = session.kernel;
                    mysession = session;
                    init();
                    console.log('connected to running Jupyter Notebook session');
                });
                existSession = true;
                break;
            }
        }
        if (!existSession) {
            Session.startNew(options).then(session => {
                kernel = session.kernel;
                mysession = session;
                init();
                console.log('New Jupyter Notebook session started');
            });
        }
    });
}
function readFilePromisified(filename) {
    return new Promise(
        function (resolve, reject) {
            readFile(filename, { encoding: 'utf8' },
                (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
        });
}
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

router.post('/init', function (req, res) {
    let fileName = req.body.fileName;
    modelName = req.body.projectName;
    userName = req.body.userName;
    type = req.body.projectType;
    mode = req.body.modelMode;
    console.log('HEy:');
    baseNotebookPath = notebookPath(type);
    baseNotebookDir = notebookDir(type);
    if (type === 'explore') {
        projectType = modelName;
    } else{
        projectType = type;
    }
    let options = notebookOpts(type);
    options.path = baseNotebookDir + '/' + modelName + '/' + modelName + '.ipynb';
    console.log('Jupyter Notebook options:', options);
    let contents = new ContentsManager(options);
    console.log(`fileName ${fileName}
                modelName ${modelName} 
                userName ${userName}
                projectType ${projectType}
                baseNotebookPath' ${baseNotebookPath}
                contents ${contents}`);
    if (mode === 'new'){
        ensureExists(baseNotebookPath + '/'+ projectType, '0744', err => {
            if (err) {
                res.status(200).send({ msg: err});
            } else {
                createReadStream(templatIpynbPath + templatIpynbFile)
                .pipe(createWriteStream(baseNotebookPath + '/'+ projectType + '/'+ modelName + '.ipynb'));
                contents.get( baseNotebookDir + '/' + projectType + '/'+ modelName + '.ipynb')
                .then(model =>{
                    for(let i = 0; i<model.content.cells.length; i++){
                        sourceCodes[i] =  model.content.cells[i].source;
                    }
                    runNewSession(options);
                    for(let i = 0; i<sourceCodes; i++){
                        if (sourceCodes[i] ==='' || sourceCodes[i] === undefined || sourceCodes[i] === null){ 
                            console.log('SourceCodes problem!Please, check template .ipynb file');
                            res.status(200).send({ msg: 'SourceCodes problem!Please, check template .ipynb file'});
                        }
                    }
                    res.status(200).send({ msg: 'success', outputs: outputs, sources:source });
                })
                .catch(err => {
                    console.log('Content problem!', err.xhr.responseText,  err);
                    res.status(200).send({ msg: err.xhr.responseText});
                });

            }
        });
    }
    if (mode === 'update' || mode === 'view'){   
        if (existsSync(baseNotebookPath  + '/' + projectType  + '/' + modelName + '.ipynb')) {
            readFilePromisified(baseNotebookPath  + '/'+ projectType + '/' + modelName + '.ipynb')
            .then(text => {
                let obj = JSON.parse(text);  //now it an object
                for (let i = 0, len = obj.cells.length; i < len; i++) {
                    let tmpOutputs = obj.cells[i].outputs;
                    if (tmpOutputs !== undefined && tmpOutputs !== null){
                        if (tmpOutputs.length !== 0) {
                            if (tmpOutputs[0].data !== undefined && tmpOutputs[0].data !== null ){
                                outputs[i] = tmpOutputs[0].data;
                            }
                        }
                    }
                    let tmpSource = obj.cells[i].source;
                    if (tmpSource !== undefined && tmpSource !== null){
                        if (tmpSource.length !== 0) {
                            if (tmpSource!== undefined && tmpSource!== null ){
                                source[i] = tmpSource;
                            }
                        }
                    }
                }
                res.status(200).send({ msg: 'success', outputs: outputs, sources:source});
            })
            .catch(err => {
                console.log('An unexpected error occurred in readFilePromisified', err);
                res.status(200).send({ msg: err.xhr.statusText});
            });
        } else {
            console.log('File ', baseNotebookPath + '/' + projectType + '/'+ modelName + '.ipynb', ' does not exist!');
            res.status(200).send({ msg: '/' + projectType + '/'+ modelName + '.ipynb does not exist!'});
        }
    }
});

router.post('/upload', upload.single('file'), function (req, res) {
    res.status(200).send({ fileName: req.file.originalname});
});

router.get('/report/:fn', function (req, res) {
    if (req.params.fn !== undefined && mode !== 'new') {
        dataFileName = req.params.fn;
    }
    if (existsSync(baseNotebookPath + '/'+ projectType + '/' + dataFileName.replace(/.csv/g, '_') + 'report.html')) {
        let html = readFileSync(baseNotebookPath + '/'+ projectType + '/' + dataFileName.replace(/.csv/g, '_') + 'report.html', 'utf8');
        res.status(200).send({data: html });
    } else {
        res.status(200).send({data: '<div>Report does not exist</div>' });
    }
});

router.post('/step1', function (req, res) {
    let dataFileName = req.body.fileName;
    let htmlFileName = req.body.htmlFileName;
    if (sourceCodes[1] !== undefined && sourceCodes[1] !== undefined ){
        let code = sourceCodes[1];
        code = code.replace(/filePath=/g, 'filePath=\'' +dataFileName+ '\'\n');
        code = code.replace(/htmlFilePath=/g, 'htmlFilePath=\''+htmlFileName+ '\'\n');
        source[1]=code;
        let future = kernel.requestExecute({ code: code});
        future.onIOPub = msg => {
            if (msg.header.msg_type === 'error') {
                console.log(`ERROR:'${msg.content.evalue}
                            CODE: ${code}`);
                res.status(200).send({ result: msg.content.evalue, msg:'error'});
            }
            if (msg.header.msg_type === 'execute_result') {
                outputs[1]=msg.content;
                res.send({ result: msg, msg:'success'});
            }
        };
    } else {
        res.status(200).send({ result: 'cell[0] in .ipynb cannot be NULL or undefined', msg:'error'});
    }
});
router.get('/step2', function (req, res) {
    let future = kernel.requestExecute({code: sourceCodes[2]});
    future.onIOPub = msg => {
        if (msg.header.msg_type === 'error') {
            console.log(`ERROR:'${msg.content.evalue}
                         CODE: ${sourceCodes[2]}`);
            res.status(200).send({ result: msg.content.evalue, msg:'error'});
        }
        if (msg.header.msg_type === 'execute_result') {
            outputs[2]=msg.content;
            return res.send({result: msg.content.data['text/plain'], msg:'success'});
        }
    };
});

router.post('/step3', function (req, res) {
    let deleteCols = req.body.deleteCols; //"deleteCols='petal length (cm)'";
    if (sourceCodes[3] !== undefined && sourceCodes[4] !== undefined ){
        let code = sourceCodes[3];
        code = code.replace(/deleteCols=/g, deleteCols);
        source[3]=code;
        let future = kernel.requestExecute({code: code});
        future.onIOPub = msg => {
            if (msg.header.msg_type === 'error') {
                console.log(`ERROR:'${msg.content.evalue}
                             CODE: ${code}`);
                res.status(200).send({ result: msg.content.evalue, msg:'error'});
            }
            if (msg.header.msg_type === 'execute_result') {
                outputs[3]=msg.content;
                // get p_missing
                let codeNR = sourceCodes[4];
                let futureNR = kernel.requestExecute({code: codeNR});
                futureNR.onIOPub = msg => {
                    if (msg.header.msg_type === 'error') {
                        console.log(`ERROR:'${msg.content.evalue}
                                     CODE: ${codeNR}`);
                        res.status(200).send({ result: msg.content.evalue, msg:'error'});
                    }
                    if (msg.header.msg_type === 'execute_result') {
                        outputs[4]=msg.content;
                        return res.send({result: msg.content.data['text/plain'], msg:'success'});
                    }
                };
            }
        };

    }
});

router.post('/step4', function (req, res) {
  let imputerCols = req.body.imputerCols;
  if (sourceCodes[5] !== undefined && sourceCodes[6] !== undefined){
    //imputer code
    let code = sourceCodes[5];
    code = code.replace(/col_input=/g, imputerCols);
    source[5]=code;
    let future = kernel.requestExecute({code: code});
    future.onIOPub = function (msg) {
        if (msg.header.msg_type === 'error') {
            console.log(`ERROR:'${msg.content.evalue}
                         CODE: ${code}`);
            res.status(200).send({ result: msg.content.evalue, msg:'error'});
        }
        if (msg.header.msg_type === 'execute_result') {
            outputs[5]=msg.content;
            //get std var
            let codeStd = sourceCodes[6];
            let futureStd = kernel.requestExecute({code: codeStd});
            futureStd.onIOPub = msg => {
                if (msg.header.msg_type === 'error') {
                    console.log(`ERROR:'${msg.content.evalue}
                                 CODE: ${codeStd}`);
                    res.status(200).send({ result: msg.content.evalue, msg:'error'});
                }
                if (msg.header.msg_type === 'execute_result') {
                    outputs[6]=msg.content;
                    return res.send({result: msg.content.data['text/plain'], msg:'success'});
                }
            };
        }
    };

  }
});

router.post('/step5', function (req, res) {
  let standardCols = req.body.standardCols;
  //standard code
  if (sourceCodes[7] !== undefined){
    let code = sourceCodes[7];
    code = code.replace(/col_input =/g, standardCols);
    source[7]=code;
    let future = kernel.requestExecute({code: code});
    future.onIOPub = msg => {
        if (msg.header.msg_type === 'error') {
            console.log(`ERROR:'${msg.content.evalue}
                         CODE: ${code}`);
            res.status(200).send({ result: msg.content.evalue, msg:'error'});
        }
        if (msg.header.msg_type === 'execute_result') {
            outputs[7]=msg.content;
            return res.send({result: msg, msg:'success'});
        }
    };
  }
});

router.get('/step6', function (req, res) {
    if (sourceCodes[9] !== undefined){
        let future = kernel.requestExecute({code: sourceCodes[9]});
        future.onIOPub = msg => {
            if (msg.header.msg_type === 'error') {
                console.log(`ERROR:'${msg.content.evalue}
                             CODE: ${sourceCodes[9]}`);
                res.status(200).send({ result: msg.content.evalue, msg:'error'});
            }
            if (msg.header.msg_type === 'execute_result') {
                modelInfo = msg.content.data['text/plain'];
                return res.send({result: 'success', msg:'success'});
            }
        };
    }
});

router.get('/save', function (req, res) {
    if (existsSync(baseNotebookPath + '/'+ projectType  + '/' + modelName + '.ipynb')) {
        readFilePromisified(baseNotebookPath + '/'+ projectType + '/' + modelName + '.ipynb')
        .then(text => {
            let obj = JSON.parse(text); 
            for (let i = 0, len = obj.cells.length; i < len; i++) {
                if (outputs[i] !== undefined && outputs[i] !== null){
                    outputs[i].output_type = 'execute_result';
                    obj.cells[i].outputs.push(outputs[i]);
                    obj.cells[i].execution_count = i+1;
                }
                if (source[i] !== undefined && source[i] !== null){
                    obj.cells[i].source = source[i];
                }
            }
            let json = JSON.stringify(obj); //convert it back to json
            writeFilePromisified(baseNotebookPath +'/' +  projectType + '/' + modelName + '.ipynb', json)
            .then(() => {
                // Kill the session.
                mysession.shutdown()
                .then(() => {
                    console.log('Jupyter Notebook session closed');
                    res.status(200).send({ modelInfo: modelInfo,
                                           dataFileName:dataFileName,
                                           projectType: projectType,
                                           modelType: '01',
                                           msg:'success'
                                        });
                })
                .catch(err => {
                    res.status(200).send({ msg:err.xhr.statusText});
                    console.log(err);
                });
            })
            .catch(err => {
                res.status(200).send({ msg:err.xhr.statusText});
                console.log(err);
            });
        })
        .catch(err => {
            res.status(200).send({ msg:err.xhr.statusText});
            console.log(err);
        });
    } else {
        let tmp = projectType + '/'+ modelName + '.ipynb does not exist!';
        res.status(200).send({ msg: tmp});
        console.log('File ', baseNotebookPath + '/'+ projectType + '/'+ modelName + '.ipynb', ' does not exist!') ;
    }
});

module.exports = router;
