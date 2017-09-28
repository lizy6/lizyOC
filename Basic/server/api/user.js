'use strict';
let sequelize = require('../sequelize');
let Sequelize = require('sequelize');
let User = require('../model/USER_INFO')(sequelize, Sequelize);
let express = require('express');
let router = express.Router();

router.post('/login', function(req, res){
  let username = req.body.username;
  let pass = req.body.password;
  // console.log('username',username); 
  // console.log('pass',pass); 
  if (username !== null && pass !== null ){
    User.findOne({
      attributes: ['USER_ID', 'USER_NAME', 'PASSWORD'],
      where: {
        USER_NAME: username
      },
      raw: true
    }).then(function(user){  
      //console.log('users',user); 
      if (user === null){
        res.send({status: false});
      }else{         
        if (user.PASSWORD === pass){
          res.send({status: true});
        }else{ 
          res.send({status: false});
        }      
      }
    }).catch(err =>{
      console.log('err',err);
    });
  }else{

  }
});

module.exports = router; 