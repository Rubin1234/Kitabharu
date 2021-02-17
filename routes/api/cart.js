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
var modelCart = require('../../modules/cart'); 
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
const { rejects } = require('assert');

/* GET home page. */

//Cart View
router.get('/cart/:customerId',async function(req, res, next){
    var customerId = req.params.customerId;
    var cartProduct = await modelCart.findOne({'customer_id':customerId});
    res.send(cartProduct);
})

//Add To Book Cart
router.post('/addtobookcart', function(req, res, next) {
 
    var productId = req.body.productId;
    var booknumber = req.body.booknumber;
    var cookiesCustomerId = req.body.customerId;
 

    // var cookiesCustomerToken = req.cookies.customerToken;
    // var cookiesCustomerrName = req.cookies.customerName;
    // var cookiesCustomerId = req.cookies.customerId;
    // var cookiesCustomerEmail = req.cookies.customerEmail;

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



});


//Add to stationary Cart
router.post('/addtostationarycart',function(req,res,next){
    
    var productId = req.body.productId;
    var productNumber = req.body.productNumber;
    var cookiesCustomerId = req.body.customerId;

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
                    var updateArray = modelCart.updateOne({ _id: cart.id, "products._id": existingProduct._id}, { $set: { "products.$.qty": total_quantity } })

                    var updateCart = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 
                    
                    updateArray.exec(function(err3,data3){
                        updateCart.exec(function(err4,data4){
                        //For Count Latest Item Quantity Number
                            modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
                                var totalPrice = data5.total_price;

                                // For Latest Number of product item        
                                var productItemNumber = 0;
                                data5.products.forEach(function(doc){
                                    productItemNumber = parseInt(productItemNumber) + parseInt(doc.qty);
                                });

                                res.send({
                                    'productitem': productItemNumber, 
                                    'cart': cart,
                                    'totalAmount': totalPrice
                                });
                            });
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
        

});

//Add Item in cart
router.get('/cart/item/add',async function(req, res, next){
    var totalQuantity = req.body.totalQuantity;
    var productId = req.body.productId;
    var cookiesCustomerId = req.body.customerId;
    var bookType = req.body.bookType;


    var productData = await ModelProduct.findById(productId);
  
    modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){
   
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
     

          var updateArray = modelCart.updateOne( 
            { _id: cart.id, "products._id": existingProduct._id}, 
            { $set: { "products.$.qty": total_quantity } }
          )

            //  //Udate Quantity in Product  Array in cart
            //  var updateArray = modelCart.update(
            //   {customer_id:cookiesCustomerId, 
            //   products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
            //   { $set: { "products.$.qty":  total_quantity }}
            // )

            //Update Price
            var updateTotalPrice = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

            updateArray.exec(function(err,data){
          

              updateTotalPrice.exec(function(err1,data1){

                modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){

        
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

//Subtract Item in cart
router.get('/cart/item/sub',async function(req, res, next){

    var totalQuantity = req.body.totalQuantity;
    var productId = req.body.productId;
    var cookiesCustomerId = req.body.customerId;
    var bookType = req.body.bookType;

    var productData = await ModelProduct.findById(productId);

    modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,cart){

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

        var updateArray = modelCart.updateOne( 
          { _id: cart.id, "products._id": existingProduct._id}, 
          { $set: { "products.$.qty": total_quantity } }
        )
        // var updateArray = modelCart.updateOne(
        //   {customer_id:cookiesCustomerId, 
        //   products:{ $elemMatch :{"book_type":bookType, "_id": existingProduct._id}}},
        //   { $set: { "products.$.qty":  total_quantity }}
        // )

        //Update Price
        var updateTotalPrice = modelCart.findOneAndUpdate({customer_id:cookiesCustomerId},{total_price : cart.total_price}); 

        updateArray.exec(function(err,data){
          updateTotalPrice.exec(function(err1,data1){
            modelCart.findOne({customer_id:cookiesCustomerId},function(err5,data5){
  
                  
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
    // var updateArray = modelCart.updateOne(
    //   {customer_id:cookiesCustomerId, 
    //   products:{ $elemMatch :{"book_type": bookType, "_id": productId}}},
    //   { $set: { "products.$.qty":  totalQuantity }}
    // )

 
});

//Cart Item Remove
router.get('/cart/item/removeitem',async function(req, res, next){
  
    //From Axios
    var productId = req.body.productId;
    var bookType = req.body.bookType;
    var cartId = req.body.cartId;
    var cookiesCustomerId = req.body.customerId;

    var productData = await ModelProduct.findById(productId).populate('ebook_id');
   
  
    var removeItem = modelCart.findOne({customer_id : cookiesCustomerId, _id : cartId});
     
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
      var updateProduct = modelCart.updateOne({'customer_id':cookiesCustomerId},{ $pull : { 'products': {} },total_price: newTotalPrice}, {multi:true});
        updateProduct.exec(function(err5,data5){
      
            modelCart.updateOne({customer_id:cookiesCustomerId},{products:data.products}).exec(function(err1,data1){
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
                'totalAmount' : totalPrice
              });
            });
         
          })
  
          //Adding New Object After Deleting
          // modelCart.findOne({customer_id:cookiesCustomerId}).exec(function(err1,data1){
          //   data.products.forEach(function(data2){
          //     data1.products.push(data2);
          //   });
          //   data1.save(); 
          //   res.send(data1);
             
          // });
        });
      })
});


          
module.exports = router;