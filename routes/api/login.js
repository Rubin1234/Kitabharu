var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
var jwt = require('jsonwebtoken');

var router = app.Router();

var categoryModel = require('../../modules/categories');
var SubCategoryModel = require('../../modules/subcategories');
var brandModel = require('../../modules/brand');
var bookAttributesModel = require('../../modules/bookAttributes'); 
var productImagesModel = require('../../modules/product_images'); 
const util = require('util');
const customerModel = require('../../modules/customers');
const ModelProduct = require('../../modules/product');
const subCategoryModel = require('../../modules/subcategories');
const { populate, db } = require('../../modules/categories');
const { rejects } = require('assert');

/* GET home page. */

    router.post('/login',function(req, res, next){
        
    var email = req.body.login_email;
    var password = req.body.login_password;

    var checkEmail = customerModel.findOne({email:email});
 
    checkEmail.exec(function(err,data){
    
      if(err) throw err;
      if(data != null){

        var getCustomerId = data._id;
        var getemail = data.email;
        var username = data.user_name;
        var getPassword = data.password;
       
        if(data.status == "Active"){
          if(bcrypt.compareSync(password,getPassword)){
          
            var token = jwt.sign({ customerId: getCustomerId }, 'loginToken');
            res.cookie('customerToken',token)
            res.cookie('customerName',username);
            res.cookie('customerId',getCustomerId);
            res.cookie('customerEmail',getemail);

            res.send({
                'token' : token,
                'name' : username,
                'email' : email,
                'customer_id' : getCustomerId,
               
            });
          }else{
            res.send('Invalid Credentials. Please Re-enter username and password.!!!');
          }
      }else{
        res.send('Invalid Credentials. Please Re-enter username and password.!!!');
      }
      }else{
        res.send('Invalid Credentials. Please Re-enter username and password.!!!');
    }
    });
    });




          
module.exports = router;