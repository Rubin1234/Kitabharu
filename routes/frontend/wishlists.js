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
const cartModel = require('../../modules/cart');
const wishlistModel = require('../../modules/wishlist');

/* GET home page. */
  router.get('/', function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        req.flash('error','  Please login to proceed to add product to wishlist.');
        res.redirect('customer/login');
      }else{
        var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
        var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
        var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
         // var records = util.inspect(data, false, null, true /* enable colors */);
    
      var wishlistProduct = wishlistModel.findOne({'customer_id':cookiesCustomerId}).populate('ebook_id');
    
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
            
    
              wishlistProduct.exec(function(err4,data4){
   
                // var records = util.inspect(data4, false, null, true /* enable colors */);
                res.render('frontend/wishlists',{
                  bookSubcategories:data1,
                  stationarySubcategories:data2,
                  ebookSubcategories:uniqueValueEbook,
                  cookiesCustomerToken,
                  cookiesCustomerrName,
                  cookiesCustomerId,
                  cookiesCustomerEmail,
                  wishlistProduct : data4
                });
              }); 
            });
          });
        }); 
      }

  });


  /* GET home page. */
  router.get('/addtobookwishlist', function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var productId = req.query.productId;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        res.send('nocookies');
      }else{
        ModelProduct.findById(productId).populate('book_attribute').exec(function(err,data){
            wishlistModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,wishlist){
                var total_quantity = 0;
                
                //IF Cart is empty
                if(wishlist != null){
                    //to check product is existing in cart
                    const existingProductIndex = wishlist.products.findIndex(p => p._id == productId && p.book_type == 'paperbook');  
                  

                    if(existingProductIndex >= 0){
                        res.send('item-already-exist' );

                    }else{
                            //If card has other different product
                            var savedata = data.toObject();
                            savedata.book_type = 'paperbook';
                    
                            savedata.qty = 1;
                       
                            wishlist.products.push(savedata);
                            wishlist.save();

                            var productItemNumber = 0;

                            wishlist.products.forEach(function(doc){
                            productItemNumber += parseInt(doc.qty);
                            });

                            console.log(productItemNumber);

                            res.send({
                            'productitem': productItemNumber, 
                            'wishlist': wishlist,
                            });
                    
                        }

                }else{
                    
                    //If Wishlist is empty
                    var saveWishlist = new wishlistModel({
                        customer_id : cookiesCustomerId
                    });

                    var savedata = data.toObject();
                    savedata.book_type = 'paperbook';
    
                    savedata.qty = 1;

                    saveWishlist.products.push(savedata);
                    saveWishlist.save();

                    res.send({
                        'productitem': savedata.qty, 
                        'wishlist': wishlist,
                    });
                }   
            });
        });
      }
  });


  
  /* GET home page. */
  router.get('/addtoebookwishlist', function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var productId = req.query.productId;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        res.send('nocookies');
      }else{
        ModelProduct.findById(productId).populate('book_attribute').populate('ebook_id').exec(function(err,data){
            wishlistModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,wishlist){

                var total_quantity = 0;
                
                //IF Cart is empty
                if(wishlist != null){
                    //to check product is existing in cart
                    const existingProductIndex = wishlist.products.findIndex(p => p._id == productId && p.book_type == 'ebook');  
                  

                    if(existingProductIndex >= 0){
                        res.send('item-already-exist' );

                    }else{
                            //If card has other different product
                            var savedata = data.toObject();
                            savedata.book_type = 'ebook';
                    
                            savedata.qty = 1;
                       
                            wishlist.products.push(savedata);
                            wishlist.save();

                            var productItemNumber = 0;

                            wishlist.products.forEach(function(doc){
                            productItemNumber += parseInt(doc.qty);
                            });

                            console.log(productItemNumber);

                            res.send({
                            'productitem': productItemNumber, 
                            'wishlist': wishlist,
                            });
                    
                        }

                }else{
                    
                    //If Wishlist is empty
                    var saveWishlist = new wishlistModel({
                        customer_id : cookiesCustomerId
                    });

                    var savedata = data.toObject();
                    savedata.book_type = 'ebook';
    
                    savedata.qty = 1;

                    saveWishlist.products.push(savedata);
                    saveWishlist.save();

                    res.send({
                        'productitem': savedata.qty, 
                        'wishlist': wishlist,
                    });
                }   
            });
        });
      }
  });


  
  router.get('/viewwishlist', function(req,res,next){

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
      res.send({
        'productitem': 0, 
       
      });
    }else{
        wishlistModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,wishlist){
   
          if(wishlist == null){
            var productItemNumber = 0;
            console.log(productItemNumber);
            res.send({
              'productitem': productItemNumber, 
              'wishlist': wishlist,
            });

          }else{

            var productItemNumber = 0;
            wishlist.products.forEach(function(doc){
              productItemNumber += parseInt(doc.qty);
            });

            res.send({
              'productitem': productItemNumber, 
              'wishlist': wishlist,
            });
          }
      });
    }  
  });



  router.get('/addtostationarywishlist', function(req, res, next) {
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var productId = req.query.productId;

    console.log(productId);

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        res.send('nocookies');
      }else{
        ModelProduct.findById(productId).populate('stationary_attribute').exec(function(err,data){
            wishlistModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,wishlist){
           
                var total_quantity = 0;
                
                //IF Cart is empty
                if(wishlist != null){
                    //to check product is existing in cart
                    const existingProductIndex = wishlist.products.findIndex(p => p._id == productId && p.book_type == null);  
                  

                    if(existingProductIndex >= 0){
                        res.send('item-already-exist' );

                    }else{
                            //If card has other different product
                            var savedata = data.toObject();
                         
                            savedata.qty = 1;
                       
                            wishlist.products.push(savedata);
                            wishlist.save();

                            var productItemNumber = 0;

                            wishlist.products.forEach(function(doc){
                            productItemNumber += parseInt(doc.qty);
                            });

                      

                            res.send({
                            'productitem': productItemNumber, 
                            'wishlist': wishlist,
                            });
                    
                        }

                }else{
                    
                    //If Wishlist is empty
                    var saveWishlist = new wishlistModel({
                        customer_id : cookiesCustomerId
                    });

                    var savedata = data.toObject();
                   
                    savedata.qty = 1;

                    saveWishlist.products.push(savedata);
                    saveWishlist.save();

                    res.send({
                        'productitem': savedata.qty, 
                        'wishlist': wishlist,
                    });
                }   
            });
        });
      }
  });























router.get('/removewishlistitem',function(req, res, next){
  var productId = req.query.productId;
  var cookiesCustomerId = req.cookies.customerId;
  var bookType = req.query.bookType;

  if(bookType == ''){
    bookType = null;
  }


  var wishlistProduct = req.query.cartProduct;


  console.log(productId);
  console.log(cookiesCustomerId);
  console.log(bookType);
  console.log(wishlistProduct);



var removeItem = wishlistModel.findOne({customer_id : cookiesCustomerId, _id : wishlistProduct});
   
  removeItem.exec(function(err,data){
    console.log(data);

    const existingProductIndex = data.products.findIndex(p => p._id == productId && p.book_type == bookType);
    data.products.splice(existingProductIndex, 1); // first element removed

    //Removing Previous Object
    var updateProduct = wishlistModel.update({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },}, {multi:true});
      updateProduct.exec(function(err5,data5){

        //Adding New Object After Deleting
        wishlistModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,data1){
          data.products.forEach(function(data2){
            data1.products.push(data2);
          });
    
          data1.save(); 
          res.send(data1);
      
        });
      });
    })
  });



 //Making Unique value for E-book
 function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
 } 
        
module.exports = router;