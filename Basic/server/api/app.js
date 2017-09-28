'use strict';
const sequelize = require('../sequelize');
const Sequelize = require('sequelize');
const App = require('../model/APP_INFO')(sequelize, Sequelize);
const Model = require('../model/MODEL_INFO')(sequelize, Sequelize);
const MakeFile = require('../model/APP_MAKEFILE')(sequelize, Sequelize);
const AppSchedule = require('../model/APP_MAKESCHEDULE')(sequelize, Sequelize);
const AppResults = require('../model/APP_RESULTS')(sequelize, Sequelize);

const express = require('express');
const router = express.Router();
const config = require('./../config');
let env = config.env || 'dev';

router.get('/getAppList', (req, res) => {
    App.findAll({ raw: true })
        .then(app => { res.send({ app }); })
        .catch(err => { console.log('err', err); });
});

router.get('/:appName', function(req, res) {
    let appName = req.params.appName;
    if (appName !== null) {
        App.findOne({
                where: { APP_NAME: appName },
                raw: true
            })
            .then(app => {
                res.send({ result: app });
            })
            .catch(err => { console.log('err', err); });
    }
});

router.post('/:appName', function(req, res) {
    let appName = req.body.APP_NAME;
    let userName = req.body.USER_NAME;
    sequelize.transaction(t => {
        return App.create({
                APP_ID: t.id,
                APP_NAME: appName,
                USER_NAME: userName,
                NOTEBOOK_PATH: "/", //config[env].appPath,
                isNewRecord: true
            })
            .then(app => {
                res.send({
                    result: 'success',
                    app: app
                });
            })
            .catch(err => { console.log('err', err); });
    });
});

router.put('/delete', function(req, res) {
    Model.belongsTo(App);
    MakeFile.belongsTo(App);
    AppSchedule.belongsTo(App);
    AppResults.belongsTo(App);
    let item = req.body.item;
    let user = req.body.user;
    if (item !== null) {
        let q = "DELETE FROM APP_INFO WHERE APP_INFO.APP_NAME = '" + item + "' AND APP_INFO.USER_NAME = '" + user + "'";
        sequelize.query(q, { type: sequelize.QueryTypes.DELETE })
            .then((result) => {
                console.log('result', result);
                res.send({ result: result, msg: 'success' });
            })
            .catch(err => {
                console.log('err', err);
                res.send({ msg: 'failed' });
            });
    }
});
module.exports = router;