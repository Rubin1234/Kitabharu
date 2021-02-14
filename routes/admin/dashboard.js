
var express = require('express');
var router = express.Router();

//package
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var fs = require('fs');
var jwt = require('jsonwebtoken');

//Models
var userModel = require('../../modules/admin');
var orderModel = require('../../modules/orders');
var ModelProduct = require('../../modules/product'); 

var sessionstorage = require('sessionstorage');

//checking node-localstorage
// if (typeof localStorage === "undefined" || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./scratch');
// }


checkUserLogin = function(req,res,next){
  var myToken = req.cookies.userToken;

  try {
    var decoded = jwt.verify(myToken, 'loginToken');

  } catch(err) {
    res.redirect('/login');
  }
  next();
}


/* GET home page. */
router.get('/dashboard', checkUserLogin,async function(req, res, next) {

  var adminType = req.cookies.adminType;
  var userId = req.cookies.userId;



  userModel.findOne({_id:userId},function(admindataErr,admindata){
    console.log(admindata);
    res.render('dashboard',{adminType,admindata});
  });
});





// -------------------------------------------Setting----------------------------------------------------------------------------------------------------


router.get('/setting',function(req, res, next) {
 
  var userId = req.cookies.userId;
  var adminType = req.cookies.adminType;
  var userData = userModel.findOne({_id:userId});
  var userData1 = userModel.findOne({_id:userId});

  userData.exec(function(err,data){
    if(err) throw err;
    userData.exec(function(admindataErr,admindata){
      res.render('setting',{adminType,data,title:'Setting',admindata});
    });
  });
});


//storage for Image Upload
var Storage = multer.diskStorage({
  // destination: './public/images/backend/admins/',
  filename: function(req,file,cb){
    var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
  }
});

var upload = multer({
  storage:Storage
}).single('profilePic');



router.post('/setting',upload,function(req,res,next){

    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var address = req.body.address;
    var phoneNumber = req.body.phonenumber;
    var email = req.body.email;
    var oldpassword = req.body.oldpassword;
    var newPassword = req.body.newpassword;
    var confirmPassword = req.body.confirmpassword;
    var previousprofilePic = req.body.previousprofilePic;

  //accessing Id from session 

  var id = req.cookies.userId;


  //Accessing Image and deleting the previuosly saved image
    // var image = req.file.filename;

    var image;
    if(req.file == null){
        image = previousprofilePic;
    }else{
        image = req.file.filename;   
      
        let width = 500;
        let height = 500;
    
        sharp(req.file.path).resize(width,height).toFile('./public/images/backend/admins/'+ req.file.filename);
        
        //Deleting File 
        var filePath = './public/images/backend/admins/'+previousprofilePic;
        fs.unlinkSync(filePath);
    }   
  
  


      //if confirm password is null
      if(confirmPassword == ''){
        var checkId = userModel.findOne({_id:id});

        checkId.exec(function(err,data){
          if(err) throw err;
          var getPassword = data.password;
          
          //checking password
          if(bcrypt.compareSync(oldpassword,getPassword)){
              
              var updateUser = userModel.findByIdAndUpdate(id,{
                firstname: firstName,
                lastname: lastName,
                address: address,
                phonenumber: phoneNumber,
                email: email,
                image:image,
              });
          
              updateUser.exec(function(err1,data1){
                if(err1) throw err1;
                req.flash('success','Updated Succesfully. Thank you!!!');
                res.redirect('setting');
              });
          }else{
            req.flash('error','The password does not matched. Please re-enter your password');
            res.redirect('setting');
          }
        });

      }

      //if confirm password is not null

      if(confirmPassword != ''){
        var checkId = userModel.findOne({_id:id});
        
        checkId.exec(function(err,data){
          if(err) throw err;
        var getPassword = data.password;
        if(bcrypt.compareSync(oldpassword,getPassword)){
          var updatedpassword = bcyrpt.hashSync(confirmPassword,10);
          var updatepasswordData = userModel.findByIdAndUpdate(id,{
            firstname: firstName,
            lastname: lastName,
            address: address,
            phonenumber: phoneNumber,
            email: email,
            image: image,
            password:updatedpassword,

          });

          updatepasswordData.exec(function(err2,data2){
            if(err2) throw err2;
            req.flash('success','Updated Succesfully. Thank you!!!');
            res.redirect('setting');
          });
        }
    else{
        req.flash('error','The password does not matched. Please re-enter your password');
        res.redirect('setting');
      }
    });
    }
  

});


router.get('/dashboard/admin/orders',function(req, res, next) {
  orderModel.find({status: {$ne: 'completed'}}, null , {sort : {'createdAt' : -1}}).
  populate('customerId','-password').exec((err, orders) => {
      if(req.xhr){
         return res.json(orders)
      }else{
          res.render('/dashboard')
        
      }
  })
 
})


router.post('/dashboard/admin/order/status',function(req, res, next) {
  orderModel.updateOne({_id: req.body.orderId}, {status: req.body.status}, (err, data) => {
    if(err){
     return   res.redirect('/dashboard')  
    }
  

    // Emit Event
    const eventEmitter = req.app.get('eventEmitter');
    eventEmitter.emit('orderUpdated',{id: req.body.orderId, status: req.body.status})

    return  res.redirect('/dashboard')
})
})

module.exports = router;


