var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
const util = require('util');
var router = app.Router();

//Models
var adminTypeModel = require('../../../modules/admintype');
var categoryModel = require('../../../modules/categories');
var subcategoryModel = require('../../../modules/subcategories'); 
var ModelProduct = require('../../../modules/product'); 
var brandModel = require('../../../modules/brand');
var bookAttributesModel = require('../../../modules/bookAttributes'); 
var stationaryAttributesModel = require('../../../modules/stationaryAttributes'); 
var productAttributeModel = require('../../../modules/productAttributeImages'); 
var productImagesModel = require('../../../modules/product_images'); 
var ModelFlashSale = require('../../../modules/flashsale'); 
var SpecialOfferModel = require('../../../modules/specialoffer');
var BulkOfferModel = require('../../../modules/bulkoffer');
var ebookModel = require('../../../modules/ebook');    

//Const
const { route } = require('../dashboard');
const productModel = require('../../../modules/product');
const { isArray } = require('util');
const { update } = require('../../../modules/admintype');
const productAttributeImagesModel = require('../../../modules/productAttributeImages');

var sessionstorage = require('sessionstorage');

//storage for Image Upload
var Storage = multer.diskStorage({

    // destination: './public/images/backend/admins/',
    filename: function(req,file,cb){
      var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
    }
 
});
  


router.get('/index',function(req,res,next){

 
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    var productDetails = ModelProduct.find({}).sort({_id:-1}).populate('category_id').populate('subcategory_id');

    productDetails.exec(function(err,data){
        
        res.render('backend/products/index',{adminType,title:"Product Lists",records:data,dateFormat});
    
    });

});


router.get('/create',function(req,res,next){
    var category = categoryModel.find({});
    
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;
    var brands = brandModel.find({});

    category.exec(function(err,data){
        brands.exec(function(err1,data1){
      
        res.render('backend/products/create',{adminType,title:"Add Products",categories:data,brands:data1});
        });
    });
 
});

var upload = multer({
    storage:Storage,
    // fileFilter: function(req,file,cb){
    //   checkFileType(file,cb);
    // }
}).fields([
    {name: 'product_image'},
    {name: 'specialoffer_image'},
    {name: 'ebook_file'}
]);  

// function checkFileType(file,cb){
 
//     //Allowerd ext
//     const filetypes = /jpeg|jpg|png|gif/;
//     //check ext
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     //check mime
//     const mimetype = filetypes.test(file.mimetype);

//     if(mimetype && extname){
//         console.log('not error');
//         return cb(null,true);
//     }else{
//         console.log('error');
//         cb(null, false);
//         // cb(new Error('I don\'t have a clue!'))
       
//     }
// }


router.post('/store',upload,function(req,res,next){
   
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    console.log(req.body);
   

    var category_id = req.body.product_category;
    var subcategory_id = req.body.product_subcategory;
    var productName = req.body.product_name;
    var productDescription = req.body.product_description;
    var product_price = req.body.product_price;
    var product_stock = req.body.stock_number;
    var ebook_price = req.body.ebook_price;
    var paperBook = req.body.paperbook;
    var ebook = req.body.ebook;
    
    var booktype;
    if(paperBook && ebook){
       
        booktype = 'both';

    }else if(paperBook){
        
        booktype = paperBook;
    
    }else if(ebook){
        
        booktype = ebook;
    
    }

    
 
    // var productBrand = req.body.product_brand;
    // var productPrice = req.body.product_price;
    // var productStock = req.body.product_stock;
    // var productWeight = req.body.product_weight;
    // var weightUnit = req.body.weight_unit;
    var status = req.body.status;
    var slugname = slug(productName);

    //For Flash Sale
    var flashSale = req.body.flash_sale;
    var flashSalePrice = req.body.flashsaleprice;
    var flash_startdate = req.body.flash_startdate;
    var flash_starttime = req.body.flash_starttime;
    var flash_enddate = req.body.flash_enddate;
    var flash_endtime = req.body.flash_endtime;
    var flashsale_status = req.body.flashsale_status;

    //For Offer Sale
    var specialOffer = req.body.specialoffer_sale;
    var specialDiscountPercent = req.body.specialDiscountPercent;
    var specialoffer_startdate = req.body.specialoffer_startdate;
    var specialoffer_enddate = req.body.specialoffer_enddate;
    var specialoffer_status = req.body.specialoffer_status;

    //For Bulk Sale

    var bulkOffer = req.body.bulk_offer;
    var bulk_minimum_product = req.body.bulk_minimum_product;
    var bulkDiscountPercent = req.body.bulkDiscountPercent;
    var bulkoffer_status = req.body.bulkoffer_status;



    // var productImage = images.product_image[0]; 
   

    var images = req.files;

    console.log(images);
   
    //Checking if  Product Image is present
    if(images.product_image == undefined){
        
       var image = null;
    
    }else{

        var productImage =  images.product_image[0];
    
        var image;
    
            image = productImage.filename;
    
            let width = 500;
            let height = 500;
            
            sharp(productImage.path).resize(width,height).toFile('./public/images/backend/products/'+ productImage.filename);     
    }


    var saveProduct = new ModelProduct({
        category_id : category_id,
        subcategory_id : subcategory_id,
        product_name : productName,
        product_description : productDescription,
        product_price : product_price,
        product_stock : product_stock,
        book_type : booktype,
        product_image : image,
        slug : slugname,
        status : status,
  
    });


 
        subcategoryModel.findOne({_id:subcategory_id},function(error,producttypedata){
            if(producttypedata){
                producttypedata.products.push(saveProduct);
                producttypedata.save();
        }
       });

    //If Only FLash Sale & Special Offer Is Present
    if(flashSale == 'yes' && specialOffer == '' && bulkOffer == ''){

        var saveFlashSale = new ModelFlashSale({
            product_id : saveProduct._id,
            flashsale_product_price : flashSalePrice,
            flashsale_start_date : flash_startdate,
            flashsale_start_time : flash_starttime,
            flashsale_end_date : flash_enddate,
            flashsale_end_time : flash_endtime,
            status : flashsale_status,
        });

        saveFlashSale.save();
      
        saveProduct.flash_sale = saveFlashSale._id;
        saveProduct.special_offer = null;
        saveProduct.bulk_offer = null;

        saveProduct.save();
    
        req.flash('success','Product Inserted Succesfully. Thank you!!!');
        res.redirect('/product/index'); 

    }

    //If Only FLash Sale & Special Offer Is Present
    if(flashSale == 'yes' && specialOffer == 'yes' && bulkOffer == ''){

        var saveFlashSale = new ModelFlashSale({
            product_id : saveProduct._id,
            flashsale_product_price : flashSalePrice,
            flashsale_start_date : flash_startdate,
            flashsale_start_time : flash_starttime,
            flashsale_end_date : flash_enddate,
            flashsale_end_time : flash_endtime,
            status : flashsale_status,
        });

         //Checking if Special Offer Image is present

    var offerImage;

    if(images.specialoffer_image == undefined){
        
         offerImage = null;
    
    }else{

        var specialOfferImage =  images.specialoffer_image[0];
    
        offerImage = specialOfferImage.filename;
    
            let width = 500;
            let height = 500;
            
            sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
        
    }

        //For Offer Offer
        var saveSpecialOffer = new SpecialOfferModel({
            product_id : saveProduct._id,
            specialoffer_percent : specialDiscountPercent,
            specialoffer_start_date : specialoffer_startdate,
            specialoffer_end_date : specialoffer_enddate,
            specialoffer_image : offerImage,
            status : specialoffer_status,
        });

        saveFlashSale.save();
    
        saveProduct.flash_sale = saveFlashSale._id;
        saveProduct.special_offer = saveSpecialOffer._id;
        saveProduct.bulk_offer = null;

        saveProduct.save();
        saveSpecialOffer.save();
    
        req.flash('success','Product Inserted Succesfully. Thank you!!!');
        res.redirect('/product/index'); 

    }

    //If Flash Sale and Bulk Offer Is Present
    if(flashSale == 'yes' && specialOffer == '' && bulkOffer == 'yes'){

            var saveFlashSale = new ModelFlashSale({
                product_id : saveProduct._id,
                flashsale_product_price : flashSalePrice,
                flashsale_start_date : flash_startdate,
                flashsale_start_time : flash_starttime,
                flashsale_end_date : flash_enddate,
                flashsale_end_time : flash_endtime,
                status : flashsale_status,
            });

            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : saveProduct._id,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });


            saveFlashSale.save();
            saveBulkOffer.save();
            
          
    
            saveProduct.flash_sale = saveFlashSale._id;
            saveProduct.special_offer = null;
            saveProduct.bulk_offer = saveBulkOffer._id;
            saveProduct.save();
        
        
            req.flash('success','Product Inserted Succesfully. Thank you!!!');
            res.redirect('/product/index'); 
    
    }

    //If Only Special Offer Is Present
    if(flashSale == '' && specialOffer == 'yes' && bulkOffer == ''){

        //Checking if Special Offer Image is present
        var offerImage;
    
        if(images.specialoffer_image == undefined){
            
             offerImage = null;
        
        }else{
    
            var specialOfferImage =  images.specialoffer_image[0];
        
            offerImage = specialOfferImage.filename;
        
                let width = 500;
                let height = 500;
                
                sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
        }
    
            var saveSpecialOffer = new SpecialOfferModel({
                product_id : saveProduct._id,
                specialoffer_percent : specialDiscountPercent,
                specialoffer_start_date : specialoffer_startdate,
                specialoffer_end_date : specialoffer_enddate,
                specialoffer_image : offerImage,
                status : specialoffer_status,
            });
          
            saveSpecialOffer.save();
    
            saveProduct.flash_sale = null;
            saveProduct.special_offer = saveSpecialOffer._id;
            saveProduct.bulk_offer = null;
            saveProduct.save();
        
            req.flash('success','Product Inserted Succesfully. Thank you!!!');
            res.redirect('/product/index'); 
            
    }
  
    //If Only Bulk Offer Is Present
    if(flashSale == '' && specialOffer == 'yes' && bulkOffer == 'yes'){

       

            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : saveProduct._id,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });


            
    //Checking if Special Offer Image is present

    var offerImage;

    if(images.specialoffer_image == undefined){
        
         offerImage = null;
    
    }else{

        var specialOfferImage =  images.specialoffer_image[0];
    
        offerImage = specialOfferImage.filename;
    
            let width = 500;
            let height = 500;
            
            sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
        
    }

        //For Offer Offer
        var saveSpecialOffer = new SpecialOfferModel({
            product_id : saveProduct._id,
            specialoffer_percent : specialDiscountPercent,
            specialoffer_start_date : specialoffer_startdate,
            specialoffer_end_date : specialoffer_enddate,
            specialoffer_image : offerImage,
            status : specialoffer_status,
        });

           
            saveBulkOffer.save();
            saveSpecialOffer.save();
            
          
            saveProduct.flash_sale = null;
            saveProduct.special_offer = saveSpecialOffer._id;
            saveProduct.bulk_offer = saveBulkOffer._id;
            saveProduct.save();
        
        
            req.flash('success','Product Inserted Succesfully. Thank you!!!');
            res.redirect('/product/index'); 
    
    }

     //If Only Bulk Offer Is Present
     if(flashSale == '' && specialOffer == '' && bulkOffer == 'yes'){

        //For Bulk Offer
        var saveBulkOffer = new BulkOfferModel({
            product_id : saveProduct._id,
            minimum_product : bulk_minimum_product,
            bulkDiscountPercent : bulkDiscountPercent,
            status : bulkoffer_status,
        });


        saveBulkOffer.save();
      
        saveProduct.flash_sale = null;
        saveProduct.special_offer = null;
        saveProduct.bulk_offer = saveBulkOffer._id;

        saveProduct.save();
    
        req.flash('success','Product Inserted Succesfully. Thank you!!!');
        res.redirect('/product/index'); 

    }

    //If FLash Sale & Special Offer and bulkoffer Is Present
    if(flashSale == 'yes' && specialOffer == 'yes' && bulkOffer == 'yes'){
  

        var saveFlashSale = new ModelFlashSale({
            product_id : saveProduct._id,
            flashsale_product_price : flashSalePrice,
            flashsale_start_date : flash_startdate,
            flashsale_start_time : flash_starttime,
            flashsale_end_date : flash_enddate,
            flashsale_end_time : flash_endtime,
            status : flashsale_status,
        });

    
    //Checking if Special Offer Image is present

    var offerImage;

    if(images.specialoffer_image == undefined){
        
         offerImage = null;
    
    }else{

        var specialOfferImage =  images.specialoffer_image[0];
    
        offerImage = specialOfferImage.filename;
    
            let width = 500;
            let height = 500;
            
            sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
        
    }

        //For Offer Offer
        var saveSpecialOffer = new SpecialOfferModel({
            product_id : saveProduct._id,
            specialoffer_percent : specialDiscountPercent,
            specialoffer_start_date : specialoffer_startdate,
            specialoffer_end_date : specialoffer_enddate,
            specialoffer_image : offerImage,
            status : specialoffer_status,
        });

        //For Bulk Offer
        var saveBulkOffer = new BulkOfferModel({
            product_id : saveProduct._id,
            minimum_product : bulk_minimum_product,
            bulkDiscountPercent : bulkDiscountPercent,
            status : bulkoffer_status,
        });

      
        saveFlashSale.save();
        saveSpecialOffer.save();
        saveBulkOffer.save();

        saveProduct.flash_sale = saveFlashSale._id;
        saveProduct.special_offer = saveSpecialOffer._id;
        saveProduct.bulk_offer = saveBulkOffer._id;
        saveProduct.save();
    
        req.flash('success','Product Inserted Succesfully. Thank you!!!');
        res.redirect('/product/index'); 
        
    }

    //If Flash sale & specialOffer and bulkoffer is not present
    if(flashSale == '' && specialOffer == '' && bulkOffer == ''){

        //If there is no flash sale

        saveProduct.flash_sale = null;
        saveProduct.special_offer = null;
        saveProduct.bulk_offer = null;
      
    var pdfFile;

    if(images.ebook_file == undefined){
        pdfFile = null;
    }else{

        var pdfFile = images.ebook_file[0].filename;

        var img = fs.readFileSync(images.ebook_file[0].path);
        var encode_image = img.toString('base64');
    

        const currentPath = path.join(images.ebook_file[0].path);
        const newPath = path.join('./public/images/backend/products/ebook/',pdfFile);
        fs.renameSync(currentPath, newPath);
    
    }
      

        if(ebook){
            var saveEbook = new ebookModel({
                product_id : saveProduct._id,
                ebook_file : pdfFile,
                ebook_price : ebook_price, 
            });
            
            saveProduct.ebook_id = saveEbook._id;

            saveEbook.save();
        }else{
            saveProduct.ebook_id = null;
        }
    
    
      
        saveProduct.save();

        req.flash('success','Product Inserted Succesfully. Thank you!!!');
        res.redirect('/product/index'); 
    }
    
});


