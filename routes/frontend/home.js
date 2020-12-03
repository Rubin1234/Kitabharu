var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');

var router = app.Router();

var categoryModel = require('../../modules/categories');
var SubCategoryModel = require('../../modules/subcategories');
var brandModel = require('../../modules/brand');
var bookAttributesModel = require('../../modules/bookAttributes'); 
var productImagesModel = require('../../modules/product_images'); 
const util = require('util');
var ModelProduct = require('../../modules/product'); 
var stationaryAttributesModel = require('../../modules/stationaryAttributes'); 
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');

/* GET home page. */


  router.get('/', function(req, res, next) {


    var newArrival = ModelProduct.find({book_type : ['paperbook','both','ebook']}).sort({_id:-1}).populate('book_attribute').limit(10);

    var books = ModelProduct.find({book_type : ['paperbook','both','ebook']}).populate('book_attribute').limit(10);
    //  var productModel = ModelProduct.find({book_type : ['paperbook','both']}).populate('book_attribute');

    var stationaryProducts = ModelProduct.find({category_id:'5fc871bce5825658544dfa0c'}).populate('book_attribute').populate('stationary_attribute').limit(10);

    newArrival.exec(function(err,data){
        books.exec(function(err1,data1){
          stationaryProducts.exec(function(err2,data2){
  
            var records = util.inspect(data2, false, null, true /* enable colors */);
            console.log(records);
            res.render('frontend/index',{newArrival:data,books:data1,stationary:data2});  
          });
        });
    });
  });

          


module.exports = router;