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
var modelCart = require('../../modules/cart'); 
var stationaryAttributesModel = require('../../modules/stationaryAttributes'); 
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
const cartModel = require('../../modules/cart');

/* GET home page. */


  router.get('/', function(req, res, next) {
 
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');
    
    

    var newArrival = ModelProduct.find({book_type : ['paperbook','both','ebook']}).sort({_id:-1}).populate('book_attribute').limit(10);

    var books = ModelProduct.find({book_type : ['paperbook','both']}).populate('book_attribute').limit(10);
    var ebooks = ModelProduct.find({book_type : ['ebook','both']}).populate('book_attribute').populate('ebook_id').limit(10);
    //  var productModel = ModelProduct.find({book_type : ['paperbook','both']}).populate('book_attribute');

    var stationaryProducts = ModelProduct.find({category_id: ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']}).populate('book_attribute').populate('stationary_attribute').limit(10);

    newArrival.exec(function(err,data){
      ebooks.exec(function(err0,data0){
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
  
                  res.render('frontend/index',{
                    newArrival:data,
                    ebooks:data0,
                    books:data1,
                    stationary:data2,
                    bookSubcategories:data3,
                    stationarySubcategories:data4,
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
        });
    });

  
  });

  

          
  router.get('/addtocart', function(req,res,next){

    var productId = req.query.productId;
    var productNumber = req.query.productNumber;

  

    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
      res.send('nocookies');
    }else{  
          ModelProduct.findById(productId).populate('book_attribute').exec(function(err,data){
            modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
            
              var total_quantity = 0;
              //IF Cart is empty
              if(cart != null){
                const existingProductIndex = cart.products.findIndex(p => p._id == productId);  //to check product is existing in cart
            
                //If Cart has same product
                if(existingProductIndex >= 0){
                  const existingProduct = cart.products[existingProductIndex];

                  if(productNumber == undefined){
                    total_quantity =  existingProduct.qty + 1;
                  }else{
                    total_quantity =  parseInt(existingProduct.qty) + parseInt(productNumber);
                  }
                  


                  if(productNumber == undefined){
                    var totalPrice =  data.product_price;
                    
                    // total =  parseInt(cart.total_price) + parseInt(totalPrice);
                    cart.total_price += parseInt(totalPrice);
                   }else{
                    var totalPrice = productNumber * data.product_price;
                    // total =  parseInt(cart.total_price) + parseInt(data.product_price);
                    cart.total_price += parseInt(totalPrice);
                   }

                  //Udate Product Array in cart
                  var updateArray = modelCart.updateOne( 
                    { _id: cart.id, "products._id": existingProduct._id}, 
                    { $set: { "products.$.qty": total_quantity } }
                  )

                  var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                  total_price :  cart.total_price
                  }); 
                    
                  
                  //For Number of product item
                  var productItemNumber = 0;

                  cart.products.forEach(function(doc){
                    productItemNumber += parseInt(doc.qty);
                  });
        
                  updateArray.exec(function(err3,data3){
                    updateCart.exec(function(err4,data4){
                       //For Count Latest Item Quantity Number
                       modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                  
                        // For Latest Number of product item        
                        var productItemNumber = 0;
                        data5.products.forEach(function(doc){
                          productItemNumber += parseInt(doc.qty);
                        });
  
                        res.send({
                          'productitem': productItemNumber, 
                          'cart': cart,
                        });
                      });;
                      });
                  });
                }
                else
                { 

                  //If card has other different product
                  var savedata = data.toObject();
                  console.log(productNumber);
                  
                if(productNumber == undefined){

               
                  savedata.qty = 1;
                }else{
                  savedata.qty = productNumber;
                }
                
              

                  cart.products.push(savedata);
                  cart.save();

                if(productNumber == undefined){
                  var totalPrice = savedata.qty * data.product_price;
                  cart.total_price += parseInt(totalPrice);
                 }else{
                  var totalPrice = savedata.qty * data.product_price;
                  cart.total_price += parseInt(totalPrice);
                  // cart.total_price += parseInt(data.product_price);
                 }

                  var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                    total_price :  cart.total_price
                  });

                  updateCart.exec(function(err1,data2){

                  
   //For Count Latest Item Quantity Number
                    modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                  
                      // For Latest Number of product item        
                      var productItemNumber = 0;

                      data5.products.forEach(function(doc){
                        productItemNumber += parseInt(doc.qty);
                      });

                      console.log(productItemNumber);
                      updateCart
                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                      });
                    });
                  });
                }
              }
              else
              { 
                //If Cart is empty
                var saveCart = new modelCart({
                    total_price : parseInt(data.product_price),
                    customer_id : cookiesCustomerId
                });

                var savedata = data.toObject();

                if(productNumber == undefined){
                  savedata.qty = 1;
                }else{
                  savedata.qty = productNumber;
                }
           

                saveCart.products.push(savedata);
            
                saveCart.save();

          
                  res.send({
                    'productitem': savedata.qty, 
                    'cart': cart,
                  });
              }
            }); 
          });    
        }
  });



    router.get('/addtobookcart',function(req,res,next){

      var productId = req.query.productId;
      var booknumber = req.query.booknumber;
 
      var cookiesCustomerToken = req.cookies.customerToken;
      var cookiesCustomerrName = req.cookies.customerName;
      var cookiesCustomerId = req.cookies.customerId;
      var cookiesCustomerEmail = req.cookies.customerEmail;
  
      //If user not signed in
      if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        res.send('nocookies');
      }else{ 

        //If signed In
        ModelProduct.findById(productId).populate('book_attribute').exec(function(err,data){
          modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

            var total_quantity = 0;
            //IF Cart is empty
            if(cart != null){
              const existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == 'paperbook');  //to check product is existing in cart
            
              //If Cart has same product
              if(existingProductIndex >= 0){
                const existingProduct = cart.products[existingProductIndex];

                if(booknumber == undefined){
                  total_quantity =  existingProduct.qty + 1;
                }else{
                  total_quantity =  parseInt(existingProduct.qty) + parseInt(booknumber);
                }

           
               if(booknumber == undefined){
                var totalPrice =  data.product_price;
                
                // total =  parseInt(cart.total_price) + parseInt(totalPrice);
                cart.total_price += parseInt(totalPrice);
               }else{
                var totalPrice = booknumber * data.product_price;
                // total =  parseInt(cart.total_price) + parseInt(data.product_price);
                cart.total_price += parseInt(totalPrice);
               }

  
         
                  //Udate Quantity in Product  Array in cart
                var updateArray = modelCart.update(
                  {customer_id:cookiesCustomerId, 
                  products:{ $elemMatch :{"book_type": "paperbook", "_id": existingProduct._id}}},
                  { $set: { "products.$.qty":  total_quantity }}
        
                )


                //Update Price
                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 
            
                updateArray.exec(function(err3,data3){
                  var records = util.inspect(data3, false, null, true /* enable colors */);
  
                  
                  updateCart.exec(function(err4,data4){
                    
                    //For Count Latest Item Quantity Number
                    modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                  
                      // For Latest Number of product item        
                      var productItemNumber = 0;
                      data5.products.forEach(function(doc){
                        productItemNumber += parseInt(doc.qty);
                      });

                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                      });
                    });
                  });
                });
              }
              else
              { 
                //If card has other different product
                var savedata = data.toObject();
                savedata.book_type = 'paperbook';
                if(booknumber == undefined){
                  savedata.qty = 1;
                }else{
                  savedata.qty = booknumber;
                }
               
                cart.products.push(savedata);
                cart.save();

                if(booknumber == undefined){
                  var totalPrice = savedata.qty * data.product_price;
                  cart.total_price += parseInt(totalPrice);
                 }else{
                  var totalPrice = savedata.qty * data.product_price;
                  cart.total_price += parseInt(totalPrice);
                  // cart.total_price += parseInt(data.product_price);
                 }
          
                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                  total_price :  cart.total_price
                });

                var productItemNumber = 0;
                cart.products.forEach(function(doc){
                  productItemNumber += parseInt(doc.qty);
                });

                updateCart.exec(function(err4,data4){
                  res.send({
                    'productitem': productItemNumber, 
                    'cart': cart,
                  });
                });
              }
            }
            else
            { 
              //If Cart is empty
              var saveCart = new modelCart({
                  total_price : parseInt(data.product_price),
                  customer_id : cookiesCustomerId
              });

              var savedata = data.toObject();
              savedata.book_type = 'paperbook';
              
              if(booknumber == undefined){
                savedata.qty = 1;
              }else{
                savedata.qty = booknumber;
              }
           
              saveCart.products.push(savedata);
              saveCart.save();
                res.send({
                  'productitem': savedata.qty, 
                  'cart': cart,
                });
            }
          }); 
        });    
      }
    });


    
    router.get('/addtoebookcart',function(req,res,next){

      var productId = req.query.productId;


      var cookiesCustomerToken = req.cookies.customerToken;
      var cookiesCustomerrName = req.cookies.customerName;
      var cookiesCustomerId = req.cookies.customerId;
      var cookiesCustomerEmail = req.cookies.customerEmail;
  
      if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
        res.send('nocookies');
      }else{ 
        ModelProduct.findById(productId).populate('book_attribute').populate('ebook_id').exec(function(err,data){
          modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
         
            var total_quantity = 0;
            //IF Cart is empty
            if(cart != null){
              const existingProductIndex = cart.products.findIndex(p => p._id == productId &&  p.book_type == 'ebook');  //to check product is existing in cart
              console.log('ebook cart not null');
       

              //If Cart has same product
              if(existingProductIndex >= 0){
               
                const existingProduct = cart.products[existingProductIndex];
                total_quantity =  existingProduct.qty + 1;
                
                
                var updateArray = modelCart.update( 
                  {customer_id:cookiesCustomerId, 
                    products:{ $elemMatch :{"book_type": "ebook", "_id": existingProduct._id}}},
                    { $set: { "products.$.qty":  total_quantity }}
                )

                cart.total_price += parseInt(data.ebook_id.ebook_price);

                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                total_price :  cart.total_price
                }); 
            
                updateArray.exec(function(err3,data3){
                  updateCart.exec(function(err4,data4){

                    //For Count Latest Item Quantity Number
                    modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
            
                       // For Number of product item        
                        var productItemNumber = 0;
                        data5.products.forEach(function(doc){
                          productItemNumber += parseInt(doc.qty);
                        });
                      
                    res.send({
                      'productitem': productItemNumber, 
                      'cart': cart,
                    });
                    });
                    });
                });
              }
              else
              { 

                //If card has other different product
                var savedata = data.toObject();

                savedata.book_type = 'ebook';
                savedata.qty = 1;

                console.log('No existing ebook product');
    
                cart.products.push(savedata);
                cart.save();

                cart.total_price += parseInt(data.ebook_id.ebook_price);

                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                  total_price :  cart.total_price
                });

                var productItemNumber = 0;
                cart.products.forEach(function(doc){
                  productItemNumber += parseInt(doc.qty);
                });

                updateCart.exec(function(err4,data4){
                  res.send({
                    'productitem': productItemNumber, 
                    'cart': cart,
                  });
                });

              }

            }
            else
            { 
      
              //If Cart is empty
              var saveCart = new modelCart({
                  total_price : parseInt(data.ebook_id.ebook_price),
                  customer_id : cookiesCustomerId
              });

              var savedata = data.toObject();
              savedata.book_type = 'ebook';
              
              savedata.qty = 1;          
              saveCart.products.push(savedata);
          
              saveCart.save();     
                res.send({
                  'productitem': savedata.qty, 
                  'cart': cart,
                });
            }
          }); 
        });    
      }
    });


  
  router.get('/viewcart', function(req,res,next){
    
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;

    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
      res.send({
        'productitem': 0, 
       
      });
    }else{
     modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
   
          if(cart == null){
            var productItemNumber = 0;
            console.log(productItemNumber);
            res.send({
              'productitem': productItemNumber, 
              'cart': cart,
            });

          }else{

            var productItemNumber = 0;
            cart.products.forEach(function(doc){
              productItemNumber += parseInt(doc.qty);
            });

         
           
            res.send({
              'productitem': productItemNumber, 
              'cart': cart,
            });
          }
      });
    }  
  });



  router.get('/mycart',async function(req,res,next){
 
      var cookiesCustomerToken = req.cookies.customerToken;
      var cookiesCustomerrName = req.cookies.customerName;
      var cookiesCustomerId = req.cookies.customerId;
      var cookiesCustomerEmail = req.cookies.customerEmail;
      
    if(cookiesCustomerEmail == undefined && cookiesCustomerId == undefined && cookiesCustomerrName == undefined && cookiesCustomerToken == undefined){
      
      cart = "No Product Added.";
      console.log(cart);
      res.send(cart);
    }else{

      modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
        res.send(cart);
      });
    }
  });


    //Making Unique value for E-book
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }



module.exports = router;