router.get('/edit/:id',function(req,res,next){
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;
    var id = req.params.id;

    var category = categoryModel.find({});
   
    var subcategory = subcategoryModel.find({});

    var product = productModel.findById(id).populate('subcategory_id').populate('category_id').populate('brand_id').populate('flash_sale').populate('bulk_offer').populate('special_offer').populate('ebook_id');
  
    var brands = brandModel.find({});
    
  


  

    var selected = "selected";
    var checked = "checked";
    console.log(checked)

    category.exec(function(err,data){
        if(err) throw err;

            product.exec(function(err1,data1){
                var records = util.inspect(data1, false, null, true /* enable colors */);
            
                if(err1) throw err1;

                //Getting Data of subcategory from category
                var selectedSubcategory = subcategoryModel.find({category_type_id:data1.category_id._id});
               
                selectedSubcategory.exec(function(err2,data2){
                   

                    subcategory.exec(function(err3,data3){
                        if(err2) throw err2;
                        brands.exec(function(err4,data4){
                            console.log(data4);

                            res.render('backend/products/edit',{adminType,title:"Edit Products",
                                categories:data,
                                products:data1,
                                selectedSubcategory:data2,
                                subcategory:data3,
                                brands:data4,
                                selected,
                                checked
                            });
                        });
                    });
                });
            });
    });
   
});



var edit_upload = multer({
    storage:Storage
}).fields([
    {name: 'product_image'},
    {name: 'specialoffer_image'},
    {name: 'ebook_file'}
]);
  
