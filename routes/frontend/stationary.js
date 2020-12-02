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
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');

/* GET home page. */


  router.get('/', function(req, res, next) {
    var stationaryProducts = ModelProduct.find({category_id:'5fba1b3afae27545a0334206'}).populate('stationary_attribute').limit(10);

    stationaryProducts.exec(function(err,data){
        var records = util.inspect(data, false, null, true /* enable colors */);
      console.log(records);
      res.render('frontend/stationary',{stationaryProducts:data}); 
    });

  });


          


module.exports = router;