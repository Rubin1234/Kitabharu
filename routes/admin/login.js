var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
//package

var jwt = require('jsonwebtoken');


//checking node-localstorage
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
 
//Models
var userModel = require('../../modules/admin');



//Check if there is user session

checkLogin = function(req,res,next){
  var myToken = localStorage.getItem('userToken');
try {
  var decoded = jwt.verify(myToken, 'loginToken');
  res.redirect('/dashboard');
} catch(err) {

}
next();
}

//Redirecting Login Page
router.get('/login',checkLogin,function(req, res, next) {
  res.render('backend/login',{successmsg:'',errormsg:''});
});


router.post('/login', function(req, res, next) {
  var emailAddress = req.body.emailaddress;
  var password = req.body.password;

  var checkEmail = userModel.findOne({email:emailAddress}).populate('admin_type');

 
  checkEmail.exec(function(err,data){
    
 
    if(err) throw err;
    if(data != null){
      var fullName = data.firstname + ' ' + data.lastname;
      var getPassword = data.password;
      var getUserId = data._id;
      var adminType = data.admin_type.admin_type;



      if(data.status == "Active"){
        if(bcrypt.compareSync(password,getPassword)){
          var token = jwt.sign({ userId: getUserId }, 'loginToken');
          
          localStorage.setItem('userToken',token);
          localStorage.setItem('userName',fullName);
          localStorage.setItem('userId',getUserId);
          localStorage.setItem('adminType',adminType);

          res.redirect('/dashboard');
        }else{
          res.render('login',{successmsg:'',errormsg:'Invalid credential. Please try again'});
        }
    }else{
      res.render('login',{successmsg:'',errormsg:'Invalid credential.Inactive! Please try again'});
    }
    }else{
    res.render('login',{successmsg:'',errormsg:'Invalid credential. Please try again'});
  }
  })
});





router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
   localStorage.removeItem('userName');
   localStorage.removeItem('userId');
  res.redirect('/login');
});


  

module.exports = router;