router.post('/update',edit_upload,function(req,res,next){
      
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;
    var images = req.files;

  
 

    var productId = req.body.id;
    var category_id = req.body.product_category;
    var subcategory_id = req.body.product_subcategory;

    var paperBook = req.body.paperbook;

    //Ebook
    var ebook = req.body.ebook;
    var ebook_id = req.body.ebook_id;
    var previousPdfFile = req.body.previousPdfFile;
    var ebookPrice = req.body.ebook_price;

    var productName = req.body.product_name;
    var productPrice = req.body.product_price;
    var productStock = req.body.stock_number;
    var productDescription = req.body.product_description;
 
    var previousProductImage = req.body.previousproductImage;

        
    console.log(productId);
    console.log(category_id);
    console.log(subcategory_id);
    console.log(productName); 
    console.log(productPrice);
    console.log(productStock);
    console.log(productDescription);
    console.log(previousProductImage);


    var status = req.body.status;
    var slugname = slug(productName);

    //For BookType
    var booktype;
    var eBookID;

    console.log(eBookID);

    if(paperBook && ebook){
       
        booktype = 'both';
        eBookID =  ebook_id;

    }else if(paperBook){
        eBookID = null;    
        booktype = paperBook;
    
    }else if(ebook){
            
        booktype = ebook;
    
    }

    console.log(booktype);


    //For Flash Sale 
    var flash_sale = req.body.flash_sale;
    var flashsaleprice = req.body.flashsaleprice;
    var flash_startdate = req.body.flash_startdate;
    var flash_starttime = req.body.flash_starttime;
    var flash_enddate = req.body.flash_enddate;
    var flash_endtime = req.body.flash_endtime;
    var flashsale_status = req.body.flashsale_status;
    var flash_sale_id = req.body.flash_sale_id;

      //For Offer Sale
    var specialOffer = req.body.specialoffer_sale;
    var specialDiscountPercent = req.body.specialDiscountPercent;
    var specialoffer_startdate = req.body.specialoffer_startdate;
    var specialoffer_enddate = req.body.specialoffer_enddate;
    var specialoffer_status = req.body.specialoffer_status;
    var special_offer_id = req.body.special_offer_id;
    var previousSpecialOfferImage = req.body.previousSpecialOfferImage;

    //For Bulk Sale
    var bulkOffer = req.body.bulk_offer;
    var bulk_minimum_product = req.body.bulk_minimum_product;
    var bulkDiscountPercent = req.body.bulkDiscountPercent;
    var bulkoffer_status = req.body.bulkoffer_status;
    var bulk_offer_id = req.body.bulk_offer_id;

    var images = req.files;
    var productImage;

    console.log(images);

    if(images.product_image == undefined){
       
        
        if(previousProductImage == ''){
            productImage = null;
        }else{
            productImage = previousProductImage;
        }

    }else{
      
        productImage = images.product_image[0].filename;
        let width = 500;
        let height = 500;
        
        sharp(images.product_image[0].path).resize(width,height).toFile('./public/images/backend/products/'+ images.product_image[0].filename);

        if(previousProductImage != ''){
        var filePath = './public/images/backend/products/'+previousProductImage;
        fs.unlinkSync(filePath);
        }
    }

    
 


    //IF  Flash Sale && SpecialOffer & Bulk Offer are Yes
    if(flash_sale == 'yes' && specialOffer == 'yes' && bulkOffer == 'yes'){

        //Finding if previous flash sale is null
        productModel.findOne({_id:productId}).exec(function(err,document){

            //If FlashSale & Special Offer & Bulk Offer are null
            if(document.flash_sale == null && document.special_offer == null && document.bulk_offer == null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : productId,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });

            
                saveFlashSale.save();
                saveSpecialOffer.save();
                saveBulkOffer.save();
              
           
                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : saveFlashSale._id,
                    special_offer : saveSpecialOffer._id,
                    bulk_offer : saveBulkOffer._id
                }); 

            }

            //If FlashSale are null
            if(document.flash_sale == null && document.special_offer != null && document.bulk_offer != null){
             

                //Storing into Flash Sale
                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });


                saveFlashSale.save();

                //Updating Special Offer
                
                    //For Special Offer Image
                    var specialOfferImage;
                    
                    if(images.specialoffer_image == undefined){
                         
                        if(previousSpecialOfferImage == ''){
                            
                            specialOfferImage = null;
                        
                        }else{
                            
                            specialOfferImage = previousSpecialOfferImage;
                       
                        }

                    }else{
                      
                        specialOfferImage = images.specialoffer_image[0].filename;
                        
                        let width = 500;
                        let height = 500;
                        
                        sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                
                        if(previousSpecialOfferImage != ''){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                        }
                    }


                         //Updating Special Offer
                     var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                        specialoffer_percent : specialDiscountPercent,
                        specialoffer_start_date : specialoffer_startdate,
                        specialoffer_end_date : specialoffer_enddate,
                        specialoffer_image : specialOfferImage,
                        status : specialoffer_status,
                    });

                    var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                        minimum_product : bulk_minimum_product,
                        bulkDiscountPercent : bulkDiscountPercent,
                        status : bulkoffer_status,
                    });

                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : saveFlashSale._id,
                    special_offer : special_offer_id,
                    bulk_offer : bulk_offer_id
                }); 

                       
                updateProduct.exec(function(err,doc){

                    var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                
                    subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                
                
                        if(subcategoriesData){
                            subcategoriesData.products.push(productId);
                            subcategoriesData.save();
                        }
                    });
                
                        removeArray.exec(function(err1,doc1){
                                updateSpecialOffer.exec(function(err3,doc3){
                                    updateProductFS.exec(function(err4,doc4){
                                        updateBulkOffer.exec(function(err5,doc5){
                                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                                            res.redirect('/product/index');
                                        });
                                    });
                                });  
                                 
                        });
                    //  }
                
                });
                

            
            }

            //If FlashSale & Special Offer are null
            if(document.flash_sale == null && document.special_offer == null && document.bulk_offer != null){
                
                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });



                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });


                var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

            var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                flash_sale : saveFlashSale._id,
                special_offer : saveSpecialOffer._id,
                bulk_offer : bulk_offer_id
            }); 

                saveFlashSale.save();
                saveSpecialOffer.save();

                
        updateProduct.exec(function(err,doc){

            var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
         
            subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
         
         
                if(subcategoriesData){
                     subcategoriesData.products.push(productId);
                     subcategoriesData.save();
                }
             });
         

                        removeArray.exec(function(err1,doc1){
                          
                                    updateProductFS.exec(function(err4,doc4){
                                        updateBulkOffer.exec(function(err5,doc5){
                                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                                            res.redirect('/product/index');
                                        });
                                    });
                               
                                
                        });
                    //  }
                
                });
        
            }

            //If FlashSale & Bulk Offer are null
            if(document.flash_sale == null && document.special_offer != null && document.bulk_offer == null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });


                //Updating Special Offer
                
                    //For Special Offer Image
                    var specialOfferImage;
                    
                    if(images.specialoffer_image == undefined){
                         
                        if(previousSpecialOfferImage == ''){
                            
                            specialOfferImage = null;
                        
                        }else{
                            
                            specialOfferImage = previousSpecialOfferImage;
                       
                        }

                    }else{
                      
                        specialOfferImage = images.specialoffer_image[0].filename;
                        
                        let width = 500;
                        let height = 500;
                        
                        sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                
                        if(previousSpecialOfferImage != ''){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                        }
                    }


                         //Updating Special Offer
                     var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                        specialoffer_percent : specialDiscountPercent,
                        specialoffer_start_date : specialoffer_startdate,
                        specialoffer_end_date : specialoffer_enddate,
                        specialoffer_image : specialOfferImage,
                        status : specialoffer_status,
                    });

            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : productId,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });

            
                saveFlashSale.save();
                saveBulkOffer.save();
              
           
                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : saveFlashSale._id,
                    special_offer : special_offer_id,
                    bulk_offer : saveBulkOffer._id
                }); 



                updateProduct.exec(function(err,doc){

                    var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                 
                    subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                 
                 
                        if(subcategoriesData){
                             subcategoriesData.products.push(productId);
                             subcategoriesData.save();
                        }
                     });
                 
        
                                removeArray.exec(function(err1,doc1){
                                            updateProductFS.exec(function(err4,doc4){
                                                updateSpecialOffer.exec(function(err5,doc5){
                                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                                    res.redirect('/product/index');
                                                });
                                            }); 
                                });
                            //  }
                        
                        });
            }

            //If Special Offer are null
            if(document.flash_sale != null && document.special_offer == null && document.bulk_offer != null){

                //Updating flash sale
                var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

            
                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                flash_sale : flash_sale_id,
                special_offer : saveSpecialOffer._id,
                bulk_offer : bulk_offer_id
            }); 


          
            updateProduct.exec(function(err,doc){

                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
             
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
             
             
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
             
    
                            removeArray.exec(function(err1,doc1){
                                updateFlashSale.exec(function(err2,doc2){
                                    updateProductFS.exec(function(err3,doc3){
                                        updateBulkOffer.exec(function(err4,doc4){
                                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                                            res.redirect('/product/index');
                                        });
                                    }); 
                                }); 
                            });
                        //  }
                    
                    });

             }

            //Special Offer and Bulk Offer are null
            if(document.flash_sale != null && document.special_offer == null && document.bulk_offer == null){
                
                //Updating flash sale
                var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                  
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

            saveSpecialOffer.save();



            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : productId,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });

            saveBulkOffer.save();

            var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                flash_sale : flash_sale_id,
                special_offer : saveSpecialOffer._id,
                bulk_offer : saveBulkOffer._id
            }); 

            
            updateProduct.exec(function(err,doc){

                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
             
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
             
             
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
             
    
                            removeArray.exec(function(err1,doc1){
                                updateFlashSale.exec(function(err2,doc2){
                                    updateProductFS.exec(function(err3,doc3){
                                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                                            res.redirect('/product/index');
                                    }); 
                                }); 
                            });
                        //  }
                    
                    });

             }

              //If Bulk Offer is null
             if(document.flash_sale != null && document.special_offer != null && document.bulk_offer == null){

                       //Updating flash sale
                       var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                        flashsale_product_price : flashsaleprice,
                        flashsale_start_date : flash_startdate,
                        flashsale_start_time : flash_starttime,
                        flashsale_end_date : flash_enddate,
                        flashsale_end_time : flash_endtime,
                        status : flashsale_status,
                    });

                    
                    //Updating Special Offer
                
                    //For Special Offer Image
                    var specialOfferImage;
                    
                    if(images.specialoffer_image == undefined){
                         
                        if(previousSpecialOfferImage == ''){
                            
                            specialOfferImage = null;
                        
                        }else{
                            
                            specialOfferImage = previousSpecialOfferImage;
                       
                        }

                    }else{
                      
                        specialOfferImage = images.specialoffer_image[0].filename;
                        
                        let width = 500;
                        let height = 500;
                        
                        sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                
                        if(previousSpecialOfferImage != ''){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                        }
                    }


                         //Updating Special Offer
                     var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                        specialoffer_percent : specialDiscountPercent,
                        specialoffer_start_date : specialoffer_startdate,
                        specialoffer_end_date : specialoffer_enddate,
                        specialoffer_image : specialOfferImage,
                        status : specialoffer_status,
                    });

            //For Bulk Offer
            var saveBulkOffer = new BulkOfferModel({
                product_id : productId,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });

            
             
                saveBulkOffer.save();
              
           
                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : flash_sale_id,
                    special_offer : special_offer_id,
                    bulk_offer : saveBulkOffer._id
                }); 


                updateProduct.exec(function(err,doc){

                    var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                 
                    subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                 
                 
                        if(subcategoriesData){
                             subcategoriesData.products.push(productId);
                             subcategoriesData.save();
                        }
                     });
                 
        
                                removeArray.exec(function(err1,doc1){
                                    updateFlashSale.exec(function(err2,doc2){
                                        updateSpecialOffer.exec(function(err3,doc3){
                                            updateProductFS.exec(function(err4,doc4){
                                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                                    res.redirect('/product/index');
                                            }); 
                                        }); 
                                    }); 
                                });
                            //  }
                        
                        });

             
            }
        
            // Flash Sale & Special Offer & bulk Offer and Not Null
            if(document.flash_sale != null && document.special_offer != null && document.bulk_offer != null){
                console.log('If All Are Not Null');

                //Updating flash sale
                var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                
                    //For Special Offer Image

                    var specialOfferImage;
                    
                    if(images.specialoffer_image == undefined){
                         
                        if(previousSpecialOfferImage == ''){
                            
                            specialOfferImage = null;
                        
                        }else{
                            
                            specialOfferImage = previousSpecialOfferImage;
                       
                        }

                    }else{
                      
                        specialOfferImage = images.specialoffer_image[0].filename;
                        
                        let width = 500;
                        let height = 500;
                        
                        sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                
                        if(previousSpecialOfferImage != ''){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                        }
                    }


                         //Updating Special Offer
                     var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                        specialoffer_percent : specialDiscountPercent,
                        specialoffer_start_date : specialoffer_startdate,
                        specialoffer_end_date : specialoffer_enddate,
                        specialoffer_image : specialOfferImage,
                        status : specialoffer_status,
                    });

                    var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                        minimum_product : bulk_minimum_product,
                        bulkDiscountPercent : bulkDiscountPercent,
                        status : bulkoffer_status,
                    });

                var updateProductFS = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : flash_sale_id,
                    special_offer : special_offer_id,
                    bulk_offer : bulk_offer_id
                }); 


                
         
        updateProduct.exec(function(err,doc){

            var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
         
            subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
         
         
                if(subcategoriesData){
                     subcategoriesData.products.push(productId);
                     subcategoriesData.save();
                }
             });
         
         

                    //  if(document.flash_sale == null){
                    //     removeArray.exec(function(err1,doc1){
                    //            updateProductFS.exec(function(err3,doc3){
                    //                req.flash('success','Product Updated Succesfully. Thank you!!!');
                    //                res.redirect('/product/index');
                    //            });
                                
                    //     });
                    //  }else{
                        removeArray.exec(function(err1,doc1){
                            updateFlashSale.exec(function(err2,doc2){
                                updateSpecialOffer.exec(function(err3,doc3){
                                    updateProductFS.exec(function(err4,doc4){
                                        updateBulkOffer.exec(function(err5,doc5){
                                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                                            res.redirect('/product/index');
                                        });
                                    });
                                });  
                            });       
                        });
                    //  }
                
                });

            }

        });
    }
    
     //IF  Flash Sale  is Yes
    if(flash_sale == 'yes' && specialOffer == '' && bulkOffer == ''){
    
        productModel.findOne({_id:productId}).exec(function(err,document){

            if(document.flash_sale == null){
              
                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                saveFlashSale.save();

                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);
                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);
    
                //Removing Previous Offer Image
                if(previousSpecialOfferImage != undefined){
                    var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                    fs.unlinkSync(filePath);
                }
                    
    
                    var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                        flash_sale : flash_sale_id,
                        special_offer : null,
                        bulk_offer : null
                    });

                    updateProduct.exec(function(err,doc){
                           updateSpecialOffer.exec(function(err3,doc3){
                               updateBulkOffer.exec(function(err4,doc4){
                                   updateProductFlashSale.exec(function(err5,doc5){
                                       req.flash('success','Product Updated Succesfully. Thank you!!!');
                                       res.redirect('/product/index');
                                   });
                               });  
                            });     
                });
            }

            if(document.flash_sale != null){

                //Updating flash sale
                var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);
                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);
    
                //Removing Previous Offer Image
                if(previousSpecialOfferImage != undefined){
              
                    var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                    fs.unlinkSync(filePath);
                    }
    
                    var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                        flash_sale : flash_sale_id,
                        special_offer : null,
                        bulk_offer : null
                    });

                    
        updateProduct.exec(function(err,doc){
                 updateFlashSale.exec(function(err2,doc2){
                    updateSpecialOffer.exec(function(err3,doc3){
                        updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashSale.exec(function(err5,doc5){
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                     });     
                 });       
         });

            }

      

        });
    }

    //If Flash Sale && SpecialOffer are Yes
    if(flash_sale == 'yes' && specialOffer == 'yes' && bulkOffer == ''){

        productModel.findOne({_id:productId}).exec(function(err,document){

            //If Flash Sale and Offer Sale are null
            if(document.flash_sale == null && document.special_offer == null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                saveFlashSale.save();

                
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                //Deleting Bulk Offer
                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : saveFlashSale._id,
                    special_offer : saveSpecialOffer._id,
                    bulk_offer : null
                });

                updateProduct.exec(function(err,doc){
                           updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashAndSpecial.exec(function(err5,doc5){
                                   req.flash('success','Product Updated Succesfully. Thank you!!!');
                                   res.redirect('/product/index');
                               });
                           });  
                         
            });
            }

            //If Flash Sale and Special Offer are not null
            if(document.flash_sale != null && document.special_offer != null){

                    //Updating flash sale
                    var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                        flashsale_product_price : flashsaleprice,
                        flashsale_start_date : flash_startdate,
                        flashsale_start_time : flash_starttime,
                        flashsale_end_date : flash_enddate,
                        flashsale_end_time : flash_endtime,
                        status : flashsale_status,
                    });
    
                    
                        //For Special Offer Image
    
                        var specialOfferImage;
                        
                        if(images.specialoffer_image == undefined){
                             
                            if(previousSpecialOfferImage == ''){
                                
                                specialOfferImage = null;
                            
                            }else{
                                
                                specialOfferImage = previousSpecialOfferImage;
                           
                            }
    
                        }else{
                          
                            specialOfferImage = images.specialoffer_image[0].filename;
                            
                            let width = 500;
                            let height = 500;
                            
                            sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                    
                            if(previousSpecialOfferImage != ''){
                            var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                            fs.unlinkSync(filePath);
                            }
                        }
    
    
                             //Updating Special Offer
                         var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                            specialoffer_percent : specialDiscountPercent,
                            specialoffer_start_date : specialoffer_startdate,
                            specialoffer_end_date : specialoffer_enddate,
                            specialoffer_image : specialOfferImage,
                            status : specialoffer_status,
                        });

                    var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                    var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                        flash_sale : flash_sale_id,
                        special_offer : special_offer_id,
                        bulk_offer : null
                    });

                    
        updateProduct.exec(function(err,doc){
                 updateFlashSale.exec(function(err2,doc2){
                    updateSpecialOffer.exec(function(err3,doc3){
                        updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashAndSpecial.exec(function(err5,doc5){
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                     });     
                 });       
         });
    
            }

            //If Special Offer is null
            if(document.flash_sale != null && document.special_offer == null){

                    //Updating flash sale
                    var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                        flashsale_product_price : flashsaleprice,
                        flashsale_start_date : flash_startdate,
                        flashsale_start_time : flash_starttime,
                        flashsale_end_date : flash_enddate,
                        flashsale_end_time : flash_endtime,
                        status : flashsale_status,
                    });

                      
                //Checking if Special Offer Image is present
                var offerImage;
                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : flash_sale_id,
                    special_offer : saveSpecialOffer._id,
                    bulk_offer : null
                });

                
    updateProduct.exec(function(err,doc){
             updateFlashSale.exec(function(err2,doc2){
                    updateBulkOffer.exec(function(err4,doc4){
                        updateProductFlashAndSpecial.exec(function(err5,doc5){
                            req.flash('success','Product Updated Succesfully. Thank you!!!');
                            res.redirect('/product/index');
                        });
                    });     
             });       
     });

            }

            //If Flash Sale is null
            if(document.flash_sale == null && document.special_offer != null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                saveFlashSale.save();

                
                        //For Special Offer Image
    
                        var specialOfferImage;
                        
                        if(images.specialoffer_image == undefined){
                             
                            if(previousSpecialOfferImage == ''){
                                
                                specialOfferImage = null;
                            
                            }else{
                                
                                specialOfferImage = previousSpecialOfferImage;
                           
                            }
    
                        }else{
                          
                            specialOfferImage = images.specialoffer_image[0].filename;
                            
                            let width = 500;
                            let height = 500;
                            
                            sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                    
                            if(previousSpecialOfferImage != ''){
                            var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                            fs.unlinkSync(filePath);
                            }
                        }
    
    
                        //Updating Special Offer
                         var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                            specialoffer_percent : specialDiscountPercent,
                            specialoffer_start_date : specialoffer_startdate,
                            specialoffer_end_date : specialoffer_enddate,
                            specialoffer_image : specialOfferImage,
                            status : specialoffer_status,
                        });

                    var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                    var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                        flash_sale : saveFlashSale._id,
                        special_offer : special_offer_id,
                        bulk_offer : null
                    });

                    updateProduct.exec(function(err,doc){
                        updateSpecialOffer.exec(function(err2,doc2){
                               updateBulkOffer.exec(function(err4,doc4){
                                   updateProductFlashAndSpecial.exec(function(err5,doc5){
                                       req.flash('success','Product Updated Succesfully. Thank you!!!');
                                       res.redirect('/product/index');
                                   });
                               });     
                        });       
                });

            }

        });
    }

     //IF  Flash Sale & Bulk Offer are Yes
    if(flash_sale == 'yes' && specialOffer == '' && bulkOffer == 'yes'){

        productModel.findOne({_id:productId}).exec(function(err,document){

            //If Flash Sale and Offer Sale is null
            if(document.flash_sale == null && document.bulk_offer == null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                saveFlashSale.save();

                var saveBulkOffer = new BulkOfferModel({
                    product_id : productId,
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                saveBulkOffer.save();

                //Deleting Bulk Offer
                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);

                     //Removing Previous Offer Image
                     if(previousSpecialOfferImage != undefined){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                    }

                var updateProductFlashAndBulk = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : saveFlashSale._id,
                    special_offer : null,
                    bulk_offer : saveBulkOffer.id
                });

                updateProduct.exec(function(err,doc){
                    updateSpecialOffer.exec(function(err4,doc4){
                        updateProductFlashAndBulk.exec(function(err5,doc5){
                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                    res.redirect('/product/index');
                                });
                            });  
                            
            });
            }

            //If Flash Sale and Offer Sale are not null
            if(document.flash_sale != null && document.bulk_offer != null){

                     //Updating flash sale
                     var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                        flashsale_product_price : flashsaleprice,
                        flashsale_start_date : flash_startdate,
                        flashsale_start_time : flash_starttime,
                        flashsale_end_date : flash_enddate,
                        flashsale_end_time : flash_endtime,
                        status : flashsale_status,
                    });

                    var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                        minimum_product : bulk_minimum_product,
                        bulkDiscountPercent : bulkDiscountPercent,
                        status : bulkoffer_status,
                    });

                //Deleting Special Offer
                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);

                //Removing Previous Offer Image
                if(previousSpecialOfferImage != undefined){
                   var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                   fs.unlinkSync(filePath);
               }

                var updateProductFlashAndBulk = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : flash_sale_id,
                    special_offer : null,
                    bulk_offer : bulk_offer_id
                });

                updateProduct.exec(function(err,doc){
                    updateFlashSale.exec(function(err2,doc2){
                        updateBulkOffer.exec(function(err3,doc3){
                            updateSpecialOffer.exec(function(err4,doc4){
                                updateProductFlashAndBulk.exec(function(err5,doc5){
                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                    res.redirect('/product/index');
                                });
                            });  
                        });  
                    });  
                            
                 });
            }

            //If Flash Sale are not null
            if(document.flash_sale != null && document.bulk_offer == null){

                //Updating flash sale
                var updateFlashSale = ModelFlashSale.findByIdAndUpdate(flash_sale_id,{
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                var saveBulkOffer = new BulkOfferModel({
                    product_id : productId,
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                saveBulkOffer.save();

                //Deleting Bulk Offer
                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);

                     //Removing Previous Offer Image
                     if(previousSpecialOfferImage != undefined){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                    }

                var updateProductFlashAndBulk = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : flash_sale_id,
                    special_offer : null,
                    bulk_offer : saveBulkOffer.id
                });

                updateProduct.exec(function(err,doc){
                    updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err4,doc4){
                            updateProductFlashAndBulk.exec(function(err5,doc5){
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });   
                    });           
                });

            }

            //If Flash Sale are not null
            if(document.flash_sale == null && document.bulk_offer != null){

                var saveFlashSale = new ModelFlashSale({
                    product_id : productId,
                    flashsale_product_price : flashsaleprice,
                    flashsale_start_date : flash_startdate,
                    flashsale_start_time : flash_starttime,
                    flashsale_end_date : flash_enddate,
                    flashsale_end_time : flash_endtime,
                    status : flashsale_status,
                });

                saveFlashSale.save();

                var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

            //Deleting Special Offer
            var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);

            //Removing Previous Offer Image
            if(previousSpecialOfferImage != undefined){
               var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
               fs.unlinkSync(filePath);
           }

            var updateProductFlashAndBulk = ModelProduct.findByIdAndUpdate(productId,{
                flash_sale : saveFlashSale._id,
                special_offer : null,
                bulk_offer : bulk_offer_id
            });

            updateProduct.exec(function(err,doc){
                    updateBulkOffer.exec(function(err3,doc3){
                        updateSpecialOffer.exec(function(err4,doc4){
                            updateProductFlashAndBulk.exec(function(err5,doc5){
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                    });       
             });
            }
        });
    }

    //IF SpecialOffer is Yes
    if(flash_sale == '' && specialOffer == 'yes' && bulkOffer == ''){

        productModel.findOne({_id:productId}).exec(function(err,document){

            //If Special Offer is null
            if(document.special_offer == null){
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                var updateFlashSale =ModelFlashSale.findByIdAndDelete(flash_sale_id);
                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                

                
                var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : null,
                    special_offer : saveSpecialOffer._id,
                    bulk_offer : null
                });

                updateProduct.exec(function(err,doc){
                    updateFlashSale.exec(function(err3,doc3){
                           updateBulkOffer.exec(function(err4,doc4){
                               updateProductFlashSale.exec(function(err5,doc5){
                                   req.flash('success','Product Updated Succesfully. Thank you!!!');
                                   res.redirect('/product/index');
                               });
                           });  
                        });     
                 });
            }

            //IF Special Offer is not null
            if(document.special_offer != null){

                        //For Special Offer Image
    
                        var specialOfferImage;
                        
                        if(images.specialoffer_image == undefined){
                             
                            if(previousSpecialOfferImage == ''){
                                
                                specialOfferImage = null;
                            
                            }else{
                                
                                specialOfferImage = previousSpecialOfferImage;
                           
                            }
    
                        }else{
                          
                            specialOfferImage = images.specialoffer_image[0].filename;
                            
                            let width = 500;
                            let height = 500;
                            
                            sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
                    
                            if(previousSpecialOfferImage != ''){
                            var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                            fs.unlinkSync(filePath);
                            }
                        }
    
    
                             //Updating Special Offer
                         var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                            specialoffer_percent : specialDiscountPercent,
                            specialoffer_start_date : specialoffer_startdate,
                            specialoffer_end_date : specialoffer_enddate,
                            specialoffer_image : specialOfferImage,
                            status : specialoffer_status,
                        });

                        
                var updateFlashSale =ModelFlashSale.findByIdAndDelete(flash_sale_id);
                var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);

                
                var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : null,
                    special_offer : special_offer_id,
                    bulk_offer : null
                });

                updateProduct.exec(function(err,doc){
                


                    updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                           updateBulkOffer.exec(function(err4,doc4){
                               updateProductFlashSale.exec(function(err5,doc5){
                                   req.flash('success','Product Updated Succesfully. Thank you!!!');
                                   res.redirect('/product/index');
                               });
                           });  
                        });  
                    });     
                 });

            }
        });
    }

      //If SpecialOffer & Bulk Offer are Yes
    if(flash_sale == '' && specialOffer == 'yes' && bulkOffer == 'yes'){

        productModel.findOne({_id:productId}).exec(function(err,document){

        //If special offer and bulk offer are null
        if(document.special_offer == null && document.bulk_offer == null){
            
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                var saveBulkOffer = new BulkOfferModel({
                    product_id : productId,
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                saveBulkOffer.save();

                      //Deleting Bulk Offer
                      var updateFlashSale = ModelFlashSale.findByIdAndDelete(flash_sale_id);

                      var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                          flash_sale : null,
                          special_offer : saveSpecialOffer._id,
                          bulk_offer : saveBulkOffer._id
                      });
      
                      updateProduct.exec(function(err,doc){
                            updateFlashSale.exec(function(err4,doc4){
                                  updateProductFlashAndSpecial.exec(function(err5,doc5){
                                         req.flash('success','Product Updated Succesfully. Thank you!!!');
                                         res.redirect('/product/index');
                                     });
                                 });  
                               
                  });

        }

        //If special offer and bulk offer are not null
        if(document.special_offer != null && document.bulk_offer != null){

                 //For Special Offer Image
                 var specialOfferImage;
                        
                 if(images.specialoffer_image == undefined){
                      
                     if(previousSpecialOfferImage == ''){
                         
                         specialOfferImage = null;
                     
                     }else{
                         
                         specialOfferImage = previousSpecialOfferImage;
                    
                     }

                 }else{
                   
                     specialOfferImage = images.specialoffer_image[0].filename;
                     
                     let width = 500;
                     let height = 500;
                     
                     sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
             
                     if(previousSpecialOfferImage != ''){
                     var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                     fs.unlinkSync(filePath);
                     }
                 }


                      //Updating Special Offer
                  var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                     specialoffer_percent : specialDiscountPercent,
                     specialoffer_start_date : specialoffer_startdate,
                     specialoffer_end_date : specialoffer_enddate,
                     specialoffer_image : specialOfferImage,
                     status : specialoffer_status,
                 });

                 var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                           //Deleting Bulk Offer
                           var updateFlashSale = ModelFlashSale.findByIdAndDelete(flash_sale_id);

                           var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                               flash_sale : null,
                               special_offer : special_offer_id,
                               bulk_offer : bulk_offer_id
                           });
           
                           updateProduct.exec(function(err,doc){
                                updateSpecialOffer.exec(function(err2,doc2){
                                    updateBulkOffer.exec(function(err3,doc3){
                                        updateFlashSale.exec(function(err4,doc4){
                                            updateProductFlashAndSpecial.exec(function(err5,doc5){
                                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                                    res.redirect('/product/index');
                                                });
                                            });  
                                        });  
                                    });            
                            });

        }

        //If only bulk offer are null
        if(document.special_offer != null && document.bulk_offer == null){

              //For Special Offer Image
              var specialOfferImage;
                        
              if(images.specialoffer_image == undefined){
                   
                  if(previousSpecialOfferImage == ''){
                      
                      specialOfferImage = null;
                  
                  }else{
                      
                      specialOfferImage = previousSpecialOfferImage;
                 
                  }

              }else{
                
                  specialOfferImage = images.specialoffer_image[0].filename;
                  
                  let width = 500;
                  let height = 500;
                  
                  sharp(images.specialoffer_image[0].path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ images.specialoffer_image[0].filename);
          
                  if(previousSpecialOfferImage != ''){
                  var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                  fs.unlinkSync(filePath);
                  }
              }


                   //Updating Special Offer
               var updateSpecialOffer = SpecialOfferModel.findByIdAndUpdate(special_offer_id,{
                  specialoffer_percent : specialDiscountPercent,
                  specialoffer_start_date : specialoffer_startdate,
                  specialoffer_end_date : specialoffer_enddate,
                  specialoffer_image : specialOfferImage,
                  status : specialoffer_status,
              });

              var saveBulkOffer = new BulkOfferModel({
                product_id : productId,
                minimum_product : bulk_minimum_product,
                bulkDiscountPercent : bulkDiscountPercent,
                status : bulkoffer_status,
            });

            saveBulkOffer.save();

                  //Deleting Bulk Offer
                  var updateFlashSale = ModelFlashSale.findByIdAndDelete(flash_sale_id);

                  var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                      flash_sale : null,
                      special_offer : special_offer_id,
                      bulk_offer : saveBulkOffer._id
                  });
  
                  updateProduct.exec(function(err,doc){
                    updateSpecialOffer.exec(function(err2,doc2){
                        updateFlashSale.exec(function(err4,doc4){
                              updateProductFlashAndSpecial.exec(function(err5,doc5){
                                     req.flash('success','Product Updated Succesfully. Thank you!!!');
                                     res.redirect('/product/index');
                                 });
                             }); 
                            });   
                           
              });


        }

        //If special offer are null
        if(document.special_offer == null && document.bulk_offer != null){
            
                //Checking if Special Offer Image is present
                var offerImage;

                if(images.specialoffer_image == undefined){
                    
                        offerImage = null;

                }else{

                    var specialOfferImage =  images.specialoffer_image[0];

                    offerImage = specialOfferImage.filename;

                        let width = 500;
                        let height = 500;
                        
                        sharp(specialOfferImage.path).resize(width,height).toFile('./public/images/backend/products/special_offer/'+ specialOfferImage.filename);
                    
                }

                //For Offer Offer
                var saveSpecialOffer = new SpecialOfferModel({

                    product_id : productId,
                    specialoffer_percent : specialDiscountPercent,
                    specialoffer_start_date : specialoffer_startdate,
                    specialoffer_end_date : specialoffer_enddate,
                    specialoffer_image : offerImage,
                    status : specialoffer_status,

                });

                saveSpecialOffer.save();

                var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                           //Deleting Bulk Offer
                           var updateFlashSale = ModelFlashSale.findByIdAndDelete(flash_sale_id);

                           var updateProductFlashAndSpecial = ModelProduct.findByIdAndUpdate(productId,{
                               flash_sale : null,
                               special_offer : saveSpecialOffer._id,
                               bulk_offer : bulk_offer_id
                           });
           
                           updateProduct.exec(function(err,doc){
                                    updateBulkOffer.exec(function(err3,doc3){
                                        updateFlashSale.exec(function(err4,doc4){
                                            updateProductFlashAndSpecial.exec(function(err5,doc5){
                                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                                    res.redirect('/product/index');
                                                });
                                            });  
                                        });  
                            });


        }
    })
    }

      //IF Bulk Offer are Yes
    if(flash_sale == '' && specialOffer == '' && bulkOffer == 'yes'){

        productModel.findOne({_id:productId}).exec(function(err,document){

            //If bulk offer is null
            if(document.bulk_offer == null){
                var saveBulkOffer = new BulkOfferModel({
                    product_id : productId,
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                saveBulkOffer.save();

                var updateFlashSale =ModelFlashSale.findByIdAndDelete(flash_sale_id);
                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(bulk_offer_id);

                     //Removing Previous Offer Image
                     if(previousSpecialOfferImage != undefined){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                    }

                
                var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : null,
                    special_offer : null,
                    bulk_offer : saveBulkOffer._id
                });

                updateProduct.exec(function(err,doc){
                    updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                               updateProductFlashSale.exec(function(err5,doc5){
                                   req.flash('success','Product Updated Succesfully. Thank you!!!');
                                   res.redirect('/product/index');
                               }); 
                        });  
                    });     
                 });
            }

              //If bulk offer is not null
            if(document.bulk_offer != null){

                var updateBulkOffer = BulkOfferModel.findByIdAndUpdate(bulk_offer_id,{
                    minimum_product : bulk_minimum_product,
                    bulkDiscountPercent : bulkDiscountPercent,
                    status : bulkoffer_status,
                });

                var updateFlashSale =ModelFlashSale.findByIdAndDelete(flash_sale_id);
                var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(bulk_offer_id);

                     //Removing Previous Offer Image
                     if(previousSpecialOfferImage != undefined){
                        var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
                        fs.unlinkSync(filePath);
                    }

                
                var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
                    flash_sale : null,
                    special_offer : null,
                    bulk_offer : bulk_offer_id
                });

                updateProduct.exec(function(err,doc){
                    updateBulkOffer.exec(function(err2,doc2){
                        updateFlashSale.exec(function(err2,doc2){
                            updateSpecialOffer.exec(function(err3,doc3){
                                updateProductFlashSale.exec(function(err5,doc5){
                                   req.flash('success','Product Updated Succesfully. Thank you!!!');
                                   res.redirect('/product/index');
                               }); 
                            });  
                        }); 
                    });     
                 });

            }
        });
    }

      //IF  Flash Sale && SpecialOffer & Bulk Offer are not yes
    if(flash_sale == '' && specialOffer == '' && bulkOffer == ''){

        var updateFlashSale = ModelFlashSale.findByIdAndDelete(flash_sale_id);
        var updateSpecialOffer = SpecialOfferModel.findByIdAndDelete(special_offer_id);
        var updateBulkOffer = BulkOfferModel.findByIdAndDelete(bulk_offer_id);
        var productDetails =   productModel.findOne({_id:productId}).populate('category_id');

        //Removing Previous Offer Image
        if(previousSpecialOfferImage != null){
            var filePath = './public/images/backend/products/special_offer/'+previousSpecialOfferImage;
            fs.unlinkSync(filePath);
            }

        var updateProductFlashSale = ModelProduct.findByIdAndUpdate(productId,{
            flash_sale : null,
            special_offer : null,
            bulk_offer : null
        }); 

     


         productDetails.exec(function(err,doc){
            console.log(doc);

           if(booktype == 'paperbook' && doc.ebook_id != null){

            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                ebook_id : null,
                slug : slugname,
                status : status,
            });

            //Deleting Previous File If it is not null
       
                if(previousPdfFile != ''){
                    var filePath = './public/images/backend/products/ebook/'+previousPdfFile;
                    fs.unlinkSync(filePath);
                    }
            
       
         
           var deleteEBook = ebookModel.findOneAndDelete({product_id : productId});


           
           updateProduct.exec(function(err,doc){
            var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
            subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                if(subcategoriesData){
                     subcategoriesData.products.push(productId);
                     subcategoriesData.save();
                }
             });

                deleteEBook.exec(function(err,doc){
                console.log('not null');

            removeArray.exec(function(err1,doc1){
                 updateFlashSale.exec(function(err2,doc2){
                    updateSpecialOffer.exec(function(err3,doc3){
                        updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashSale.exec(function(err5,doc5){
                                
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                     });     
                 });
                });       
            });
         });

        }else if(booktype == 'paperbook' && doc.ebook_id == null){

            
            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                ebook_id : null,
                slug : slugname,
                status : status,
            });
         
      

           updateProduct.exec(function(err,doc){

            var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
            subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                if(subcategoriesData){
                     subcategoriesData.products.push(productId);
                     subcategoriesData.save();
                }
             });

            removeArray.exec(function(err1,doc1){
                 updateFlashSale.exec(function(err2,doc2){
                    updateSpecialOffer.exec(function(err3,doc3){
                        updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashSale.exec(function(err5,doc5){
                                
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                     });     
                 });
                });       
         });

                
        }else if(booktype == 'ebook' && doc.ebook_id == null){
          
            var pdfFile;
            if(images.ebook_file == undefined){
                pdfFile = null;
            }else{
        
                var pdfFile = images.ebook_file[0].filename;
        
                var img = fs.readFileSync(images.ebook_file[0].path);
                var encode_image = img.toString('base64');
            
        
                const currentPath = path.join(images.ebook_file[0].path);
                const newPath = path.join('./public/images/backend/products/ebook/',pdfFile);
                fs.renameSync(currentPath, newPath);
            
            }

            var saveEbook = new ebookModel({
                product_id : productId,
                ebook_file : pdfFile,
                ebook_price : ebookPrice, 
            });

            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                ebook_id : saveEbook._id,
                slug : slugname,
                status : status, 
            }); 

            saveEbook.save();

            updateProduct.exec(function(err,doc){
                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
    
                removeArray.exec(function(err1,doc1){
                     updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                            updateBulkOffer.exec(function(err4,doc4){
                                updateProductFlashSale.exec(function(err5,doc5){
                             
                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                    res.redirect('/product/index');
                                });
                            });  
                         });     
                     });       
                });
             });
        }else if(booktype == 'both' && doc.ebook_id == null){

            var pdfFile;
            console.log(images.ebook_file);
      

            if(images.ebook_file == undefined){
           
                pdfFile = null;
            }else{
        
                var pdfFile = images.ebook_file[0].filename;
        
                var img = fs.readFileSync(images.ebook_file[0].path);
                var encode_image = img.toString('base64');
            
        
                const currentPath = path.join(images.ebook_file[0].path);
                const newPath = path.join('./public/images/backend/products/ebook/',pdfFile);
                fs.renameSync(currentPath, newPath);
            
            }
          
            var saveEbook = new ebookModel({
                product_id : productId,
                ebook_file : pdfFile,
                ebook_price : ebookPrice, 
            });

            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                ebook_id : saveEbook._id,
                slug : slugname,
                status : status, 
            }); 

            saveEbook.save();

            updateProduct.exec(function(err,doc){
                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
    
                removeArray.exec(function(err1,doc1){
                     updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                            updateBulkOffer.exec(function(err4,doc4){
                                updateProductFlashSale.exec(function(err5,doc5){
                             
                                    req.flash('success','Product Updated Succesfully. Thank you!!!');
                                    res.redirect('/product/index');
                                });
                            });  
                         });     
                     });       
                });
             });
        }else if(booktype == 'ebook' && doc.ebook_id != null){
         
            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                slug : slugname,
                status : status, 
            }); 

            var pdfFile;
            if(images.ebook_file == undefined){
             

                if(previousPdfFile == ''){
                    pdfFile = null;
                }else{
                    pdfFile = previousPdfFile
                }

            }else{
        
                var pdfFile = images.ebook_file[0].filename;
        
                var img = fs.readFileSync(images.ebook_file[0].path);
                var encode_image = img.toString('base64');
            
                //String New File
                const currentPath = path.join(images.ebook_file[0].path);
                const newPath = path.join('./public/images/backend/products/ebook/',pdfFile);
                fs.renameSync(currentPath, newPath);

                    //Removing Previous PDf File
                if(previousPdfFile != ''){
                    var filePath = './public/images/backend/products/ebook/'+previousPdfFile;
                    fs.unlinkSync(filePath);
                    }
            
            }


            var updateEbook = ebookModel.findOneAndUpdate({_id:ebook_id},{
                ebook_price : ebookPrice,
                ebook_file : pdfFile,
            });

            updateProduct.exec(function(err,doc){
                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
            
            
                removeArray.exec(function(err1,doc1){
                     updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                            updateBulkOffer.exec(function(err4,doc4){
                                updateProductFlashSale.exec(function(err5,doc5){
                                    updateEbook.exec(function(err6,doc6){
                                        req.flash('success','Product Updated Succesfully. Thank you!!!');
                                        res.redirect('/product/index');
                                    });
                                });
                            });  
                         });     
                     });       
                });
             });
        }else if(booktype == 'both' && doc.ebook_id != null){
            console.log('not null');
            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : booktype,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                slug : slugname,
                status : status, 
            }); 

            var pdfFile;
            if(images.ebook_file == undefined){
             

                if(previousPdfFile == ''){
                    pdfFile = null;
                }else{
                    pdfFile = previousPdfFile
                }

            }else{
        
                var pdfFile = images.ebook_file[0].filename;
        
                var img = fs.readFileSync(images.ebook_file[0].path);
                var encode_image = img.toString('base64');
            
                //String New File
                const currentPath = path.join(images.ebook_file[0].path);
                const newPath = path.join('./public/images/backend/products/ebook/',pdfFile);
                fs.renameSync(currentPath, newPath);

                    //Removing Previous PDf File
                if(previousPdfFile != ''){
                    var filePath = './public/images/backend/products/ebook/'+previousPdfFile;
                    fs.unlinkSync(filePath);
                    }
            
            }


            var updateEbook = ebookModel.findOneAndUpdate({_id:ebook_id},{
                ebook_price : ebookPrice,
                ebook_file : pdfFile,
            });

            updateProduct.exec(function(err,doc){
                var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
                subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                    if(subcategoriesData){
                         subcategoriesData.products.push(productId);
                         subcategoriesData.save();
                    }
                 });
            
            
                removeArray.exec(function(err1,doc1){
                     updateFlashSale.exec(function(err2,doc2){
                        updateSpecialOffer.exec(function(err3,doc3){
                            updateBulkOffer.exec(function(err4,doc4){
                                updateProductFlashSale.exec(function(err5,doc5){
                                    updateEbook.exec(function(err6,doc6){
                                        req.flash('success','Product Updated Succesfully. Thank you!!!');
                                        res.redirect('/product/index');
                                    });
                                });
                            });  
                         });     
                     });       
                });
             });
        }else if(doc.category_id.category_name == 'Stationary'){
            
            var updateProduct = productModel.findByIdAndUpdate(productId,{
                book_type : null,
                product_image : productImage,
                product_description : productDescription,
                category_id : category_id,
                subcategory_id : subcategory_id,
                product_name : productName,
                product_price : productPrice,
                product_stock : productStock,
                ebook_id : null,
                slug : slugname,
                status : status,
            });

                     
           updateProduct.exec(function(err,doc){
            var removeArray = subcategoryModel.update({_id:doc.subcategory_id}, { $pull: { products : { $in : doc._id} }})
            subcategoryModel.findOne({_id:subcategory_id},function(error,subcategoriesData){
                if(subcategoriesData){
                     subcategoriesData.products.push(productId);
                     subcategoriesData.save();
                }
             });

          
            

            removeArray.exec(function(err1,doc1){
                 updateFlashSale.exec(function(err2,doc2){
                    updateSpecialOffer.exec(function(err3,doc3){
                        updateBulkOffer.exec(function(err4,doc4){
                            updateProductFlashSale.exec(function(err5,doc5){
                                
                                req.flash('success','Product Updated Succesfully. Thank you!!!');
                                res.redirect('/product/index');
                            });
                        });  
                     });     
                 });
                });                
         });
        }
        });
    }
    //End If there is no Flash sale
});


