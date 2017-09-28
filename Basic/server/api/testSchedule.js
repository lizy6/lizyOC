'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let MakeSchedule = require('../model/APP_MAKESCHEDULE')(sequelize, Sequelize);
let AppResults = require('../model/APP_RESULTS')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();
let sd = require('silly-datetime');
let schedule = require('node-schedule');
const path = require('path');
const exec = require('child_process').exec;
const config = require('./../config');
const env = config.env || 'dev';
const appPath=config[env].appPath;

const dataAppPath=path.join(__dirname, '../../' + appPath);

// format schedule time JSON
function getTime(scheduleObj,callback){
  let time = {hour: scheduleObj.hour, minute: scheduleObj.minute};
  scheduleObj.DATE?time.date=scheduleObj.DATE:time;
  scheduleObj.DAYOFWEEK?time.dayOfWeek=scheduleObj.DAYOFWEEK:time;
  callback(time);
}
//get strTime for schedule time_folder , e.g 201707260830
function getStrTime(hour,minute,cb) {

  let nowDate = sd.format(new Date(), 'YYYYMMDD');
  minute.length<1?minute='00'+minute:minute.length<2?minute='0'+minute:minute;
  hour.length<1?hour='00'+hour:hour.length<2?hour='0'+hour:hour;
  let nowTime = nowDate+hour+minute;
  cb(nowTime);
}

// exec schedule shell
function scheduleExecFile(appName,target,scheduleName,dataAppPath,schedule_time,callback) {
  //const { execFile } = require('child_process');
  // const child=execFile('./scheduleShell.sh', [appName,target,appFolderPath], (error, stdout, stderr) => {
  //   if (error) {
  //     throw error;
  //     callback(error)
  //   }
  //   console.log(stdout);
  //   callback(stdout)
  // });

  //save to db app_results
  sequelize.transaction(t => {
    return AppResults.create({
      ID: t.id,
      SCHEDULE_NAME:scheduleName,
      APP_NAME:appName,
      EXECUTE_TIME:schedule_time,
      SCHEDULE_TARGET:target,
      isNewRecord:true
    }).then(() => {
      console.log('******success app_results create*******');
      callback('success');
    }).catch(err =>{
      console.log('err', err);
    });
  });

  //execute
  let appFolderPath=dataAppPath+'/'+appName;
  let errFile=appFolderPath+'/reports/'+scheduleName+'/'+schedule_time+'/error.out';
  //let comms = 'cd '+appFolderPath+' && make '+target+' schedule_name='+scheduleName+' schedule_time='+schedule_time;
  let comms = 'cd '+appFolderPath+' && mkdir -p reports/'+scheduleName+'/'+schedule_time +' && touch '+errFile+' && make '+target+' 2> '+errFile+' schedule_name='+scheduleName+' schedule_time='+schedule_time;
  //let comms = 'cd '+appFolderPath+' && make '+target+' 2> '+errFile+' schedule_name='+scheduleName+' schedule_time='+schedule_time;

  console.log('--------------comms=>',comms);
  exec(comms,[''],(error,stdout) =>{
    if(error){
      callback(error);
    }
    console.log('shell exec--------->',stdout);
    callback(stdout);
  });
}

// new scheduleJob
function newScheduleJob(scheduleName,time,command,appName){
    schedule.scheduleJob(scheduleName,time,function () {
      //check the db,if the schedule state == RUNNING
      MakeSchedule.findOne({
        where: { SCHEDULE_NAME: scheduleName},
        raw: true
      }).then(makeSchedule => {
        console.log('schedule -------------------',makeSchedule);
        getStrTime(makeSchedule.HOUR,makeSchedule.MINUTE,function (schedule_time) {
          if(makeSchedule.STATE && makeSchedule.STATE==='RUNNING'){
            console.log('makeSchedule Running ------------------->',command);
            scheduleExecFile(appName,command,scheduleName,dataAppPath,schedule_time,function (data) {
              console.log('schedule shell---->',data);

            });

          }

        });
      });
    });
}



// check the schedule db  if
function sentinel() {
  MakeSchedule.findAll({ raw: true })
    .then(makeSchedule => {
      //console.log("schedule list>>",makeSchedule);
      makeSchedule.forEach(function (scheduleObj) {
        //console.log("-------------->>>>",schedule.scheduledJobs[scheduleObj.SCHEDULE_NAME])
        if(scheduleObj.STATE==='RUNNING'&&!schedule.scheduledJobs[scheduleObj.SCHEDULE_NAME]){
          getTime(scheduleObj,function (time) {
            newScheduleJob(scheduleObj.SCHEDULE_NAME,time);
          });
        }
      });
    })
    .catch(err =>{console.log('err',err);});

}
setInterval(sentinel,10000);


// SELECT * from APP_MAKESCHEDULE;
router.get('/getMakeScheduleList', (req, res) => {
    MakeSchedule.findAll({ raw: true })
    .then(makeSchedule => { res.send({ makeSchedule });})
    .catch(err =>{console.log('err',err);});
});

// SELECT * from APP_MAKESCHEDULE where APP_ID = 1;
router.get('/getScheduleListById/:appID',(req, res) => {
  let app_id = req.params.appID;
  //console.log('app_id',app_id);
  if (app_id !== null){
    MakeSchedule.findAll({
        where: { APP_ID: app_id},
        raw: true
    })
    .then(makeSchedule => {
      //console.log('makeSchedule is:',makeSchedule);
      res.send({makeSchedule});
    })
    .catch(err =>{console.log('err',err);});
  }
});

