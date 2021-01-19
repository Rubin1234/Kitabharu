var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
var router = app.Router();
var articleModel = require('../../../modules/articles'); 
var sessionstorage = require('sessionstorage');

//storage for Image Upload
var Storage = multer.diskStorage({

    // destination: './public/images/backend/admins/',
    filename: function(req,file,cb){
        console.log(cb)
      var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
    }
});
  
var upload = multer({
    storage:Storage
}).single('articleimage');
  


router.get('/index',function(req,res,next){
    var adminType = req.cookies.adminType;
    var article = articleModel.find({});

    article.exec(function(err,data){
      
        res.render('backend/articles/index',{adminType,title:"Articles List",records:data,dateFormat});
    })

});

router.get('/create',function(req,res,next){
    var adminType = req.cookies.adminType;
    res.render('backend/articles/create',{adminType,title:"Articles List"});
});



router.post('/store',upload,function(req,res,next){
    
    var adminType = req.cookies.adminType;
    var articleTitle = req.body.articlename;
    var articleDate = req.body.articledate;
    var articleDescription = req.body. product_description;
    var status = req.body.status;



    articleModel.find({article_title:articleTitle}).exec(function(er,doc){
      
        if(doc.length > 0){
         req.flash('error','Sorry, The Article Title has Already Existed.');
         res.redirect('/articles/create'); 
        }else{

            var image;
            if(req.file == null){
                image = "";
            }else{
                image = req.file.filename;
        
                
                let width = 865;
                let height = 577;
        
                let width1 = 570;
                let height1 = 350;
                
                sharp(req.file.path).resize(width,height).toFile('./public/images/backend/articles/'+ req.file.filename);
                sharp(req.file.path).resize(width1,height1).toFile('./public/images/backend/articles/frontview/'+ req.file.filename);
            }
        
            var saveArticle = new articleModel({
                article_title : articleTitle,
                article_date : articleDate,
                article_image : image,
                article_description : articleDescription,
                status : status,
            });
        
            saveArticle.save(function(err,data){
                req.flash('success','Article Saved Succesfully. Thank you!!!');
                res.redirect('/articles/index');
            });
        }
    });
});



router.get('/edit/:id',function(req,res,next){
    var adminType = req.cookies.adminType;
    var Id = req.params.id;
    var selected = 'selected';
    var edit_article = articleModel.findById(Id);

    edit_article.exec(function(err,data){
    
        res.render('backend/articles/edit',{adminType,title:'Edit Article',data,selected});
    });
});


router.post('/update',upload,function(req,res,next){
    var brandId = req.body.id;
    console.log(req.body);
return;

    var brandName = req.body.brandname;
    var previousBrandImage = req.body.previousBrandImage;
    var status = req.body.status;

    // var image;
    // if(req.file == null){
    //     image = previousBrandImage;
    // }else{

    //     image = req.file.filename;
        
    //     let width = 300;
    //     let height = 300;
        
    //     sharp(req.file.path).resize(width,height).toFile('./public/images/backend/brands/'+ req.file.filename);

      
    //     if(previousBrandImage != ''){
    //         console.log(1)
    //     var filePath = './public/images/backend/brands/'+previousBrandImage;
    //     fs.unlinkSync(filePath);
    //     }
    // }

    // var updateBrand = brandModel.findByIdAndUpdate(brandId,{
    //     brand_name : brandName,
    //     brand_image : image,
    //     status : status,
    // })

    // updateBrand.exec(function(err,data){
    //     req.flash('success','Data Updated Succesfully. Thank you!!!');
    //     return res.redirect('/brand/index');
    // });

    // console.log(image);
   

});














module.exports = router;