router.get('/delete/:id',function(req,res,next){
    var Id = req.query.Id;
   
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;
    var id = req.params.id;


    var deleteProduct = ModelProduct.findByIdAndDelete(id).populate('category_id').populate('images');

    deleteProduct.exec(function(err,data){
        if(err) throw err;
     
        // return;
        var deleteProductArray = subcategoryModel.update({_id:data.subcategory_id}, { $pull: { products: {$in: data._id }}});
        
        //IF All are not null
        if(data.flash_sale != null && data.special_offer != null && data.bulk_offer != null){
            
           
                var deleteProductFlashSale = ModelFlashSale.findByIdAndDelete(data.flash_sale);
                var deleteProductSpecialOffer = SpecialOfferModel.findByIdAndDelete(data.special_offer);
                var deleteProductBulkOffer = BulkOfferModel.findByIdAndDelete(data.bulk_offer);

                deleteProductArray.exec(function(err1,data1){
                    deleteProductFlashSale.exec(function(err2,data2){
                        deleteProductSpecialOffer.exec(function(err3,data3){
                            deleteProductBulkOffer.exec(function(err4,data4){
                
                                // If Product image is not null
                                if(data.product_image != null){       
                                    var filePath = './public/images/backend/products/'+data.product_image;
                                    fs.unlinkSync(filePath);
                                }

                                // If category image is not null
                                if(data3.specialoffer_image != null){       
                                    var filePath = './public/images/backend/products/special_offer/'+data3.specialoffer_image;
                                    fs.unlinkSync(filePath);
                                }

                                req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                return res.redirect('/product/index'); 

                            });
                        });
                    });
                });
        }

            //IF Flash Sale is not null
        if(data.flash_sale != null && data.special_offer == null && data.bulk_offer == null){
                var deleteProductFlashSale = ModelFlashSale.findByIdAndDelete(data.flash_sale);
                    deleteProductArray.exec(function(err1,data1){
                    deleteProductFlashSale.exec(function(err2,data2){
                
                        // If Product image is not null
                        if(data.product_image != null){       
                            var filePath = './public/images/backend/products/'+data.product_image;
                            fs.unlinkSync(filePath);
                        }

                        

                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                        return res.redirect('/product/index'); 
                });
            });
        }

        //IF Flash Sale & SpecialOffer are not null
        if(data.flash_sale != null && data.special_offer != null && data.bulk_offer == null){
             

                var deleteProductFlashSale = ModelFlashSale.findByIdAndDelete(data.flash_sale);
                var deleteProductSpecialOffer = SpecialOfferModel.findByIdAndDelete(data.special_offer);

                   deleteProductArray.exec(function(err1,data1){
                        deleteProductFlashSale.exec(function(err2,data2){
                            deleteProductSpecialOffer.exec(function(err3,data3){
               
                                // If Product image is not null
                                if(data.product_image != null){       
                                    var filePath = './public/images/backend/products/'+data.product_image;
                                    fs.unlinkSync(filePath);
                                }

                                      // If category image is not null
                                      if(data3.specialoffer_image != null){       
                                        var filePath = './public/images/backend/products/special_offer/'+data3.specialoffer_image;
                                        fs.unlinkSync(filePath);
                                    }
   
                                req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                return res.redirect('/product/index'); 
                    });
               });
           });
        }

        //IF Flash Sale & Bulk OFfer are not null
        if(data.flash_sale != null && data.special_offer == null && data.bulk_offer != null){

            var deleteProductFlashSale = ModelFlashSale.findByIdAndDelete(data.flash_sale);
            var deleteProductBulkOffer = BulkOfferModel.findByIdAndDelete(data.bulk_offer);

            deleteProductArray.exec(function(err1,data1){
                deleteProductFlashSale.exec(function(err2,data2){
                    deleteProductBulkOffer.exec(function(err3,data3){
       
                        // If Product image is not null
                        if(data.product_image != null){       
                            var filePath = './public/images/backend/products/'+data.product_image;
                            fs.unlinkSync(filePath);
                        }

                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                        return res.redirect('/product/index'); 
            });
       });
   });

        }

        //If Special OFfer is not null
        if(data.flash_sale == null && data.special_offer != null && data.bulk_offer == null){
            console.log('special Sale');
            var deleteProductSpecialOffer = SpecialOfferModel.findByIdAndDelete(data.special_offer);

            deleteProductArray.exec(function(err1,data1){
                deleteProductSpecialOffer.exec(function(err3,data3){     
    
                        // If category image is not null
                        if(data3.specialoffer_image != null){       
                            var filePath = './public/images/backend/products/special_offer/'+data3.specialoffer_image;
                            fs.unlinkSync(filePath);
                        }

                        if(data.product_image != null){       
                            var filePath = './public/images/backend/products/'+data.product_image;
                            fs.unlinkSync(filePath);
                        }
    
                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                        return res.redirect('/product/index');
                    });
            });
        }

        //If Special OFfer is not null
        if(data.flash_sale == null && data.special_offer != null && data.bulk_offer != null){
            console.log('specialasd Sale');
            var deleteProductSpecialOffer = SpecialOfferModel.findByIdAndDelete(data.special_offer);
            var deleteProductBulkOffer = BulkOfferModel.findByIdAndDelete(data.bulk_offer);
           

            deleteProductArray.exec(function(err1,data1){
                deleteProductBulkOffer.exec(function(err2,data2){
                    deleteProductSpecialOffer.exec(function(err3,data3){     
        
                            // If category image is not null
                            if(data3.specialoffer_image != null){       
                                var filePath = './public/images/backend/products/special_offer/'+data3.specialoffer_image;
                                fs.unlinkSync(filePath);
                            }

                            if(data.product_image != null){       
                                var filePath = './public/images/backend/products/'+data.product_image;
                                fs.unlinkSync(filePath);
                            }
        
                            req.flash('success','Data Deleted Succesfully. Thank you!!!');
                            return res.redirect('/product/index');
                        });
                    });
            });
        }

        //If Bulk OFfer is not null
        if(data.flash_sale == null && data.special_offer == null && data.bulk_offer != null ){
                var deleteProductBulkOffer = BulkOfferModel.findByIdAndDelete(data.bulk_offer);

                deleteProductArray.exec(function(err1,data1){
                        deleteProductBulkOffer.exec(function(err3,data3){     
        
                            // If category image is not null
                            if(data.product_image != null){       
                                var filePath = './public/images/backend/products/'+data.product_image;
                                fs.unlinkSync(filePath);
                            }
        
                            req.flash('success','Data Deleted Succesfully. Thank you!!!');
                            return res.redirect('/product/index');
                        });
                });
        }

        //If All are null
        if(data.flash_sale == null && data.special_offer == null && data.bulk_offer == null ){

        // If category image is not null
        if(data.product_image != null){       
            var filePath = './public/images/backend/products/'+data.product_image;
            fs.unlinkSync(filePath);
        }

          
        deleteProductArray.exec(function(err1,data1){   
              
            //If Category is Book
            if(data.category_id.category_name == 'Book'){

                //IF Product Image is Not Empty
                if(data.images.length > 0){
                
                    var deleteProductImages = productImagesModel.deleteMany({product_id : data._id});

                    data.images.forEach(function(imgdoc){
                        var filePath = './public/images/backend/products/product_images/'+imgdoc.productImage;
                        fs.unlinkSync(filePath);
                    })  
                   
                    //IF Eboo_id Is not null or Ebook file is present
                    if(data.ebook_id != null  ){

                        var deleteEbook = ebookModel.findByIdAndDelete(data.ebook_id);
                        
                         //Book Attribute is not empty
                        if(data.book_attribute.length > 0){ 
                       
                            var bookAttribute_id = data.book_attribute[0];
                            var deleteBookAttribute = bookAttributesModel.findOneAndDelete({_id : bookAttribute_id});
                            
                            //Delete Book Attributes
                            deleteBookAttribute.exec(function(err2, data2){
                                var removeArray = ModelProduct.update({_id:id}, { $pull: { book_attribute: { $in: data2._id  } }});  
                               
                                removeArray.exec(function(err2,data2){
                                    deleteProductImages.exec(function(err3,data3){

                                        var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  
                                        // If category image is not null
                                        
                                        deleteEbook.exec(function(err1,data1){

                                            //Removing Ebook File
                                            var filePath = './public/images/backend/products/ebook/' + data1.ebook_file;
                                            fs.unlinkSync(filePath);
                                            
                                            removeProductImages.exec(function(err4,data4){
                                                req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                                return res.redirect('/product/index');
                                            });
                                        });
                                    });
                                });
                            });
                        }else{    //Book Attribute is  empty
                           
                            deleteProductImages.exec(function(err3,data3){
                                
                                var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  
                                                      
                                removeProductImages.exec(function(err4,data4){
                                    deleteEbook.exec(function(err1,data1){

                                        //Removing Ebook File
                                        var filePath = './public/images/backend/products/ebook/' + data1.ebook_file;
                                        fs.unlinkSync(filePath);
                                    
                                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                         return res.redirect('/product/index');
                                    });
                            
                                });
                            });              
                        }

                    }else{
                               //Book Attribute is not empty
                        if(data.book_attribute.length > 0){ 
                            console.log('attr');

                            var bookAttribute_id = data.book_attribute[0];
                            var deleteBookAttribute = bookAttributesModel.findOneAndDelete({_id : bookAttribute_id});
                        
                            deleteBookAttribute.exec(function(err2, data2){
                                var removeArray = ModelProduct.update({_id:id}, { $pull: { book_attribute: { $in: data2._id  } }});  
                               
                                removeArray.exec(function(err2,data2){
                                    deleteProductImages.exec(function(err3,data3){

                                        var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  
                                        // If category image is not null
                                  

                                        removeProductImages.exec(function(err4,data4){
                                            req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                            return res.redirect('/product/index');
                                        });
                                    
                                    });
                                });
                     
                            });
                        }else{    //Book Attribute is  empty
                           
                            deleteProductImages.exec(function(err3,data3){
                                
                                var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  
                                                      
                                removeProductImages.exec(function(err4,data4){
                                    req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                    return res.redirect('/product/index');
                                });
                            

                            });              
                        }
                        }
                     
                    }else{    
                       
                //IF Product Image is  Empty
                //If Ebook is not null
                    
                if(data.ebook_id != null  ){

                   var deleteEbook = ebookModel.findByIdAndDelete(data.ebook_id);


                    //IF Book Attribute is not null
                        if(data.book_attribute.length > 0 ){ 
                        
                            var bookAttribute_id = data.book_attribute[0];

                            //Deleting Book Attributes
                            var deleteBookAttribute = bookAttributesModel.findOneAndDelete({_id : bookAttribute_id});
                            
                            deleteBookAttribute.exec(function(err2, data2){

                                //Removing Book-attributes array in Product
                                var removeArray = ModelProduct.update({_id:id}, { $pull: { book_attribute: { $in: data2._id  } }});  
                                removeArray.exec(function(err2,data2){
                                    deleteEbook.exec(function(err1,data1){

                                        //Removing Ebook File
                                        var filePath = './public/images/backend/products/ebook/' + data1.ebook_file;
                                        fs.unlinkSync(filePath);
        

                                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                        return res.redirect('/product/index');
                                    });
                                 });
                            });
                        }else{

                        
                            //If Book Attribute is null
                            deleteEbook.exec(function(err1,data1){
                              
                                //Removing Book Attributes
                                var filePath = './public/images/backend/products/ebook/' + data1.ebook_file;
                                fs.unlinkSync(filePath);

                                req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                return res.redirect('/product/index');   
                            });
                                     
                        }
                    }else{
                       
                        if(data.book_attribute.length > 0 ){ 
                            var bookAttribute_id = data.book_attribute[0];

                            var deleteBookAttribute = bookAttributesModel.findOneAndDelete({_id : bookAttribute_id});
                            
                            deleteBookAttribute.exec(function(err2, data2){
                                var removeArray = ModelProduct.update({_id:id}, { $pull: { book_attribute: { $in: data2._id  } }});  
                                removeArray.exec(function(err2,data2){
                                    req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                    return res.redirect('/product/index');
                                });
                     
                            });
                        }else{
  
                            req.flash('success','Data Deleted Succesfully. Thank you!!!');
                            return res.redirect('/product/index');              
                        }
                    }
                       
                    }


                    //If Category is Stationary        
                    }
                    else if(data.category_id.category_name == 'Stationary'){

                        //IF Product Images Are Not Empty
                        if(data.images.length > 0){

                            var deleteProductImages = productImagesModel.deleteMany({product_id : data._id});

                            data.images.forEach(function(imgdoc){
                                var filePath = './public/images/backend/products/product_images/'+imgdoc.productImage;
                                fs.unlinkSync(filePath);
                            })  




                            //IF Stationary Attribute array is empty
                            if(data.stationary_attribute.length > 0){
                               
                                var stationaryAttribute_id = data.stationary_attribute[0];
                                var deleteStationaryAttribute = stationaryAttributesModel.findOneAndDelete({_id : stationaryAttribute_id});
                            
                                deleteStationaryAttribute.exec(function(err2, data2){
                                    var removeArray = ModelProduct.update({_id:id}, { $pull: { stationary_attribute: { $in: data2._id  } }});  
        
                                    removeArray.exec(function(err2,data2){
                                        deleteProductImages.exec(function(err3,data3){

                                            var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  

                                            removeProductImages.exec(function(err4,data4){
                                                req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                                return res.redirect('/product/index'); 
                                            });
                                        });
                                    });
                        
                                });
                            }else{

                               //IF Stationary Attribute array is not empty
                                deleteProductImages.exec(function(err3,data3){

                                    var removeProductImages = ModelProduct.update({_id:id}, { $pull: { images: { $in: data3._id  } }});  

                                    removeProductImages.exec(function(err4,data4){
                                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                        return res.redirect('/product/index'); 
                                    });
                                });
                            }   
                        }else{
                            //IF Imagge array is empty but stationary attribute is not
                            if(data.stationary_attribute.length > 0){
                            
                                var stationaryAttribute_id = data.stationary_attribute[0];
                                var deleteStationaryAttribute = stationaryAttributesModel.findOneAndDelete({_id : stationaryAttribute_id});
                            
                                deleteStationaryAttribute.exec(function(err2, data2){
                                    var removeArray = ModelProduct.update({_id:id}, { $pull: { stationary_attribute: { $in: data2._id  } }});  
        
                                    removeArray.exec(function(err2,data2){
                                        req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                        return res.redirect('/product/index');
                                    });
                        
                                });
                            }else{
                             //IF Imagg array and stationary attribute is empty
                                    req.flash('success','Data Deleted Succesfully. Thank you!!!');
                                    return res.redirect('/product/index');
                            }


                        }
                    }

                });
            }
      }); 
});


