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
var settingModel = require('../../modules/setting'); 

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

  var cartProduct = cartModel.findOne({'customer_id':cookiesCustomerId});
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
        

        cartProduct.exec(function(err4,data4){
            // var records = util.inspect(data4, false, null, true /* enable colors */);
            res.render('frontend/cart',{
              bookSubcategories:data1,
              stationarySubcategories:data2,
              ebookSubcategories:uniqueValueEbook,
              cookiesCustomerToken,
              cookiesCustomerrName,
              cookiesCustomerId,
              cookiesCustomerEmail,
              cartProduct:data4,
              setting : dataa
            });
          });
          }); 
        });
      });
    });     
  }
  });

  router.post('/update',function(req, res, next){

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var data = req.body;
  
  
    if( Object.keys(data).length != 0){
      var cartProduct = cartModel.findOne({'customer_id':cookiesCustomerId});
      cartProduct.exec(function(err2,cart){

        var totalPrice = 0;
        const promises = data.product_id.map((item,index) => new Promise((resolve,reject) => {
           
          var bookType = data.book_type[index];
          var quantity = parseInt(data.quantity[index]);
          var price = parseInt(data.price[index]);

          var totalPricePerProduct = quantity * price;
          totalPrice += totalPricePerProduct;
            
          if(bookType == "null"){
            bookType = null;
          }

          const existingProductIndex =  cart.products.findIndex(p => p._id == item && p.book_type == bookType);
          const existingProduct = cart.products[existingProductIndex];
          existingProduct.qty = quantity;
          resolve(existingProduct);
        }));

        Promise.all(promises)
          .then(allArray => {  
            var records = util.inspect(allArray, false, null, true /* enable colors */);  
       
            //For Emptying Array
            var updateProduct = cartModel.update({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },}, {multi:true});
              updateProduct.exec(function(err4,data4){

                cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err5,data5){
                  allArray.forEach(function(data6){
                    data5.products.push(data6);
                  });
                
                  data5.save(); 

                 var update = cartModel.updateOne({'customer_id':cookiesCustomerId},{$set: { "total_price" : totalPrice }});
                    update.exec(function(err7,data7){
                      res.redirect('/cart');
                    });    
                });
              });
          });
        });
      }else{
        var updateProduct = cartModel.update({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },}, {multi:true});
        var update = cartModel.updateOne({'customer_id':cookiesCustomerId},{$set: { "total_price" : 0 }});
        
        updateProduct.exec(function(err,data){
          update.exec(function(err1,data1){
            res.redirect('/cart');
          });
        });   
      }
    
  });


  router.get('/updated/add',function(req, res, next){
      var totalQuantity = req.query.totalQuantity;
      var productId = req.query.productId;
      var cookiesCustomerId = req.cookies.customerId;
      var bookType = req.query.bookType;

      cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

        var total_quantity = 0;

        const existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == bookType);  //to check product is existing in cart
        const existingProduct = cart.products[existingProductIndex];
        total_quantity =  parseInt(existingProduct.qty) + 1;

        var totalPrice =  existingProduct.product_price;
                
        // total =  parseInt(cart.total_price) + parseInt(totalPrice);
        cart.total_price += parseInt(totalPrice);


               //Udate Quantity in Product  Array in cart
               var updateArray = cartModel.update(
                {customer_id:cookiesCustomerId, 
                products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
                { $set: { "products.$.qty":  total_quantity }}
              )

              //Update Price
              var updateTotalPrice = cartModel.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

              updateArray.exec(function(err,data){
                updateTotalPrice.exec(function(err1,data1){
                  res.send(data1);
              });
            });
      });
  });



  router.get('/updated/sub',function(req, res, next){
    var totalQuantity = req.query.totalQuantity;
    var productId = req.query.productId;
    var cookiesCustomerId = req.cookies.customerId;
    var bookType = req.query.bookType;

    cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

      var total_quantity = 0;

      const existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == bookType);  //to check product is existing in cart
      const existingProduct = cart.products[existingProductIndex];
      total_quantity =  parseInt(existingProduct.qty) - 1;

      var totalPrice =  existingProduct.product_price;
              
      // total =  parseInt(cart.total_price) + parseInt(totalPrice);
      cart.total_price -= parseInt(totalPrice);

        //Udate Quantity in Product  Array in cart
        var updateArray = cartModel.updateOne(
          {customer_id:cookiesCustomerId, 
          products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
          { $set: { "products.$.qty":  total_quantity }}
        )

        //Update Price
        var updateTotalPrice = cartModel.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

        updateArray.exec(function(err,data){
          updateTotalPrice.exec(function(err1,data1){
            res.send(data1);
          });
        });
    });

    
  
    // //Udate Quantity in Product  Array in cart
    // var updateArray = cartModel.updateOne(
    //   {customer_id:cookiesCustomerId, 
    //   products:{ $elemMatch :{"book_type": bookType, "_id": productId}}},
    //   { $set: { "products.$.qty":  totalQuantity }}
    // )

 

});


router.get('/removeitem',function(req, res, next){
  var productId = req.query.productId;
  var cookiesCustomerId = req.cookies.customerId;
  var bookType = req.query.bookType;
  var cartProduct = req.query.cartProduct;



var removeItem = cartModel.findOne({customer_id : cookiesCustomerId, _id : cartProduct});
   
  removeItem.exec(function(err,data){
    const existingProductIndex = data.products.findIndex(p => p._id == productId && p.book_type == bookType);
    
    const existingProduct = data.products[existingProductIndex];
    console.log(existingProduct);


    var priceToBeDeduct = existingProduct.qty * existingProduct.product_price;
    
    var newTotalPrice = data.total_price - priceToBeDeduct; 

    data.products.splice(existingProductIndex, 1); // first element removed

    //Removing Previous Object
    var updateProduct = cartModel.update({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },total_price: newTotalPrice}, {multi:true});
      updateProduct.exec(function(err5,data5){

        //Adding New Object After Deleting
        cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,data1){
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