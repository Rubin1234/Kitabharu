var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();

var adminTypeModel = require('../../../modules/admintype');


router.get('/index',function(req,res,next){
  var adminType = localStorage.getItem('adminType');
    var dataAdminType = adminTypeModel.find({});
   
    dataAdminType.exec(function(err,data){
      if(err) throw err;
  
    res.render('manageadmin/admintype/index',{adminType,title:"Add Admin Type",records:data,dateFormat});
    });
});



router.get('/create',function(req,res,next){
  var adminType = localStorage.getItem('adminType');
    res.render('manageadmin/admintype/create',{adminType,title:"Add Admin Type"});
});



router.post('/store',function(req,res,next){
  var admintype = req.body.admintype;
  var status = req.body.status;

  var saveAdminType = new adminTypeModel({
    admin_type: admintype,
    status: status,
  });

  saveAdminType.save(function(err){
    req.flash('success','Data Inserted Succesfully. Thank you!!!');
    res.redirect('/admintype/index');
  });
});


router.get('/edit/:id',function(req,res,next){
  var adminType = localStorage.getItem('adminType');
  var id = req.params.id;

  var editData = adminTypeModel.findOne({_id:id});

  editData.exec(function(err,data){
    if(err) throw err;
    var selected = 'selected'
    res.render('manageadmin/admintype/edit',{adminType,title:"Edit Admin Type",records:data,selected});
  });
});


router.post('/update',function(req,res,next){
  var id = req.body.id;
  var adminType = req.body.admintype;
  var status = req.body.status; 
  
  var update = adminTypeModel.findByIdAndUpdate(id,{
    admin_type : adminType,
    status: status
  });

    update.exec(function(err,data){
      req.flash('success','Data Updated Succesfully. Thank you!!!');
      return res.redirect('/admintype/index');
    })
});

router.get('/delete/:id',function(req,res,next){
  var id = req.params.id;
  var deleteAdminType = adminTypeModel.findByIdAndDelete(id);

  // var dataAdminType = adminTypeModel.find({});

  deleteAdminType.exec(function(err,data){
    if(err) throw err;

    req.flash('success','Data Deleted Succesfully. Thank you!!!');
    return res.redirect('/admintype/index');
  });


});






module.exports = router;
