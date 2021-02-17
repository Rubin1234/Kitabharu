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






  router.get('/updated/add',async function(req, res, next){
      var totalQuantity = req.query.totalQuantity;
      var productId = req.query.productId;
      var cookiesCustomerId = req.cookies.customerId;
      var bookType = req.query.bookType;

      var productData = await ModelProduct.findById(productId);
    
      cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
     
        var total_quantity = 0;
        
     
      
          // If book type is paperbook or ebook
    if(bookType == 'paperbook' || bookType == 'ebook'){
      var existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == bookType);
    }else{ // if book type is null (Stationary)
      var existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == null);
    }

 
        const existingProduct = cart.products[existingProductIndex];

        total_quantity =  parseInt(existingProduct.qty) + 1;

        var totalPrice =  productData.product_price;

               //If Product has discount
               if(productData.discount_percent > 0){
                var discount_price = 0;
                var discount_price = productData.discount_percent/100 * totalPrice;
                var discountedAmount = totalPrice - discount_price;
                
                cart.total_price += parseInt(discountedAmount);
      
              }else{
                cart.total_price += parseInt(totalPrice);
              }


                
        // total =  parseInt(cart.total_price) + parseInt(totalPrice);
       

            var updateArray = cartModel.updateOne( 
              { _id: cart.id, "products._id": existingProduct._id}, 
              { $set: { "products.$.qty": total_quantity } }
            )

              //  //Udate Quantity in Product  Array in cart
              //  var updateArray = cartModel.update(
              //   {customer_id:cookiesCustomerId, 
              //   products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
              //   { $set: { "products.$.qty":  total_quantity }}
              // )

              //Update Price
              var updateTotalPrice = cartModel.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

              updateArray.exec(function(err,data){
            

                updateTotalPrice.exec(function(err1,data1){

                  cartModel.findOne({customer_id:cookiesCustomerId},function(err5,data5){
  
          
                    // For Latest Number of product item        
                    var productItemNumber = 0;
        
                    data5.products.forEach(function(doc){
                      productItemNumber += parseInt(doc.qty);
                    });
        
                    var totalPrice = data5.total_price;

                    res.send({
                      'productitem': productItemNumber, 
                      'totalAmount' : totalPrice
                    });
                  });
              });
            });
      });
  });



  router.get('/updated/sub',async function(req, res, next){

    var totalQuantity = req.query.totalQuantity;
    var productId = req.query.productId;
    var cookiesCustomerId = req.cookies.customerId;
    var bookType = req.query.bookType;

    var productData = await ModelProduct.findById(productId);

    cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

      var total_quantity = 0;

          // If book type is paperbook or ebook
    if(bookType == 'paperbook' || bookType == 'ebook'){
      var existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == bookType);
    }else{ // if book type is null (Stationary)
      var existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == null);
    }
      
      
      const existingProduct = cart.products[existingProductIndex];
      total_quantity =  parseInt(existingProduct.qty) - 1;

      var totalPrice =  productData.product_price;

      //If Product has discount
      if(productData.discount_percent > 0){
       var discount_price = 0;
       var discount_price = productData.discount_percent/100 * totalPrice;
       var discountedAmount = totalPrice - discount_price;
       
       cart.total_price -= parseInt(discountedAmount);

     }else{
       cart.total_price -= parseInt(totalPrice);
     }


        //Udate Quantity in Product  Array in cart

        var updateArray = cartModel.updateOne( 
          { _id: cart.id, "products._id": existingProduct._id}, 
          { $set: { "products.$.qty": total_quantity } }
        )
        // var updateArray = cartModel.updateOne(
        //   {customer_id:cookiesCustomerId, 
        //   products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
        //   { $set: { "products.$.qty":  total_quantity }}
        // )

        //Update Price
        var updateTotalPrice = cartModel.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

        updateArray.exec(function(err,data){
          updateTotalPrice.exec(function(err1,data1){
            cartModel.findOne({customer_id:cookiesCustomerId},function(err5,data5){
  
                  
              // For Latest Number of product item        
              var productItemNumber = 0;
  
              data5.products.forEach(function(doc){
                productItemNumber += parseInt(doc.qty);
              });
  
              var totalPrice = data5.total_price;
      
              res.send({
                'productitem': productItemNumber, 
                'totalAmount' : totalPrice
              });
            });
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


router.get('/removeitem',async function(req, res, next){
  
  //From Axios
  var productId = req.query.productId;
  var bookType = req.query.bookType;
  var cartProduct = req.query.cartProduct;

  //From Cookies
  var cookiesCustomerId = req.cookies.customerId;
  var productData = await ModelProduct.findById(productId).populate('ebook_id');
 

  var removeItem = cartModel.findOne({customer_id : cookiesCustomerId, _id : cartProduct});
   
  removeItem.exec(function(err,data){

    // If book type is paperbook or ebook
    if(bookType == 'paperbook' || bookType == 'ebook'){
      var existingProductIndex = data.products.findIndex(p => p._id == productId && p.book_type == bookType);
    }else{ // if book type is null (Stationary)
      var existingProductIndex = data.products.findIndex(p => p._id == productId && p.book_type == null);
    }


    var existingProduct = data.products[existingProductIndex];
    var priceToBeDeduct= 0;

   

    //Price to be deducted
    if(bookType == 'paperbook' || bookType == ''){

      var totalPrice =  productData.product_price;
      
          //If Product has discount
          if(productData.discount_percent > 0){
            var discount_price = 0;
            var discount_price = productData.discount_percent/100 * totalPrice;
            var discountedAmount = totalPrice - discount_price;
            priceToBeDeduct = parseInt(existingProduct.qty) * parseInt(discountedAmount);
           
          }else{
            priceToBeDeduct = parseInt(existingProduct.qty) * parseInt(totalPrice);
           
          }
      
   
    }else{

      var totalPrice =  productData.ebook_id.ebook_price;

          //If Product has discount
          if(productData.discount_percent > 0){
            var discount_price = 0;
            var discount_price = productData.discount_percent/100 * totalPrice;
            var discountedAmount = totalPrice - discount_price;

            priceToBeDeduct = parseInt(existingProduct.qty) * parseInt(discountedAmount);
           
          }else{
            priceToBeDeduct = parseInt(existingProduct.qty) * parseInt(totalPrice);
           
          }

    }
   
    //Price Deducted
    var newTotalPrice = parseInt(data.total_price) - priceToBeDeduct; 

    // first element removed
    data.products.splice(existingProductIndex, 1); 

    //Removing Previous Object
    var updateProduct = cartModel.updateOne({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },total_price: newTotalPrice}, {multi:true});
      updateProduct.exec(function(err5,data5){
    
        cartModel.updateOne({customer_id:cookiesCustomerId},{products:data.products}).exec(function(err1,data1){
           //For Count Latest Item Quantity Number
           cartModel.findOne({customer_id:cookiesCustomerId},function(err5,data5){
  
                  
            // For Latest Number of product item        
            var productItemNumber = 0;

            data5.products.forEach(function(doc){
              productItemNumber += parseInt(doc.qty);
            });

            var totalPrice = data5.total_price;
    
            res.send({
              'productitem': productItemNumber, 
              'totalAmount' : totalPrice
            });
          });
       
        })

        //Adding New Object After Deleting
        // cartModel.findOne({customer_id:cookiesCustomerId}).exec(function(err1,data1){
        //   data.products.forEach(function(data2){
        //     data1.products.push(data2);
        //   });
        //   data1.save(); 
        //   res.send(data1);
           
        // });
      });
    })
  });

 //Making Unique value for E-book
 function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
 } 
        
module.exports = router;