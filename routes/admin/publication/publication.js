var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
var router = app.Router();
var publicationModel = require('../../../modules/publication'); 
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
}).single('publicationimage');
  


router.get('/index',function(req,res,next){
    var adminType = req.cookies.adminType;
    var publication = publicationModel.find({});

    publication.exec(function(err,data){
      
        res.render('backend/publication/index',{adminType,title:"Publication List",records:data,dateFormat});
    })

});

router.get('/create',function(req,res,next){
    var adminType = req.cookies.adminType;
    res.render('backend/publication/create',{adminType,title:"Publication List"});
});



router.post('/store',upload,function(req,res,next){

    
    var adminType = req.cookies.adminType;
    var publicationName = req.body.publicationname;
    var publicationDescription = req.body. publication_description;
    var status = req.body.status;

    var slugname = slug(publicationName);

    publicationModel.find({publication_name:publicationName}).exec(function(er,doc){
      
        if(doc.length > 0){
         req.flash('error','Sorry, The Article Title has Already Existed.');
         res.redirect('/articles/create'); 
        }else{

            var image;
            if(req.file == null){
                image = "";
            }else{
                image = req.file.filename;
        
                
                let width = 750;
                let height = 400;
        
                let width1 = 570;
                let height1 = 350;
                
                sharp(req.file.path).resize(width,height).toFile('./public/images/backend/publication/'+ req.file.filename);
                sharp(req.file.path).resize(width1,height1).toFile('./public/images/backend/publication/frontview/'+ req.file.filename);
            }
        
            var savepublication = new publicationModel({
                publication_name : publicationName,
                publication_image : image,
                publication_description : publicationDescription,
                status : status,
                slug : slugname
            });
        
            savepublication.save(function(err,data){
                req.flash('success','Publication Saved Succesfully. Thank you!!!');
                res.redirect('/publication/index');
            });
        }
    });
});



router.get('/edit/:id',function(req,res,next){
    var adminType = req.cookies.adminType;
    var Id = req.params.id;
    var selected = 'selected';
    var edit_publication = publicationModel.findById(Id);

    edit_publication.exec(function(err,data){
        res.render('backend/publication/edit',{adminType,title:'Edit Publication',data,selected});
    });
});


router.post('/update',upload,function(req,res,next){
    var publicationId = req.body.id;
   
    var publicationName = req.body.publicationname;
    var publicationDescription = req.body. publication_description;
    var previousPublicationImage = req.body.previousPublicationImage;
    var status = req.body.status;
    var slugname = slug(publicationName);


    publicationModel.find({_id:{$ne:publicationId},publication_name:publicationName}).exec(function(er,doc){
        if(doc.length > 0){
            req.flash('error','Sorry, The Article Title has Already Existed.');
            res.redirect('/articles/edit/'+articleId); 
           }else{
                var image;
                if(req.file == null){
                    image = previousPublicationImage;
                }else{
                    image = req.file.filename;
        
                    let width = 750;
                    let height = 425;

                    let width1 = 570;
                    let height1 = 350;
        
                    sharp(req.file.path).resize(width,height).toFile('./public/images/backend/publication/'+ req.file.filename);
                    sharp(req.file.path).resize(width1,height1).toFile('./public/images/backend/publication/frontview/'+ req.file.filename);

                    if(previousPublicationImage != ''){
                        console.log(1)
                    var filePath = './public/images/backend/publication/'+previousPublicationImage;
                    var filePath1 = './public/images/backend/publication/frontview/'+previousPublicationImage;
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(filePath1);
                    }
                }

                var updatePublication = publicationModel.findByIdAndUpdate(publicationId,{
                    publication_name : publicationName,
                    publication_image : image,
                    publication_description : publicationDescription,
                    status : status,
                    slug : slugname
                });

                updatePublication.exec(function(err,data){
                    req.flash('success','Publication Updated Succesfully. Thank you!!!');
                    return res.redirect('/publication/index');
                });
            }
    });
});


router.get('/delete/:id',function(req,res,next){
    var Id = req.params.id;
   var deletePublication =  publicationModel.findByIdAndDelete(Id);

   deletePublication.exec(function(err,data){
        if(err) throw err;

            // If category image is not null
            if(data.article_image != null){       
                var filePath = './public/images/backend/publication/'+data.publication_image;
                var filePath1 = './public/images/backend/publication/frontview/'+data.publication_image;
                fs.unlinkSync(filePath);
                fs.unlinkSync(filePath1);
            }


        req.flash('success','Publication Deleted Succesfully. Thank you!!!');
        return res.redirect('/publication/index');
    
      }); 

});














module.exports = router;
