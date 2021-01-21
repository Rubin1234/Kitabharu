var app = require('express');
var path = require('path');
var multer = require('multer');
var bcrypt = require('bcryptjs');
var sharp = require('sharp');
var dateFormat = require('dateformat');
var slug = require('slug');       
var fs = require('fs');
var router = app.Router();
var videosModel = require('../../../modules/videos'); 
var settingModel = require('../../../modules/setting'); 
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
  

router.get('/',function(req,res,next){
    var adminType = req.cookies.adminType;
    var setting = settingModel.findOne({_id :'6009273977c64140bcc9fe12'});

    setting.exec(function(err,data){
    
        res.render('backend/setting/index',{
            adminType,
            title:"Videos List",
            data,
            dateFormat
        });
    })
});

router.get('/create',function(req,res,next){
    var adminType = req.cookies.adminType;
    res.render('backend/videos/create',{adminType,title:"Videos List"});
});



router.post('/store',upload,function(req,res,next){


    var adminType = req.cookies.adminType;

    var location = req.body.location;
    var email = req.body.email;
    var contact = req.body.contact;
    var regno = req.body.regno;
    var googlemap_link = req.body.googlemap_link;
    var facebook_link = req.body.facebook_link;
    var youtube_link = req.body.youtube_link;
    var twitter_link = req.body.twitter_link;
    var instagram_link = req.body.instagram_link;
    var linkedin_link = req.body.linkedin_link;

        
    var saveSetting = new settingModel({
        location : location,
        email : email,
        contact : contact,
        office_reg_no : regno,
        google_map_link : googlemap_link,
        facebook_link : facebook_link,
        youtube_link :youtube_link,
        twitter_link : twitter_link,
        instagram_link :instagram_link,
        linkedin_link : linkedin_link
    });
        
            saveSetting.save(function(err,data){
                req.flash('success','Setting Saved Succesfully. Thank you!!!');
                res.redirect('/settings');
            });
  
    });




// router.get('/edit/:id',function(req,res,next){
//     var adminType = req.cookies.adminType;
//     var Id = req.params.id;
//     var selected = 'selected';
//     var edit_videos = videosModel.findById(Id);

//     edit_videos.exec(function(err,data){
//         res.render('backend/videos/edit',{adminType,title:'Edit Video',data,selected});
//     });
// });


router.post('/update',upload,function(req,res,next){
   
    var location = req.body.location;
    var Id = req.body.id;
    var email = req.body.email;
    var contact = req.body.contact;
    var regno = req.body.regno;
    var googlemap_link = req.body.googlemap_link;
    var facebook_link = req.body.facebook_link;
    var youtube_link = req.body.youtube_link;
    var twitter_link = req.body.twitter_link;
    var instagram_link = req.body.instagram_link;
    var linkedin_link = req.body.linkedin_link;

  
    



     
                var updateSetting = settingModel.findByIdAndUpdate(Id,{
                    location : location,
                    email : email,
                    contact : contact,
                    office_reg_no : regno,
                    google_map_link : googlemap_link,
                    facebook_link : facebook_link,
                    youtube_link :youtube_link,
                    twitter_link : twitter_link,
                    instagram_link :instagram_link,
                    linkedIn_link : linkedin_link,
                });

                updateSetting.exec(function(err,data){
                    req.flash('success','Video Updated Succesfully. Thank you!!!');
                    return res.redirect('/settings');
                });


        

});


router.get('/delete/:id',function(req,res,next){
    var Id = req.params.id;
   var deleteVideos =  videosModel.findByIdAndDelete(Id);

   deleteVideos.exec(function(err,data){
        if(err) throw err;
        req.flash('success','Video Deleted Succesfully. Thank you!!!');
        return res.redirect('/myvideos/index');
    
      }); 

});














module.exports = router;
