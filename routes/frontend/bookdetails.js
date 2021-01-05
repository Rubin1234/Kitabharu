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
const reviewModel = require('../../modules/review');
const { populate, db } = require('../../modules/categories');
const { rejects } = require('assert');
const { resolve } = require('path');

/* GET home page. */


  router.get('/', function(req, res, next) {
  // var records = util.inspect(data, false, null, true /* enable colors */);

  res.render('frontend/bookdetails');      

  });

  router.get('/bookdetails/:slug',function(req,res,next){

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;


    var slug = req.params.slug;

    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');

    var bookDetails = ModelProduct.findOne({slug:slug}).populate('images').populate('book_attribute').populate('subcategory_id').populate('images').populate('ebook_id');
    
    
    bookDetails.exec(function(err,data){
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
            console.log(data);
            res.render('frontend/bookdetails',{
              bookDetails:data,
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
  });






  router.get('/savereview',function(req,res,next){
      var comment = req.query.comment;
      var starCount = req.query.starCount;
      var productId = req.query.productId;

      console.log(starCount);
      console.log(comment);



      //From Cookies
      var cookiesCustomerId = req.cookies.customerId;

    reviewModel.findOne({customer_id : cookiesCustomerId, product_id : productId},function(err,data){

        if(data == null){

          var saveReview = new reviewModel({
            customer_id : cookiesCustomerId,
            product_id : productId,
            comment : comment,
            rating_star : starCount
          });

          saveReview.save();

        }else{

          //If Startcount is not undefined and comment is not empty
          if( starCount != undefined && comment != ''){
            var updateCart = reviewModel.findOneAndUpdate({customer_id:cookiesCustomerId, product_id : productId},{
              comment : comment,
              rating_star : starCount
              }); 
  
              updateCart.exec(function(err1,data1){
               
              });
          }

          //If Startcount is not undefined and comment is empty
          if( starCount != undefined && comment == ''){
            var updateCart = reviewModel.findOneAndUpdate({customer_id:cookiesCustomerId, product_id : productId},{
              rating_star : starCount
              }); 
  
              updateCart.exec(function(err1,data1){
            
              });
          }

          //If Startcount is  undefined and comment is not empty
          if( starCount == undefined && comment != ''){
            var updateCart = reviewModel.findOneAndUpdate({customer_id:cookiesCustomerId, product_id : productId},{
              rating_star : starCount
              }); 
  
              updateCart.exec(function(err1,data1){
              
              });
          }
      
        }
    });

      res.send();

  });


  router.get('/ratenow',function(req,res,next){
    var productId = req.query.productId;

 
      //From Cookies
      var cookiesCustomerId = req.cookies.customerId;


    var promises = new Promise((resolve,reject) => {
      reviewModel.findOne({customer_id : cookiesCustomerId, product_id : productId},function(err,data1){
        var data = '';
        data += '<div class="ratingbody" style="position:relative;">';
   
        if(data1 != null){
               
        data += '<div class="ratingEdit" style=""><p onclick="editReview()">Edit</p></div> <div><h4 style="text-align: center;color: #666666;" id="thankForRating">Thank You For Rating Us !!!</h4><div class="star-widget">';

          for(var i=5; i>=1; i--){
         
              if(i <= data1.rating_star ){
                data += '<label for="rate-'+i+'" class="icon-star" style="color: #fd4;" ></label>';
             
              }else{
                data += '<label for="rate-'+i+'" class="icon-star" ></label>';
              }
          }

          data += '<span id="ratedStar"></span><header><h4 style="font-size: 23px;"></h4></header></div></div></div><div class="form-group"><label for="message-text" class="col-form-label" style="font-weight: bold;">Comment:</label><textarea class="form-control" id="message-text"  rows="4" placeholder="Describe your experience..." disabled>'+data1.comment+'</textarea></div></div><span id="removePostBtn" value="null"></span>'; 

          resolve(data);
        }else{
        
        
        data += ' <div><h4 style="text-align: center;color:   #666666;" id="thankForRating">Please Rate Us !!!</h4><div class="star-widget">';

        data += '<input type="radio" name="rate" id="rate-5" value="5" onclick="clickRate()"><label for="rate-5" class="icon-star" ></label><input type="radio" name="rate" id="rate-4" value="4" onclick="clickRate()"><label for="rate-4" class="icon-star" ></label><input type="radio" name="rate" id="rate-3" value="3" onclick="clickRate()"><label for="rate-3" class="icon-star" ></label><input type="radio" name="rate" id="rate-2" value="2" onclick="clickRate()"><label for="rate-2" class="icon-star" ></label><input type="radio" name="rate" id="rate-1" value="1"><label for="rate-1" class="icon-star" onclick="clickRate()"></label>';
      

        data += '<span id="ratedStar"></span><header><h4 style="font-size: 23px;"></h4></header></div></div></div><div class="form-group"><label for="message-text" class="col-form-label" style="font-weight: bold;">Comment:</label><textarea class="form-control" id="message-text"  rows="4" placeholder="Describe your experience..." ></textarea></div></div>'; 

        resolve(data);
        }
      })
    });

  
    promises.then( allData =>{
      console.log(allData);
      res.send(allData);
  
    });

  });
  


         //Making Unique value for E-book
   function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
          
module.exports = router;