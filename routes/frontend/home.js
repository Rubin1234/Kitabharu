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

    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
    
    

    var newArrival = ModelProduct.find({book_type : ['paperbook','both','ebook']}).sort({_id:-1}).populate('book_attribute').limit(10);

    var books = ModelProduct.find({book_type : ['paperbook','both','ebook']}).populate('book_attribute').limit(10);
    //  var productModel = ModelProduct.find({book_type : ['paperbook','both']}).populate('book_attribute');

    var stationaryProducts = ModelProduct.find({category_id: ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']}).populate('book_attribute').populate('stationary_attribute').limit(10);

    newArrival.exec(function(err,data){
        books.exec(function(err1,data1){
          stationaryProducts.exec(function(err2,data2){
            bookSubcategories.exec(function(err3,data3){
              stationarySubcategories.exec(function(err4,data4){
                ebookSubcategories.exec(function(err5,data5){

                  //Storing subcategories in array for taking unique value
                  var array = [];
                  data5.forEach(function(data6){
                    var subcategoryEbook = data6.subcategory_id;
                    array.push(subcategoryEbook);
                  });
              
                  var uniqueValueEbook = array.filter(onlyUnique);
                  console.log(uniqueValueEbook); 
                  res.render('frontend/index',{newArrival:data,books:data1,stationary:data2,bookSubcategories:data3,stationarySubcategories:data4,ebookSubcategories:uniqueValueEbook}); 
                
                });
             
              });
            }); 
          });
        });
    });

  
  });

          
    //Making Unique value for E-book
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
module.exports = router;