router.get('/changecategory',function(req,res,next){
    var Id = req.query.Id;
   
    var category = subcategoryModel.find({category_type_id:Id});
    category.exec(function(err,data){
        res.send(data);
      
    });
});


// -------------------------------------------------------------   Add Attributes   ------------------------------------------------------------------------------------

router.get('/:id/attributes/index',function(req,res,next){
    var productId = req.params.id;
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;


    var productDetails = productModel.findOne({ _id : productId }).populate('category_id');
    var bookattributes = bookAttributesModel.find({product_id:productId});
    var stationaryattributes = stationaryAttributesModel.find({product_id:productId});

    bookattributes.exec(function(err,data){
        productDetails.exec(function(err1,data1){
            stationaryattributes.exec(function(err2,data2){
                res.render('backend/products/attributes/index',{adminType,productId,records:data,productDetails:data1,records1:data2,title:"Product Attribute Lists"});
            })
        })
    });
   
});


//storage for Image Upload
var attribitesStorage = multer.diskStorage({

    // destination: './public/images/backend/admins/',
    filename: function(req,file,cb){
     
      var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
    }
});

// var attributeImages = multer({
//     storage:attribitesStorage
// }).fields([
//     {name: 'images0'},
//     {name: 'images1'}
// ]);

var attributeImages = multer({
    storage:attribitesStorage
}).any();
  