router.get('/getScheduleListByName/:scheduleName',(req, res) => {
  let scheduleName = req.params.scheduleName;
  //console.log('scheduleName',scheduleName);
  if (scheduleName !== null){
    MakeSchedule.count({
      where: { SCHEDULE_NAME: scheduleName},
      raw: true
    })
      .then(makeSchedule => {
        //console.log('schedule count:',makeSchedule);
        res.send({count: makeSchedule});
      })
      .catch(err =>{console.log('err',err);});
  }
});



// create new makeSchedule
router.post('/createSchedule',(req, res) => {
    let appID = req.body.APP_ID;
    let scheduleName = req.body.SCHEDULE_NAME;
    let state = req.body.STATE;
    let command = req.body.COMMAND;
    let time =  eval(req.body.TIME);
    sequelize.transaction(t => {
        return MakeSchedule.create({
            ID: t.id,
            APP_ID: appID,
            SCHEDULE_NAME:scheduleName,
            STATE:state,
            COMMAND:command,
            SECOND: time.second,
            MINUTE: time.minute,
            HOUR: time.hour,
            DATE: time.date,
            MONTH: time.month,
            YEAR: time.year,
            DAYOFWEEK: time.dayOfWeek,
            isNewRecord:true
        }).then(() => {
          newScheduleJob(scheduleName,time,command,appID);
          // schedule.scheduleJob(scheduleName,time,function () {
          //   //check the db,if the schedule state == RUNNING
          //   MakeSchedule.findOne({
          //     where: { SCHEDULE_NAME: scheduleName},
          //     raw: true
          //   }).then(makeSchedule => {
          //     console.log("schedule -------------------",makeSchedule);
          //     if(makeSchedule.STATE && makeSchedule.STATE=="RUNNING"){
          //       console.log("makeSchedule Running -------------------");
          //     }
          //   })
          // });
          //console.log("schedule list===========>",schedule.scheduledJobs);
          res.send({ msg:'Success!!!!'});
        }).catch(err =>{
          console.log('err', err);
          res.send({err:err});
        });
    });
});

//edit schedule by schedule_name
router.post('/updateScheduleByName',(req, res) => {
  let appId=req.body.APP_ID;
  let scheduleName = req.body.SCHEDULE_NAME;
  let state = req.body.STATE;
  let command = req.body.COMMAND;
  let time =  eval(req.body.TIME);
  let param={
    COMMAND:command,
    SECOND:time.second,
    MINUTE:time.minute,
    HOUR:time.hour,
    DATE:time.date,
    MONTH: time.month,
    YEAR: time.year,
    DAYOFWEEK: time.dayOfWeek,
    STATE:state
  };
  sequelize.transaction(t => {
    return MakeSchedule.update(
      param,{
        where:{SCHEDULE_NAME:scheduleName}
      }
    ).then(() => {
      //kill the old schedule
      //console.log("schedule.scheduledJobs===>>>>",schedule.scheduledJobs[schedule.name])
      if(schedule.scheduledJobs&& schedule.scheduledJobs[scheduleName]){
        schedule.scheduledJobs[scheduleName].cancel();
        //console.log("schedule list afte delte=====edit",schedule.scheduledJobs);
      }
      newScheduleJob(scheduleName,time,command,appId);
      //create the new chedule with the same name
      // schedule.scheduleJob(scheduleName,time,function () {
      //   //check the db,if the schedule state == RUNNING
      //   MakeSchedule.findOne({
      //     where: { SCHEDULE_NAME: scheduleName},
      //     raw: true
      //   }).then(makeSchedule => {
      //     console.log("schedule -------------------",makeSchedule);
      //     if(makeSchedule.STATE && makeSchedule.STATE=="RUNNING"){
      //       console.log("makeSchedule Running ------------------->");
      //     }
      //   })
      // });
      //console.log("schedule list===========>",schedule.scheduledJobs);
      res.send({ msg:'Success!!!!'});
    }).catch(err =>{
      console.log('err', err);
      res.send({err:err});
    });
  });
});

//delete schedule by schedule_name
router.post('/deleteScheduleByName',(req,res) =>{
  let scheduleName = req.body.SCHEDULE_NAME;
  //delete schedule in db
  sequelize.transaction(t => {
    return MakeSchedule.destroy({
      where:{SCHEDULE_NAME:scheduleName}
    }).then(() => {
      //kill schedule
      if(schedule.scheduledJobs[scheduleName]){
        schedule.scheduledJobs[scheduleName].cancel();
        //console.log("schedule list afte delte=====",schedule.scheduledJobs);
      }
      res.send({ msg:'success'});
    }).catch(err =>{res.send({err:err});});

  });
});

//pause or continue Schedule by scheduleName
router.post('/updateStateByName',(req,res) =>{
  let state = req.body.STATE;
  let scheduleName = req.body.SCHEDULE_NAME;
  let param = {STATE:state};
  sequelize.transaction(t => {
    return MakeSchedule.update(
      param,{
        where:{SCHEDULE_NAME:scheduleName}
      }
    ).then(() => {res.send({ msg:'updateState Success!!!!' });})
      .catch(err =>{res.send({err:err});});
  });
});

module.exports = router;
