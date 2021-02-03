var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
const axios = require('axios');  
var uniqid = require('uniqid');
var FormData = require('form-data');

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
const cartModel = require('../../modules/cart');
var settingModel = require('../../modules/setting'); 





router.get('/', function(req, res, next) {

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var esewa_orderID = uniqid();

    var customerCart = cartModel.findOne({customer_id : cookiesCustomerId});
   

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
  
            customerCart.exec(function(err4,data4){

              var taxPercent = 10;
              var serviceCharge = 100;
              var deliveryCharge = 100;
              var taxAmount = 0;

              var productAmount = data4.total_price;
              
              taxAmount = taxPercent/100 * productAmount;
        
        
              var totalAmount = parseInt(productAmount) + serviceCharge + deliveryCharge + taxAmount;
              console.log(totalAmount);
          
            // var records = util.inspect(data4, false, null, true /* enable colors */);
            res.render('frontend/payment',{
              bookSubcategories:data1,
              stationarySubcategories:data2,
              ebookSubcategories:uniqueValueEbook,
              cookiesCustomerToken,
              cookiesCustomerrName,
              cookiesCustomerId,
              cookiesCustomerEmail,
              setting : dataa,
              esewa_orderID,
              productAmount,
              totalAmount,
              serviceCharge,
              deliveryCharge,
              taxAmount
            });
            });
          });
        });
      });
    });     

  });


  router.post('/store',async function(req, res, next) {

    //For E-Sewa
    var totalAmount = req.body.tAmt;
    var amount = req.body.amt;
    var taxAmount = req.body.txAmt;
    var serviceCharge = req.body.psc;
    var DeliveryCharge = req.body.pdc;
    var Merchantcode = req.body.scd;
    var orderId = req.body.pid;
    var successLink = req.body.su;
    var failureLink = req.body.fu;

  
    var fullName = req.body.fullname;
    var phoneNumber = req.body.phonenumber;
    var city = req.body.city;
    var streetAddress = req.body.street_address;
    var paymentMethod = req.body.paymentmethod;

    var data = {
      'tAmt' : totalAmount,
      'amt' : amount,
      'txAmt' : taxAmount,
      'psc' : serviceCharge,
      'pdc' : DeliveryCharge,
      'scd' : Merchantcode,
      'pid' : orderId,
      'su' : successLink,
      'fu' : failureLink,
    }



    res.redirect('https://uat.esewa.com.np/epay/main?tAmt='+totalAmount+'&amt='+amount+'&txAmt='+taxAmount+'&psc='+serviceCharge+'&pdc='+DeliveryCharge+'&scd=EPAYTEST&pid='+orderId+'&su=http://127.0.0.1:3000/?q=su&fu=http://127.0.0.1:3000/payment/?q=fu');

  });

   //Making Unique value for E-book
 function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
   } 

  module.exports = router;