router.post('/:id/attributes/store',attributeImages,function(req,res,next){

    var data = req.body;
  

    var productId = req.params.id;
    var category_name = req.body.category_name;

    var product_code = req.body.product_code;
    var author_name = req.body.author_name;
    var publication_name = req.body.publication_name;
    var total_pages = req.body.total_pages;
    var published_year = req.body.published_year;
    var language = req.body.language;
    var manufacturer_name = req.body.manufacturer_name;
    var status = req.body.status;

   var images = req.files;

    if(category_name == 'Stationary'){
        var  saveStationaryAttributes = new stationaryAttributesModel({
            product_id : productId,
            product_code : product_code,
            manufacturer_name : manufacturer_name,
            status : status,
        });

        saveStationaryAttributes.save();

        ModelProduct.findOne({_id:productId},function(error,productData){
            if(productData){
                productData.stationary_attribute.push(saveStationaryAttributes);
                productData.save();
            }
        });

        
    }else{

        var  saveBookAttributes = new bookAttributesModel({
            product_id : productId,
            product_code : product_code,
            author_name : author_name,
            publication : publication_name,
            total_pages : total_pages,
            published_year : published_year,
            language : language,
            status : status,
        });
  
        saveBookAttributes.save();

        ModelProduct.findOne({_id:productId},function(error,productData){
            if(productData){
                productData.book_attribute.push(saveBookAttributes);
                productData.save();
            }
        });

    }

   

      



//    var uniqueFieldNameArray = [];
  
//    //For Accessing Field Name
//     images.forEach(function(data,index){
       
//         var a = images[index].fieldname;
//         uniqueFieldNameArray.push(a);

//        });

//        //For Filterring unique fielname
//        uniqueArray = uniqueFieldNameArray.filter(function(elem, pos) {
//         return uniqueFieldNameArray.indexOf(elem) == pos;
//     });

//     console.log(uniqueArray);
//     console.log(images);


// var uniqueArray = ['images0','images1'];


        //saving with images   
    //     sku.forEach(function(data, index){
            
    //         var uniqueArray = 'images'+parseInt(index);
    //         // console.log(uniqueArray);
    //         //IF filename is same the push into an separate array
    //         var array = [];
    //         images.forEach(function(data1,index1){
    //                 if(images[index1].fieldname == uniqueArray){
    //                     array.push(images[index1]);
    //                    }                   
    //            });

         
    //        var  saveProductAttributes = new attributeModel({
    //         product_id : productId,
    //         sku_name : data,
    //         size : size[index],
    //         color : color[index],
    //         price : price[index],
    //         stock : stock[index],
    //         status:status[index],
    //     });


    //     // array.forEach(function(data2, index2){
    //     //     var saveProductAttributeImages = new productAttributeImagesModel({
    //     //         product_id : productId,
    //     //         productAttribute_id : saveProductAttributes._id,
    //     //         productAttributeImage : data2.filename,
    //     //         status:status[index],
    //     //     });

    //     //     saveProductAttributeImages.save();

    //     //     //Pusing into array in attributes table
    //     //     saveProductAttributes.images.push(saveProductAttributeImages);
          
    //     // });


    //     ModelProduct.findOne({_id:productId},function(error,productData){
    //         if(productData){
    //             productData.attributes.push(saveProductAttributes);
    //             productData.save();
    //         }
    //     });

    //     saveProductAttributes.save();
    // });


        req.flash('success','Product Attributes Updated Succesfully. Thank you!!!');
        res.redirect('/product/'+  productId +'/attributes/index');

});





