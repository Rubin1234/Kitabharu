var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
const moment = require('moment')

var router = app.Router();

const categoryModel = require('../../modules/categories');
const SubCategoryModel = require('../../modules/subcategories');
const brandModel = require('../../modules/brand');
const bookAttributesModel = require('../../modules/bookAttributes'); 
const productImagesModel = require('../../modules/product_images'); 
const util = require('util');
const ModelProduct = require('../../modules/product');
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
const cartModel = require('../../modules/cart');
const settingModel = require('../../modules/setting');
const orderModel = require('../../modules/orders') 

/* GET home page. */


router.get('/', async function(req, res, next) {

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;
    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
     // var records = util.inspect(data, false, null, true /* enable colors */);

     var settingData = settingModel.findOne({});
     var orderData = await orderModel.find({customerId : cookiesCustomerId}, null , { sort : {'createdAt' : -1}})
  

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
  
            // var records = util.inspect(data4, false, null, true /* enable colors */);
            res.render('frontend/order',{
              bookSubcategories:data1,
              stationarySubcategories:data2,
              ebookSubcategories:uniqueValueEbook,
              cookiesCustomerToken,
              cookiesCustomerrName,
              cookiesCustomerId,
              cookiesCustomerEmail,
              setting : dataa,
              orderData,
              moment
            });
         
          });
        });
      });
    });     

  });

  router.get('/:id',async function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;



    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
     // var records = util.inspect(data, false, null, true /* enable colors */);

     var settingData = settingModel.findOne({});
     const orderData = await orderModel.findById(req.params.id);
  
     if(cookiesCustomerId.toString() === orderData.customerId.toString()){

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
  

         
          
            // var records = util.inspect(data4, false, null, true /* enable colors */);
            res.render('frontend/singleOrder',{
              bookSubcategories:data1,
              stationarySubcategories:data2,
              ebookSubcategories:uniqueValueEbook,
              cookiesCustomerToken,
              cookiesCustomerrName,
              cookiesCustomerId,
              cookiesCustomerEmail,
              setting : dataa,
              orderData,
              moment
            });
          
          });
        });
      });
    }); 
}else{
    return res.redirect('/');
}
  });




  //Making Unique value for E-book
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
   } 


module.exports = router;