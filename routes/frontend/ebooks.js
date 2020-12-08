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
  var allEbooks = ModelProduct.find({book_type : ['ebook','both']}).populate('book_attribute');
    
  var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
  var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
  var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');

  
  var slug = '';
  var checked = '';

  allEbooks.exec(function(err,data){
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
          var records = util.inspect(data, false, null, true /* enable colors */);
          console.log(records);
          res.render('frontend/ebooks',{allEbooks:data,bookSubcategories:data1,stationarySubcategories:data2,ebookSubcategories:uniqueValueEbook,slug,checked}); 
        });
      });
    });
  });
});


router.get('/:slug',(req,res,next) => {

  var slug = req.params.slug;
  var checked = 'checked';
  var subCategoryName = subCategoryModel.findOne({slug:slug});

  //FOr Menu
  var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
  var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
  var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');



  subCategoryName.exec(function(err,data){

    var subcategoryId = data._id;

    ModelProduct.find({subcategory_id:subcategoryId,book_type : ['ebook','both']}).exec(function(err1,data1){
      bookSubcategories.exec(function(err2,data2){
        stationarySubcategories.exec(function(err3,data3){
          ebookSubcategories.exec(function(err4,data4){

                //Storing subcategories in array for taking unique value
           var array = [];
           data4.forEach(function(data5){
             var subcategoryEbook = data5.subcategory_id;
             array.push(subcategoryEbook);
           });
       
           var uniqueValueEbook = array.filter(onlyUnique);

            res.render('frontend/ebooks',{allEbooks:data1,bookSubcategories:data2,stationarySubcategories:data3,ebookSubcategories:uniqueValueEbook,slug,checked});
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
           

   router.get('/ebooksubcategory/changecheckbox',function(req,res,next){
    var subcategoryId = req.query.subcategoryId;
   console.log(subcategoryId);


    if(subcategoryId == undefined){
      var allBooks = ModelProduct.find({book_type : ['ebook','both']}).populate('book_attribute');
      allBooks.exec(function(err,data){
        res.send(data);
      });
    }else{
      var productDetails = ModelProduct.find({subcategory_id:subcategoryId,book_type:['ebook','both']}).populate('book_attribute');
      
      productDetails.exec(function(err,data){
        res.send(data);
      });
    }
 
  
  });


module.exports = router;