router.get('/:id/attributes/edit/:attributeId',function(req,res,next){
    var productId = req.params.id;
    var attributeId = req.params.attributeId;

    var product_code = req.body.product_code;
    var author_name = req.body.author_name;
    var publication_name = req.body.publication_name;
    var total_pages = req.body.total_pages;
    var published_year = req.body.published_year;
    var language = req.body.language;
    var status = req.body.status;



    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    var editAttribute = bookAttributesModel.findOne({_id:attributeId,product_id:productId});
    var stationaryAttribute = stationaryAttributesModel.findOne({_id:attributeId,product_id:productId});
    var productDetails = productModel.findOne({ _id : productId }).populate('category_id');

    var selected = 'selected';



  
        editAttribute.exec(function(err,data){
            productDetails.exec(function(err1,data1){
                stationaryAttribute.exec(function(err2,data2){
                 console.log(data2);
                    res.render('backend/products/attributes/edit',{adminType,selected,productId,records:data,records1:data2,productDetails:data1,title:"Product Attribute Lists"});
                })
            })
        })

});


router.post('/:id/attributes/update/:attributeId',function(req,res,next){
    var productId = req.params.id;
    var attributeId = req.params.attributeId;

    var product_code = req.body.product_code;
    
    //For Book
    var author_name = req.body.author_name;
    var publication_name = req.body.publication_name;
    var total_pages = req.body.total_pages;
    var published_year = req.body.published_year;
    var language = req.body.language;

    //For Stationary
    var manufacturer_name = req.body.manufacturer_name;
    var category_name = req.body.category_name;

    var status = req.body.status;



if(category_name == 'Stationary'){
    updateAttributes =  stationaryAttributesModel.findByIdAndUpdate(attributeId,{
        product_code : product_code,
        manufacturer_name : manufacturer_name,
        publication : publication_name,
        status: status

    });
}else if(category_name == 'Book'){
    updateAttributes =  bookAttributesModel.findByIdAndUpdate(attributeId,{
        product_code : product_code,
        author_name : author_name,
        publication : publication_name,
        total_pages : total_pages,
        published_year : published_year,
        language : language,
        status: status

    });
}

    updateAttributes.exec(function(err,data){
        req.flash('success','Product Attributes Updated Succesfully. Thank you!!!');
        res.redirect('/product/'+  productId +'/attributes/index');
    });

});

