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
  // var records = util.inspect(data, false, null, true /* enable colors */);

  res.render('frontend/bookdetails');      

  });

  router.get('/bookdetails/:slug',function(req,res,next){
    var slug = req.params.slug;
    var bookDetails = ModelProduct.findOne({slug:slug}).populate('images').populate('book_attribute').populate('subcategory_id').populate('images').populate('ebook_id');
    bookDetails.exec(function(err,data){
        console.log(data);
        res.render('frontend/bookdetails',{bookDetails:data});  
      });
   
  });



          


module.exports = router;