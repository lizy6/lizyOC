'use strict';
let express = require('express');
let router = express.Router();
let path = require('path');
const fs = require('fs-extra');
const config = require('./../config');
const env = config.env || 'dev';
const basePath = config[env].appPath;

const templDir = path.join(__dirname, '../../template/');
const templDataProfile = templDir + 'dataProfile-V4.0.ipynb';
const templExpertModelDir = templDir + 'notebookTemplates';
const templAppDir = templDir + 'data_apply_demo';
const { exec } = require('child_process');
const node_ssh = require('node-ssh');
const ssh = new node_ssh();
let remotePath;
const sshJupyterHubOpts = {
    host: config[env].jupyterHubHost, //'10.20.51.5', //'10.1.236.84'
    // port: 22,
    username: config[env].jupyterHubUserName, //'root',
    //privateKey: '/Users/luodina/.ssh/id_rsa'
    password: config[env].jupyterHubPassword, //'Asiainfo123456' // 'Ocai@131415' 
};

router.post('/:itemName', function(req, res) {
    let itemType = req.body.itemType; //app or model
    let itemID = "model_"; //itemType === "app" ? itemType + "_" + req.body.itemID : "model_" + req.body.itemID;
    let itemName = req.params.itemName;
    let userName = req.body.userName;
    let modelTemplate = req.body.modelTemplate;
    let userPath = "jupyterhub-user-" + userName;

    let localPath = itemType => {
        if (itemType === "app") { return templAppDir }
        if (itemType === "model") { return templDataProfile }
        if (itemType === "expert") { return templExpertModelDir + "/" + modelTemplate }
    }
    console.log(`localPath`, localPath(itemType),
        `itemID`, itemID,
        `itemType`, itemType,
        `itemName`, itemName,
        `userPath`, userPath,
        `itemType`, itemType);
    ssh.connect(sshJupyterHubOpts)
        .then(() => {
            let command = "docker volume inspect " + userPath;
            ssh.execCommand(command)
                .then(result => {
                    console.log('STDOUT: ' + result.stdout);
                    //console.log('STDERR: ' + result.stderr, result.stderr != null)
                    if (result.stdout !== '' && result.stdout !== null) {
                        remotePath = JSON.parse(result.stdout)[0]['Mountpoint'];
                        if (remotePath !== "" && remotePath !== null) {
                            if (itemType === "app" || itemType === "expert") { //" root@10.20.51.5:" = " " + sshJupyterHubOpts.username +"@" + sshJupyterHubOpts.host
                                command = "scp -r " + localPath(itemType) + " " + sshJupyterHubOpts.username + "@" + sshJupyterHubOpts.host + ":" + remotePath + "/" + itemID;
                                exec(command, (error, stdout, stderr) => {
                                    if (error) {
                                        console.error(`exec error: $ { error }`);
                                        res.status(200).send({ result: 'failed' });
                                        return;
                                    }
                                    // console.log(`stdout: $ { stdout }`);
                                    // console.log(`stderr: $ { stderr }`);
                                    res.status(200).send({ result: 'success' });
                                });
                            }
                            if (itemType === "model") {
                                console.log(`localPath `, localPath(itemType), remotePath + "/" + itemID + "/" + itemName + ".ipynb");
                                ssh.putFiles([{ local: localPath(itemType), remote: remotePath + "/" + itemID + "/" + itemName + ".ipynb" }]).then(function() {
                                    console.log("The File thing is done");
                                    res.status(200).send({ result: 'success' });
                                }, function(error) {
                                    console.log("Something's wrong")
                                    res.status(200).send({ result: 'failed' });
                                })
                            }

                        } else {
                            console.log('remotePath', remotePath);
                            res.status(200).send({ result: 'failed' });
                        }

                    } else {
                        console.log('wtf');
                        res.status(200).send({ result: 'failed' });
                    }
                })
                .catch(err => { console.log('err', err) });
        })



    // const failed = [];
    // const successful = [];
    // ssh.putDirectory(templAppDir, remoteAppPath, {
    //         recursive: true,
    //         validate: function(itemPath) {
    //             const baseName = path.basename(itemPath)
    //             return baseName.substr(0, 1) !== '.' && // do not allow dot files 
    //                 baseName !== 'node_modules' // do not allow node_modules 
    //         },
    //         tick: function(localPath, remotePath, error) {
    //             if (error) {
    //                 failed.push(localPath)
    //             } else {
    //                 successful.push(localPath)
    //             }
    //         }
    //     })
    //     .then(function(status) {
    //             console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
    //             console.log('failed transfers', failed.join(', '), failed.length)
    //             console.log('successful transfers', successful.join(', '), successful.length)
    //             ssh.dispose();
    //             res.status(200).send({ result: 'success' });
    //         },
    //         function(error) {
    //             console.log("Something's wrong")
    //             console.log(error)
    //         })


    .catch(function(err) {
        console.log(err);
        console.error(err);
        res.status(500).send({ result: 'failed!' });
    });
});


router.get('/:appName/overview', function(req, res) {
    let appName = req.params.appName;
    let filePath = path.join(basePath, appName, 'README.md');
    let contentType = 'text/html';

    // TODO combine logic from app results .
    fs.readFile(filePath, 'utf-8', function(error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': contentType });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                res.end();
            }
        } else {
            res.writeHead(200);
            res.end(content, 'utf8');
        }
    });
});

module.exports = router;