router.get('/:id/attributes/delete/:attributeId',function(req,res,next){
    var productId = req.params.id;
    var attributeId = req.params.attributeId;

    var productDetails = ModelProduct.findById(productId).populate('category_id');
    
    productDetails.exec(function(error,doc){
        if(doc.category_id.category_name == 'Book'){
            var deleteBookAttribute = bookAttributesModel.findByIdAndDelete(attributeId);

            deleteBookAttribute.exec(function(err,data){
                var removeArray = ModelProduct.update({_id:productId}, { $pull: { book_attribute : { $in: data._id  } }});  
                removeArray.exec(function(err2,data2){
                    req.flash('success','Product Attributes Deleted Succesfully. Thank you!!!');
                    res.redirect('/product/'+  productId +'/attributes/index');
                });
            });
        }else if(doc.category_id.category_name == 'Stationary'){
            var deletestationaryAttribute = stationaryAttributesModel.findByIdAndDelete(attributeId);

            deletestationaryAttribute.exec(function(err,data){
                var removeArray = ModelProduct.update({_id:productId}, { $pull: { stationary_attribute : { $in: data._id  } }});  
                removeArray.exec(function(err2,data2){
                    req.flash('success','Product Attributes Deleted Succesfully. Thank you!!!');
                    res.redirect('/product/'+  productId +'/attributes/index');
                });
            });
        }
       
    });

});
                                    // End of Product Attributes

//Product Images

router.get('/:id/productimages/index',function(req,res,next){
    var productId = req.params.id;
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    var productImage = productImagesModel.find({product_id:productId});

        productImage.exec(function(err,data){
         
            res.render('backend/products/productimages/index',{adminType,productId,title:"Product Image Lists",records:data,productId});
        });   
});


router.get('/:id/productimages/create',function(req,res,next){
    var productId = req.params.id;
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    res.render('backend/products/productimages/create',{adminType,productId,title:"Create Product Image "}); 
});



var product = multer({
    storage:Storage
}).array('product_images',1000);
  
router.post('/:id/productimages/store',product,function(req,res,next){
    var productId = req.params.id;
    var images = req.body.product_images;
    var status = req.body.status;

    var images = req.files;
    console.log(images);
    images.forEach(function(data){
  
    var image;
    if(req.files == null){
        image = "";
    }else{
        image = data.filename;

        let width = 500;
        let height = 500;
        
        sharp(data.path).resize(width,height).toFile('./public/images/backend/products/product_images/'+ image);
    }
  
        
       var storeImage = new productImagesModel({
            product_id : productId,
            productImage : image,
            status : status,
        })

        
        ModelProduct.findOne({_id:productId},function(error,productData){
            if(productData){
                productData.images.push(storeImage);
                productData.save();
            }
        });
        storeImage.save();
    })

 

    req.flash('success','Product Images Added Succesfully. Thank you!!!');
    res.redirect('/product/'+  productId+'/productimages/index');
});


router.get('/:id/productimages/edit/:productImageId',function(req,res,next){
    var productId = req.params.id;
    var productImageId = req.params.productImageId;
      var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

   var productImageDetails =  productImagesModel.findById(productImageId);
  

   productImageDetails.exec(function(err,data){
       console.log(data);
    res.render('backend/products/productimages/edit',{adminType,productId,title:"Edit Product Image ",records:data}); 
   });
     
});



var edit_productImage = multer({
    storage:Storage
}).single('product_image');
  
router.post('/:id/productimages/update',edit_productImage,function(req,res,next){
      
    var userName = req.cookies.userName;
    var adminType = req.cookies.adminType;

    var productImageId = req.body.Id;
    var productId = req.params.id;
 
    var status = req.body.status;
    var previousProductImage = req.body.previousproductImage;
   


    var image;
    if(req.file == null){
        image = previousProductImage;
    }else{
        image = req.file.filename;
        
        let width = 500;
        let height = 500;
        
        sharp(req.file.path).resize(width,height).toFile('./public/images/backend/products/product_images/'+ req.file.filename);

        if(previousProductImage != ''){
        var filePath = './public/images/backend/products/product_images/'+previousProductImage;
        fs.unlinkSync(filePath);
        }
    }

   var updateProductImage = productImagesModel.findByIdAndUpdate(productImageId,{
        productImage : image,
        status : status,
  
    });


    updateProductImage.exec(function(err,doc){

     
    req.flash('success','Product Image Updated Succesfully. Thank you!!!');
    res.redirect('/product/'+  productId+'/productimages/index');

});
   
});


router.get('/:id/productimages/delete/:productImageId',function(req,res,next){
    
    var productId = req.params.id;
    var ImageId = req.params.productImageId;
    console.log(ImageId);

    var deleteProductImage = productImagesModel.findByIdAndDelete(ImageId);

    deleteProductImage.exec(function(err,data){
        console.log(data);
        if(err) throw err;

        var removeArray = ModelProduct.update({_id:productId}, { $pull: { images: { $in: data._id  } }});  
            // If category image is not null
            if(data.productImage != null){       
                var filePath = './public/images/backend/products/product_images/'+data.productImage;
                fs.unlinkSync(filePath);
            }

    removeArray.exec(function(err1,data1){
        req.flash('success','Data Deleted Succesfully. Thank you!!!');
        res.redirect('/product/'+  productId+'/productimages/index');
    
    }); 
      }); 
});


module.exports = router;
