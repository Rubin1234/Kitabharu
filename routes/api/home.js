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
const ModelProduct = require('../../modules/product');
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
const { rejects } = require('assert');

/* GET home page. */




  router.get('/category', function(req, res, next) {
    

    categoryModel.find({}).exec(function(err,data){
      
      var array = [];


      const promises = data.map((item) => new Promise((resolve,reject) => {

                      SubCategoryModel.find({category_type_id:item._id},function(err1,data1){
                   
                        data1.forEach(function(doc){
                    
                          item.subcategories.push(doc);
                        
                        });
                                  
                        resolve(item);
                      })
                      // .exec(function(err1,data1){

                      //   data1.forEach(function(doc){
                      //     console.log(doc);
                      //     var a = item.subcategories;
                      //     a.push(doc);
                      //   });
                      // });
       
      }));

      Promise.all(promises)
                    .then(allArray => {
                        
                  var records = util.inspect(allArray, false, null, true /* enable colors */);
                 
                     
              res.send(allArray);
            
                    })


    //  var rubin = data.forEach(function(categories){

    //     SubCategoryModel.find({category_type_id:categories._id}).exec(function(err1,data1){

    //       data1.forEach(function(doc){
    //         var a = categories.subcategories;
    //         a.push(doc);
    //       });

    //     }); 
      
    //   });


     

    });


  });

          
module.exports = router;