var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');    

require('dotenv').config();
var nodemailer = require('nodemailer'); 

var fs = require('fs');

var router = app.Router();

var categoryModel = require('../../modules/categories');
var SubCategoryModel = require('../../modules/subcategories');
var brandModel = require('../../modules/brand');
var bookAttributesModel = require('../../modules/bookAttributes'); 
var productImagesModel = require('../../modules/product_images'); 
const util = require('util');
const ModelProduct = require('../../modules/product');
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
var settingModel = require('../../modules/setting'); 

/* GET home page. */


  router.get('/', function(req, res, next) {

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;


    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
     // var records = util.inspect(data, false, null, true /* enable colors */);
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
          //var records = util.inspect(data, false, null, true /* enable colors */);

          res.render('frontend/contactus',{
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


  router.post('/sendmail', function(req, res, next) {
    var email = req.body.email;
    var fullname = req.body.fullname;
    var message = req.body.message;
    var phonenumber = req.body.phonenumber;

    //Step 1
    let transporter = nodemailer.createTransport({
      service : 'gmail',
      auth : {
        user: process.env.Email,
        pass: process.env.Password
      }
    });

    
  //Step 2
  let mailOptions = {
    from : email,
    to : 'rojen.maharjan89@gmail.com',
    subject : 'Kitabharu Contact Us',
    html : '<div style="font-size:16px"><strong>Name: </strong>'+fullname+'<br><strong>Phonenumber: </strong>'+phonenumber+'<br><strong>Email Address: </strong>'+email+'<br><strong>Message: </strong>'+message+'</div>',
  }

  transporter.sendMail(mailOptions, function(err,data){
    console.log(data);
    if(err){
      console.log('Error Occurs');
    }else{
      console.log('Email Send');
    }

  });


  req.flash('success','Email Sent Succesfully. We will contact you later.Thank you!!!');
  res.redirect('/contactus');
  });

 //Making Unique value for E-book
 function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
 } 
        
module.exports = router;