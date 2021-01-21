var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs'); 
var jwt = require('jsonwebtoken');

var router = app.Router();

var categoryModel = require('../../modules/categories');
var SubCategoryModel = require('../../modules/subcategories');
var brandModel = require('../../modules/brand');
var bookAttributesModel = require('../../modules/bookAttributes'); 
var productImagesModel = require('../../modules/product_images'); 
const util = require('util');
var ModelProduct = require('../../modules/product'); 
var modelCart = require('../../modules/cart'); 
const subCategoryModel = require('../../modules/subcategories');
const customerModel = require('../../modules/customers');
const { populate, db } = require('../../modules/categories');
const cartModel = require('../../modules/cart');
var settingModel = require('../../modules/setting'); 

/* GET home page. */
//Check if there is user session

checkLogin = function(req,res,next){
  var myToken = req.cookies.customerToken;

  
try {
  var decoded = jwt.verify(myToken, 'loginToken');

  res.redirect('/');
} catch(err) {

}
next();
}


  router.get('/login', checkLogin, function(req, res, next) {

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;
    

    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');


    var settingData = settingModel.findOne({});
    settingData.exec(function(errr,dataa){
    bookSubcategories.exec(function(err1,data1){
      stationarySubcategories.exec(function(err2,data2){
        ebookSubcategories.exec(function(err3,data3){

          //Storing subcategories in array for taking unique value
          var array = [];
          data3.forEach(function(data4){
            var subcategoryEbook = data4.subcategory_id;
            array.push(subcategoryEbook);
          });
          
          var uniqueValueEbook = array.filter(onlyUnique);
       
          
          res.render('frontend/customerlogin',{
            bookSubcategories:data1,
            stationarySubcategories:data2,
            ebookSubcategories:uniqueValueEbook,
            cookiesCustomerToken,
            cookiesCustomerrName,
            cookiesCustomerId,
            cookiesCustomerEmail,
            setting : dataa
          });
        });
        });
      });
    });
  });

  router.post('/store',function(req, res, next){

    var username = req.body.customerusername;
    var email = req.body.customeremail;
    var password = req.body.customerpassword;
    var slugname = slug(username);

   var hashpassword = bcyrpt.hashSync(password,10);

    var customer = new customerModel({
      user_name : username,
      email : email,
      password : hashpassword,
      slug : slugname,
    });

    customer.save();
    req.flash('success','Register Succesfull. Please login to proceed.!!!');
    res.redirect('/customer/login');
 
  });


  router.post('/login',function(req,res,next){

    var email = req.body.login_email;
    var password = req.body.login_password;

    var checkEmail = customerModel.findOne({email:email});
 
    checkEmail.exec(function(err,data){

      console.log(data);
   
    
      if(err) throw err;
      if(data != null){

        var getCustomerId = data._id;
        var getemail = data.email;
        var username = data.user_name;
        var getPassword = data.password;
       
  
        if(data.status == "Active"){
          if(bcrypt.compareSync(password,getPassword)){
          

            var token = jwt.sign({ customerId: getCustomerId }, 'loginToken');

            res.cookie('customerToken',token)
            res.cookie('customerName',username);
            res.cookie('customerId',getCustomerId);
            res.cookie('customerEmail',getemail);

            res.redirect('/');
          }else{
            req.flash('error','Invalid Credentials. Please Re-enter username and password.!!!');
            res.redirect('/customer/login');
          }
      }else{
        req.flash('error','Invalid Credentials. Please Re-enter username and password.!!!');
        res.redirect('/customer/login');
      }
      }else{
        req.flash('error','Invalid Credentials. Please Re-enter username and password.!!!');
      res.redirect('/customer/login');
    }
    });

  });

  router.get('/logout',function(req,res,next){
    res.clearCookie('customerToken');
    res.clearCookie('customerName');
    res.clearCookie('customerId');
    res.clearCookie('customerEmail');
    res.redirect('/');
  });

  router.get('/accountsetting', function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    console.log(cookiesCustomerrName);


    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');

    bookSubcategories.exec(function(err1,data1){
      stationarySubcategories.exec(function(err2,data2){
        ebookSubcategories.exec(function(err3,data3){

          //Storing subcategories in array for taking unique value
          var array = [];
          data3.forEach(function(data4){
            var subcategoryEbook = data4.subcategory_id;
            array.push(subcategoryEbook);
          });
          
          var uniqueValueEbook = array.filter(onlyUnique);

          res.render('frontend/accountsetting',{
            bookSubcategories:data1,
            stationarySubcategories:data2,
            ebookSubcategories:uniqueValueEbook,
            cookiesCustomerToken,
            cookiesCustomerrName,
            cookiesCustomerId,
            cookiesCustomerEmail,
          });
        });
      });
    });
  });

  router.post('/accountsetting', function(req, res, next) {

    var username = req.body.customerusername;
    var email = req.body.customeremail;
    var oldpassword = req.body.oldpassword;
    var newPassword = req.body.newpassword;
    var confirmPassword = req.body.confirmpassword;

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    console.log(cookiesCustomerId);

    //if confirm password is null
    if(confirmPassword == ''){
      var checkId = customerModel.findOne({_id:cookiesCustomerId});
      checkId.exec(function(err,data){
        if(err) throw err;
    
        var getPassword = data.password;
        
        //checking password
        if(bcrypt.compareSync(oldpassword,getPassword)){      
            var updateCustomer = customerModel.findByIdAndUpdate(cookiesCustomerId,{
              user_name: username,
              email: email,
            });
        
          updateCustomer.exec(function(err1,data1){
            if(err1) throw err1;
              
            res.cookie('customerName',username);
            res.cookie('customerEmail',email);

            req.flash('success','Updated Succesfully. Thank you!!!');
            res.redirect('/customer/accountsetting');
          });
        }
        else
        {
          req.flash('error','You old password does not matched. Please re-enter your password');
          res.redirect('/customer/accountsetting');
        }
      });
    }


          //if confirm password is not null

    if(confirmPassword != ''){
      
      var checkId = customerModel.findOne({_id:cookiesCustomerId});
        
      checkId.exec(function(err,data){
       

          if(err) throw err;
          var getPassword = data.password;
          
          if(bcrypt.compareSync(oldpassword,getPassword)){
          var updatedpassword = bcyrpt.hashSync(confirmPassword,10);
            console.log(updatedpassword);
          

          var updatepasswordData = customerModel.findByIdAndUpdate(cookiesCustomerId,{
            user_name: username,
            email: email,
            password:updatedpassword,

          });

          updatepasswordData.exec(function(err2,data2){
            if(err2) throw err2;
            res.cookie('customerName',username);
            res.cookie('customerEmail',email);
            req.flash('success','Updated Succesfully. Thank you!!!');
            res.redirect('/customer/accountsetting');
          });
        }
    else{
        req.flash('error','The password does not matched. Please re-enter your password');
        res.redirect('/customer/accountsetting');
      }
    });
  }



  });

  //Making Unique value for E-book
  function onlyUnique(value, index, self) {
   return self.indexOf(value) === index;
  } 
          


module.exports = router;