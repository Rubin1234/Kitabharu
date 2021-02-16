var app = require('express');
var path = require('path');
const https = require("https");
var url = require('url');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug'); 
const axios = require('axios');      
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
const reviewModel = require('../../modules/review');
var settingModel = require('../../modules/setting'); 

/* GET home page. */


  router.get('/', function(req, res, next) {
   
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    if(fullUrl.includes('q=su')){
      var object_url = url.parse(fullUrl, true);

      var orderID = object_url.query.oid;
      var amount = object_url.query.amt;
      var refId = object_url.query.refId;
    
      var fullname = object_url.query.fullname;
  

      $url = "https://uat.esewa.com.np/epay/transrec";
      
      data = {
        'amt': amount,
        'scd': 'EPAYTEST',
        'rid': refId,
        'pid':orderID,
    }
  
      axios
      .post('https://uat.esewa.com.np/epay/transrec?amt='+amount+'&scd=EPAYTEST&rid='+refId+'&pid='+orderID)
      .then((res1) => {
   
        var response = res1.data;
      
        var result = response.includes("Success");
        if(result){
          req.flash('success','Thank you for purchasing our products.');
          res.redirect('/');
       
        }else{
          console.log('IT is a failure');
         
        }
      })
      .catch((error) => {
        console.error(error)
      })
   
    }

  

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
      
        const promises = data.map((item,index) => new Promise((resolve,reject) => {
          var reviewData = reviewModel.find({product_slug : item.slug});
          reviewData.exec(function(err1,newArrivalData){
       
              resolve(newArrivalData);
          });
        }));
  
        Promise.all(promises)
        .then(allArray => {
  
          //FOr NEw Arrival RAting IN Front View
          var newArrivalReviewArray = [];
          for(var i=0; i<=allArray.length-1; i++){
  
            var average = 0;
            var totalStar = 0;
            var actualValue = 0;
            var ratingArray = [];
    
            allArray[i].forEach(function(date){
              totalStar += parseInt(date.rating_star);
            });
    
            var totalRatingUser =  allArray[i].length;
    
            if(totalRatingUser > 0){
              average = totalStar/totalRatingUser;
              average = average.toFixed(1);
            }
       
            var roundOffValue = parseInt(average);
            
            actualValue = average - roundOffValue
  
            ratingArray.push(average);
            ratingArray.push(actualValue);
          
            
            newArrivalReviewArray.push(ratingArray);
          }
          
          ebooks.exec(function(err0,data0){
  
            //For Rating of Ebook for Frontend
            const promises1 = data0.map((item1,index1) => new Promise((resolve,reject) => {
              var reviewData1 = reviewModel.find({product_slug : item1.slug});
              reviewData1.exec(function(err2,ebooksData){
                  resolve(ebooksData);
              });
            }));
  
            Promise.all(promises1)
            .then(allArray1 => {
  
              //FOr NEw Arrival RAting IN Front View
              var ebookReviewArray = [];
              for(var i=0; i<=allArray1.length-1; i++){
  
                var average1 = 0;
                var totalStar1 = 0;
                var actualValue1 = 0;
                var ratingArray1 = [];
    
                allArray1[i].forEach(function(date1){
                  totalStar1 += parseInt(date1.rating_star);
                });
    
                var totalRatingUser1 =  allArray1[i].length;
    
                if(totalRatingUser1 > 0){
                  average1 = totalStar1/totalRatingUser1;
                  average1 = average1.toFixed(1);
                }
       
                var roundOffValue1 = parseInt(average1);
            
                actualValue1 = average1 - roundOffValue1;
  
                ratingArray1.push(average1);
                ratingArray1.push(actualValue1);
          
            
                ebookReviewArray.push(ratingArray1);
              }
  
              books.exec(function(err1,data1){
                //Rating For Book in frontend
                const promises2 = data1.map((item2,index2) => new Promise((resolve,reject) => {
                  var reviewData2 = reviewModel.find({product_slug : item2.slug});
                  reviewData2.exec(function(err3,booksData){
               
                    resolve(booksData);
                  });
                }));
  
                Promise.all(promises2)
                .then(allArray2 => {
  
                  //FOr NEw Arrival RAting IN Front View
                  var bookReviewArray = [];
                  for(var i=0; i<=allArray2.length-1; i++){
  
                    var average2 = 0;
                    var totalStar2 = 0;
                    var actualValue2 = 0;
                    var ratingArray2 = [];
  
                    allArray2[i].forEach(function(date2){
                      totalStar2 += parseInt(date2.rating_star);
                    });
    
                  var totalRatingUser2 =  allArray2[i].length;
    
                if(totalRatingUser2 > 0){
                  average2 = totalStar2/totalRatingUser2;
                  average2 = average2.toFixed(1);
                }
       
                var roundOffValue2 = parseInt(average2);
            
                actualValue2 = average2 - roundOffValue2;
  
                ratingArray2.push(average2);
                ratingArray2.push(actualValue2);
        
                bookReviewArray.push(ratingArray2);
              }
  
  
                stationaryProducts.exec(function(err2,data2){
  
                  //Rating For Book in frontend
                  const promises3 = data2.map((item3,index3) => new Promise((resolve,reject) => {
                    var reviewData3 = reviewModel.find({product_slug : item3.slug});
                    reviewData3.exec(function(err4,stationaryData){
                 
                      resolve(stationaryData);
                    });
                  }));
  
                  Promise.all(promises3)
                  .then(allArray3 => {
  
                         //FOr NEw Arrival RAting IN Front View
                  var stationaryReviewArray = [];
                  for(var i=0; i<=allArray3.length-1; i++){
  
                    var average3 = 0;
                    var totalStar3 = 0;
                    var actualValue3 = 0;
                    var ratingArray3 = [];
  
                    allArray3[i].forEach(function(date3){
                      totalStar3 += parseInt(date3.rating_star);
                    });
    
                  var totalRatingUser3 =  allArray3[i].length;
    
                if(totalRatingUser3 > 0){
                  average3 = totalStar3/totalRatingUser3;
                  average3 = average3.toFixed(1);
                }
       
                var roundOffValue3 = parseInt(average3);
            
                actualValue3 = average3 - roundOffValue3;
  
                ratingArray3.push(average3);
                ratingArray3.push(actualValue3);
        
                stationaryReviewArray.push(ratingArray3);
              }
  
              var settingData = settingModel.findOne({});
              settingData.exec(function(errr,dataa){
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
                          newArrivalReviewArray,
                          ebookReviewArray,
                          bookReviewArray,
                          stationaryReviewArray,
                          setting : dataa
                        }); 
                      });
                    });
                  })
                  });
                }); 
              }); 
              });
            });
            });
          });
        });
    })
   





   
 


  
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
                    total_quantity =  parseInt(existingProduct.qty) + 1;
                  }else{
                    total_quantity =  parseInt(existingProduct.qty) + parseInt(productNumber);
                  }

                  
                  //If Order Item is 0
                  if(productNumber == undefined){
                    var totalPrice =  data.product_price;
                    
                    //For Discounted Products
                    if(data.discount_percent > 0){
                      var discount_price = 0;
                      var discount_price = data.discount_percent/100 * totalPrice;
                      var discountedAmount = totalPrice - discount_price;
            
                      cart.total_price += parseInt(discountedAmount);

                    }else{
                      cart.total_price += parseInt(totalPrice);
                    }
                   }else{
                    var totalPrice = productNumber * data.product_price;
                    if(data.discount_percent > 0){
                      var discount_price = 0;
                      var discount_price = data.discount_percent/100 * totalPrice;
                      var discountedAmount = totalPrice - discount_price;
             
                      cart.total_price += parseInt(discountedAmount);
    
                    }else{
                      cart.total_price += parseInt(totalPrice);
                    }
                   }

                  //Udate Product Array in cart
                  var updateArray = modelCart.updateOne( 
                    { _id: cart.id, "products._id": existingProduct._id}, 
                    { $set: { "products.$.qty": total_quantity } }
                  )

                  var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                  total_price :  cart.total_price
                  }); 
                  
        
                  updateArray.exec(function(err3,data3){
                    updateCart.exec(function(err4,data4){
                       //For Count Latest Item Quantity Number
                       modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                        console.log(data5);

                        var totalPrice = data5.total_price;

                        // For Latest Number of product item        
                        var productItemNumber = 0;
                        data5.products.forEach(function(doc){
                          productItemNumber = parseInt(productItemNumber) + parseInt(doc.qty);
                        });

                        console.log(productItemNumber); 
                        console.log('productItemNumber'); 
  
                        res.send({
                          'productitem': productItemNumber, 
                          'cart': cart,
                          'totalAmount': totalPrice
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



                //If Order item is 1
                if(productNumber == undefined){

                  var totalPrice = savedata.qty * data.product_price;
                  
                  if(data.discount_percent > 0){
                    var discount_price = 0;
                    var discount_price = data.discount_percent/100 * totalPrice;
                    var discountedAmount = totalPrice - discount_price;
           
                    cart.total_price += parseInt(discountedAmount);

                  }else{
                    cart.total_price += parseInt(totalPrice);
                  }

                 }else{

                    //If Order item is greater than 1
                  var totalPrice = savedata.qty * data.product_price;

                  if(data.discount_percent > 0){
                    var discount_price = 0;
                    var discount_price = data.discount_percent/100 * totalPrice;
                    var discountedAmount = totalPrice - discount_price;
           
                    cart.total_price += parseInt(discountedAmount);

                  }else{
                    cart.total_price += parseInt(totalPrice);
                  }
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
                        console.log(doc)
                        productItemNumber += parseInt(doc.qty);
                      });

                      var totalPrice = data5.total_price;
              
                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                        'totalAmount' : totalPrice
                      });
                    });
                  });
                }
              }
              else
              { 
                //If Cart is empty
        
                var savedata = data.toObject();

                if(productNumber == undefined){
                  savedata.qty = 1;
                }else{
                  savedata.qty = productNumber;
                }

                var totalPrice = savedata.qty * data.product_price;

                if(data.discount_percent > 0){
                  var discount_price = 0;
                  var discount_price = data.discount_percent/100 * totalPrice;
                  var discountedAmount = totalPrice - discount_price;
          
                  var saveCart = new modelCart({
                    total_price : parseInt(discountedAmount),
                    customer_id : cookiesCustomerId
                  });
  
                }else{
                      
                  var saveCart = new modelCart({
                    total_price :  parseInt(data.product_price),
                    customer_id : cookiesCustomerId
                  });
  
                }
           

                saveCart.products.push(savedata);
            
                saveCart.save();

          
                  res.send({
                    'productitem': savedata.qty, 
                    'cart': cart,
                    'totalAmount' : saveCart.total_price
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
        ModelProduct.findById(productId).populate('book_attribute').exec(function(err,data)
        {
          modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

            var total_quantity = 0;
            //IF Cart is empty
            if(cart != null){
              const existingProductIndex = cart.products.findIndex(p => p._id == productId && p.book_type == 'paperbook');  //to check product is existing in cart
            
              //If Cart has same product
              if(existingProductIndex >= 0){
                const existingProduct = cart.products[existingProductIndex];
          
                if(booknumber == undefined){
                  total_quantity =  parseInt(existingProduct.qty) + 1;
                }else{
                  total_quantity =  parseInt(existingProduct.qty) + parseInt(booknumber);
                }

               if(booknumber == undefined){

                  var totalPrice =  data.product_price;

                  //For Discounted Products
                    if(data.discount_percent > 0){
                      var discount_price = 0;
                      var discount_price = data.discount_percent/100 * totalPrice;
                      var discountedAmount = totalPrice - discount_price;
            
                      cart.total_price += parseInt(discountedAmount);

                    }else{
                      cart.total_price += parseInt(totalPrice);
                    }
                    
                // total =  parseInt(cart.total_price) + parseInt(totalPrice);
              
               }else{
                var totalPrice = booknumber * data.product_price;

                if(data.discount_percent > 0){
                  var discount_price = 0;
                  var discount_price = data.discount_percent/100 * totalPrice;
                  var discountedAmount = totalPrice - discount_price;
         
                  cart.total_price += parseInt(discountedAmount);

                }else{
                  cart.total_price += parseInt(totalPrice);
                }
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

                      var totalPrice = data5.total_price;
                     

                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                        'totalAmount' : totalPrice
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
          
                  //If book order is 0
                if(booknumber == undefined){    
                  var totalPrice = savedata.qty * data.product_price;
          
                  if(data.discount_percent > 0){
                    var discount_price = 0;
                    var discount_price = data.discount_percent/100 * totalPrice;
                    var discountedAmount = totalPrice - discount_price;
           
                    cart.total_price += parseInt(discountedAmount);

                  }else{
                    cart.total_price += parseInt(totalPrice);
                  }
                  
                 }else{

                  //If book order greater than 0
                  var totalPrice = savedata.qty * data.product_price;
                  if(data.discount_percent > 0){
                    var discount_price = 0;
                    var discount_price = data.discount_percent/100 * totalPrice;
                    var discountedAmount = totalPrice - discount_price;
           
                    cart.total_price += parseInt(discountedAmount);

                  }else{
                    cart.total_price += parseInt(totalPrice);
                  }

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

                    //For Count Latest Item Quantity Number
                    modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                                  
                                    
                      // For Latest Number of product item        
                      var productItemNumber = 0;

                      data5.products.forEach(function(doc){
                        productItemNumber += parseInt(doc.qty);
                      });

                      var totalPrice = data5.total_price;

                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                        'totalAmount' : totalPrice
                      });
                    });
                });
              }
            }
            else
            { 

              var savedata = data.toObject();
              savedata.book_type = 'paperbook';
              
              if(booknumber == undefined){
                savedata.qty = 1;
              }else{
                savedata.qty = booknumber;
              }

              //If book order is 0
              var totalPrice = savedata.qty * data.product_price;
              
              if(data.discount_percent > 0){
                var discount_price = 0;
                var discount_price = data.discount_percent/100 * totalPrice;
                var discountedAmount = totalPrice - discount_price;
        
                var saveCart = new modelCart({
                  total_price : parseInt(discountedAmount),
                  customer_id : cookiesCustomerId
                });

              }else{
                    
                var saveCart = new modelCart({
                  total_price :  parseInt(data.product_price),
                  customer_id : cookiesCustomerId
                });

              }
                
              saveCart.products.push(savedata);
              saveCart.save();

                res.send({
                  'productitem': savedata.qty, 
                  'cart': cart,
                  'totalAmount' : saveCart.total_price
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
            var total_amount = 0;
            //IF Cart is empty
            if(cart != null){
              const existingProductIndex = cart.products.findIndex(p => p._id == productId &&  p.book_type == 'ebook');  //to check product is existing in cart
     
       

              //If Cart has same product
              if(existingProductIndex >= 0){
               
                const existingProduct = cart.products[existingProductIndex];
                total_quantity =  parseInt(existingProduct.qty) + 1;
                
                
                var updateArray = modelCart.update( 
                  {customer_id:cookiesCustomerId, 
                    products:{ $elemMatch :{"book_type": "ebook", "_id": existingProduct._id}}},
                    { $set: { "products.$.qty":  total_quantity }}
                )
          
                var totalPrice = data.ebook_id.ebook_price;
          
                //If Product has discount
                if(data.discount_percent > 0){
                  var discount_price = 0;
                  var discount_price = data.discount_percent/100 * totalPrice;
                  var discountedAmount = totalPrice - discount_price;
         
                  var total_amount = parseInt(cart.total_price) + parseInt(discountedAmount);

                }else{
                  var total_amount = parseInt(cart.total_price) + parseInt(data.ebook_id.ebook_price);
                }
                
                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                total_price : total_amount
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
                      
                      var totalPrice = data5.total_price;

                      res.send({
                        'productitem': productItemNumber, 
                        'cart': cart,
                        'totalAmount' : totalPrice
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
    
                cart.products.push(savedata);
                cart.save();

                var totalPrice = data.ebook_id.ebook_price;
          
                //If Product has discount
                if(data.discount_percent > 0){
                  var discount_price = 0;
                  var discount_price = data.discount_percent/100 * totalPrice;
                  var discountedAmount = totalPrice - discount_price;
         
                  var total_amount = parseInt(cart.total_price) + parseInt(discountedAmount);

                }else{
                  var total_amount = parseInt(cart.total_price) + parseInt(data.ebook_id.ebook_price);
                }

                 
                var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{
                  total_price :  total_amount
                });


                updateCart.exec(function(err4,data4){

                  //For Count Latest Item Quantity Number
                  modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){

                    // For Latest Number of product item        
                    var productItemNumber = 0;

                    data5.products.forEach(function(doc){
                      productItemNumber += parseInt(doc.qty);
                    });

                    var totalPrice = data5.total_price;
                   

                    res.send({
                      'productitem': productItemNumber, 
                      'cart': cart,
                      'totalAmount' : totalPrice
                      });
                  });
                });

              }

            }
            else
            { 

              var savedata = data.toObject();
              savedata.book_type = 'ebook';
              savedata.qty = 1;

              //If book order is 0
              var totalPrice = data.ebook_id.ebook_price;
    
              if(data.discount_percent > 0){
                var discount_price = 0;
                var discount_price = data.discount_percent/100 * totalPrice;
                var discountedAmount = totalPrice - discount_price;
        
                var saveCart = new modelCart({
                  total_price : parseInt(discountedAmount),
                  customer_id : cookiesCustomerId
                });

              }else{
                    
                var saveCart = new modelCart({
                  total_price :  parseInt(data.ebook_id.ebook_price),
                  customer_id : cookiesCustomerId
                });

              }

              saveCart.products.push(savedata);
              saveCart.save();     
                res.send({
                  'productitem': savedata.qty, 
                  'cart': cart,
                  'totalAmount' : saveCart.total_price
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
            
            res.send({
              'productitem': productItemNumber, 
              'cart': cart,
              'totalAmount': 0,
            });

          }else{

            var productItemNumber = 0;
            cart.products.forEach(function(doc){
              productItemNumber += parseInt(doc.qty);
            });

         
           
            res.send({
              'productitem': productItemNumber, 
              'cart': cart,
              'totalAmount': cart.total_price,
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
      res.send(cart);
    }else{

      modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
        res.send(cart);
      });
    }
  });



  router.get('/autocomplete', function(req,res,next){

    var regex = new RegExp(req.query["term"],'i');


    var productFilter = ModelProduct.find({product_name:regex},{'product_name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    
    productFilter.exec(function(err,data){

      var result = [];

      if(!err){
        if(data && data.length && data.length > 0){
          data.forEach(products=>{
            let obj = {
              id : products._id,
              label : products.product_name
            };
            result.push(obj);
          });
        }
        res.jsonp(result);
      }
    });
  });


  router.post('/search', function(req,res,next){
      
    var cookiesCustomerToken = req.cookies.customerToken;
    var cookiesCustomerrName = req.cookies.customerName;
    var cookiesCustomerId = req.cookies.customerId;
    var cookiesCustomerEmail = req.cookies.customerEmail;


    var bookSubcategories = SubCategoryModel.find({category_type_id : ['5fba1ad7fae27545a03341fe','5fc86fabe5825658544dfa06']});
    var stationarySubcategories = SubCategoryModel.find({category_type_id : ['5fc871bce5825658544dfa0c','5fba1b3afae27545a0334206']});
    var ebookSubcategories = ModelProduct.find({book_type : ['ebook','both']}).populate('subcategory_id');

    if(req.body.headersearch != ''){

    var regex = new RegExp(req.body.headersearch,'i');

    var productFilter = ModelProduct.find({product_name:regex},{'product_name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    
    productFilter.exec(function(err,data){
      const promises = data.map((item,index) => new Promise((resolve,reject) => {
        var productFilter = ModelProduct.findOne({_id:item._id}).populate('book_attribute').populate('stationary_attribute');
        productFilter.exec(function(err1,data1){
            resolve(data1);
        })
      }));

      Promise.all(promises)
      .then(allArray => {  
        // var records = util.inspect(allArray, false, null, true /* enable colors */);  
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

              res.render('frontend/searchpage',{
                bookSubcategories:data1,
                stationarySubcategories:data2,
                ebookSubcategories:uniqueValueEbook,
                cookiesCustomerToken,
                cookiesCustomerrName,
                cookiesCustomerId,
                cookiesCustomerEmail,
                searchedProducts : allArray,
                searchValue : req.body.headersearch,
                setting : dataa
              }); 
            }); 
            });
          });
        });
      });
    });
  }else{
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

      allArray = [];

          res.render('frontend/searchpage',{
            bookSubcategories:data1,
            stationarySubcategories:data2,
            ebookSubcategories:uniqueValueEbook,
            cookiesCustomerToken,
            cookiesCustomerrName,
            cookiesCustomerId,
            cookiesCustomerEmail,
            searchedProducts : allArray,
            searchValue : req.body.headersearch,
            setting: dataa
          }); 
          }); 
        });
      });
    });

  }


  });


    //Making Unique value for E-book
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }



module.exports = router;