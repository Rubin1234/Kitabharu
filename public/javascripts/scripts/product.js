$(function () {
    CKEDITOR.replace('producteditor');
});



  $(document).ready(function(){
   
    //Chekcing the product category
    var product_category = $('#product_category').find('option:selected').attr('category');
    var book_type = $('#book_type').attr('book_type');
    console.log(book_type);

    if(product_category == 'Book'){
      let bookType = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Book Type<span class="text-danger">*</span></label><div class="col-7"><div class="checkbox checkbox-success form-check-inline" style="margin-right: 2rem;padding-top: 5.5px;">';
      
      bookType += '<input type="checkbox" id="booktypeCheckbox1" value="paperbook" name="paperbook" onchange="changePaperbook()"';
      if(book_type == "paperbook" || book_type == "both"){
          bookType += 'checked';  
        }
        bookType += '>';
      
      bookType += '<label for="inlineCheckbox1"> Paper Book</label></div><div class="checkbox checkbox-success form-check-inline" style="padding-top: 5.5px;">';
      
      bookType += '<input type="checkbox" id="booktypeCheckbox2" value="ebook" name="ebook" onchange="editchangeEbook()"';

      if(book_type == "ebook" || book_type == "both" ){
        bookType += 'checked';  
      }
      bookType += '>';
      
      bookType += '<label for="inlineCheckbox2"> E-Book </label></div><br><span id="booktype-error" class="help-block" style="font-weight: normal;color: #f1556c;font-size: 14px;margin-bottom: 0;top: 6px;left: -5px; position: relative;"></span></div></div>';
   
      $('#book_type').empty().append(bookType);
   }else if(product_category == 'Stationary'){
      $('#book_type').empty();
      $('#e-book').empty();
   }

      //Checking which book type is checked
      if($('#booktypeCheckbox2').is(":checked") && $('#booktypeCheckbox1').is(":checked")){
        
        $('#e-book').css('display','block');
      
      }
      else if($('#booktypeCheckbox1').is(":checked")){
        console.log('sasd');
        $('#e-book').css('display','none');
        $('#edit_ebook_price').removeAttr('required'); 
      }
  });



function changeCategory(){
   var ID = $(event.currentTarget).val();
   var category = $(event.currentTarget).find('option:selected').attr('category');


   var bookType = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Book Type<span class="text-danger">*</span></label><div class="col-7"><div class="checkbox checkbox-success form-check-inline" style="margin-right: 2rem;padding-top: 5.5px;"><input type="checkbox" id="booktypeCheckbox1" value="paperbook" name="paperbook" onchange="changePaperbook()"><label for="inlineCheckbox1"> Paper Book</label></div><div class="checkbox checkbox-success form-check-inline" style="padding-top: 5.5px;"><input type="checkbox" id="booktypeCheckbox2" value="ebook" name="ebook" onchange="changeEbook()"><label for="inlineCheckbox2"> E-Book </label><div style="padding-left:15px;" id="booktypeErr"></div></div><br><span id="booktype-error" class="help-block" style="font-weight: normal;color: #f1556c;font-size: 14px;margin-bottom: 0;top: 6px;left: -5px; position: relative;"></span></div></div>';
   
   if(category == 'Book'){
      $('#book_type').empty().append(bookType);
   }else if(category == 'Stationary'){
      $('#book_type').empty();
      $('#e-book').empty();
   }


   "#category option:first-child" 
   
   $('#parsley-id-5 .parsley-required').css('display','none');
   
   axios
   .get('/product/changecategory',
   {
       params:{
           Id: ID
        }
    })
   .then(function(response){
    var array = response.data;

       var data = '';
      
       data += '  <option value="">Please select subcategory </option>';
       array.forEach(function(record){
       
        data += '<option value="'+record._id+'">'+record.subcategory_name+'</option>';
       });
    
      $('#subCategoryType').empty().html(data);

      $('#subCategoryType').selectpicker('refresh');
      $('#subCategoryType').selectpicker('render');
   
   })
   .catch(function (error) {
    console.log(error);
  });
}


function editchangeCategory(){
  var ID = $(event.currentTarget).val();
  var category = $(event.currentTarget).find('option:selected').attr('category');


  var bookType = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Book Type<span class="text-danger">*</span></label><div class="col-7"><div class="checkbox checkbox-success form-check-inline" style="margin-right: 2rem;padding-top: 5.5px;"><input type="checkbox" id="booktypeCheckbox1" value="paperbook" name="paperbook" onchange="changePaperbook()"><label for="inlineCheckbox1"> Paper Book</label></div><div class="checkbox checkbox-success form-check-inline" style="padding-top: 5.5px;"><input type="checkbox" id="booktypeCheckbox2" value="ebook" name="ebook" onchange="changeEbook()"><label for="inlineCheckbox2"> E-Book </label></div><br><span id="booktype-error" class="help-block" style="font-weight: normal;color: #f1556c;font-size: 14px;margin-bottom: 0;top: 6px;left: -5px; position: relative;"></span></div></div>';
  
  if(category == 'Book'){
     $('#book_type').css('display','block');
     $('#e-book').css('display','block');
  }else if(category == 'Stationary'){
     $('#book_type').css('display','none');
     $('#e-book').css('display','none');
  }


  "#category option:first-child" 
  
  $('#parsley-id-5 .parsley-required').css('display','none');
  
  axios
  .get('/product/changecategory',
  {
      params:{
          Id: ID
       }
   })
  .then(function(response){
   var array = response.data;

      var data = '';
     
      data += '  <option value="">Please select subcategory </option>';
      array.forEach(function(record){
      
       data += '<option value="'+record._id+'">'+record.subcategory_name+'</option>';
      });
   
     $('#subCategoryType').empty().html(data);

     $('#subCategoryType').selectpicker('refresh');
     $('#subCategoryType').selectpicker('render');
  
  })
  .catch(function (error) {
   console.log(error);
 });
}


function changeSubCategory(){
  $('#parsley-id-7 .parsley-required').css('display','none');
}


//Flash Sale
function flashsale(){
  var value = $(event.currentTarget).val();

  // var minDate = new Date(value);
  // console.log(minDate);
 
  if(value == 'yes'){
        var flashsale = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Flash Sale Price</label><div class="col-7"><input type="text" class="form-control" name="flashsaleprice" placeholder="Please choose flash sale discount price." required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose flash sale discount price. </span></div></div><div class="form-group row"><label for="inputEmail56" class="col-3 col-form-label">Flash Sale Start Date<span class="text-danger">*</span></label><div class="col-4"><input type="text" name="flash_startdate" id="flashsale-startdate" class="form-control" placeholder="Choose a start date" onchange="changeflashstartdate()" required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose start date of Flash Sale. </span></div><div class="col-3"><input type="text" name="flash_starttime" required parsley-type="text" class="form-control" id="flashsale-starttime"  placeholder="Choose a start date" value=""><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose end date of Flash Sale. </span></div></div><div class="form-group row"><label for="inputEmail56" class="col-3 col-form-label">Flash Sale End Date<span class="text-danger">*</span></label><div class="col-4"><input type="text" required parsley-type="text" class="form-control"id="flashsale-enddate" placeholder="Choose a start date" value="" name="flash_enddate"><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose end date of Flash Sale. </span></div><div class="col-3"><input type="text" required parsley-type="text" class="form-control" id="flashsale-endtime" placeholder="Choose a start date" value="" name="flash_endtime" ><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose end date of Flash Sale. </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Flash Sale Status</label><div class="col-7"><select id="flashsalePicker" name="flashsale_status" class="selectpicker show-tick" data-style="btn-light" style="border: 1px solid lightgrey;"><option value="Active">Active</option><option value="Inactive">Inactive</option></select><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose Active to show this product in flash sales. </span></div></div>';
        
        $('#appendFlashsale').empty().append(flashsale);
        
        $('#flashsale-startdate').flatpickr({
          enableTime: false,
          dateFormat: "Y/m/d",
          
       });
    
       $('#flashsale-starttime').flatpickr({
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          defaultDate: "12:00"
       });
    
       $('#flashsale-enddate').flatpickr({
          enableTime: false,
          dateFormat: "Y/m/d",
          minDate: "today",
       });
    
       $('#flashsale-endtime').flatpickr({
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          defaultDate: "12:00",
       });
        $('#flashsalePicker').selectpicker('refresh');
        $('#flashsalePicker').selectpicker('render');
  }
  else if(value == ''){
    $('#appendFlashsale').empty();
  }

}

function editflashsale(){
  var value = $(event.currentTarget).val();

  var flashSaleStartDate =  $('#flashsale-startdate').val();
  var flashSaleStartTime =  $('#editflashsale-starttime').val();
  var flashSaleEndDate =  $('#flashsale-enddate').val();
  var flashSaleEndTime = $('#editflashsale-endtime').val();
  

  if(value == 'yes'){
    

    $('#flashsale-startdate').val(flashSaleStartDate);
  
    $('#appendeditFlashsale').css('display','block');


        
    $('#flashsale-startdate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
      defaultDate: flashSaleStartDate
   });

   $('#editflashsale-starttime').flatpickr({
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultDate: flashSaleStartTime
   });

   

   $('#flashsale-enddate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
      minDate: "today",
      defaultDate: flashSaleEndDate
   });

   $('#editflashsale-endtime').flatpickr({
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultDate: flashSaleEndTime,
   });
  }else if(value == ''){
 
    $('#appendeditFlashsale').css('display','none');
  }
  
}

//For Special Offer
// $('#flashsale-startdate').on('change',function(e){
//     console.log(123);

// });

function changeflashstartdate(){
  var value = $(event.currentTarget).val();

  var minDate = new Date(value);
  
  $('#flashsale-enddate').flatpickr({
    enableTime: false,
    dateFormat: "Y/m/d",
    minDate: minDate,
 });
}


function specialoffer(){
  
  var value = $(event.currentTarget).val();

 
  if(value == 'yes'){
    var specialOffer = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Special Discount (%)</label><div class="col-7"><input type="text"  id="specialDiscountPercent" name="specialDiscountPercent" placeholder="Please enter discount in %" data-a-sign="%" data-p-sign="s" class="form-control autonumber"><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount . </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Start Date</label><div class="col-7"><input type="text" name="specialoffer_startdate" id="specialoffer_startdate" class="form-control" placeholder="Choose a start date" required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount . </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Expire Date</label><div class="col-7"><input type="text" name="specialoffer_enddate" id="specialoffer_enddate" class="form-control" placeholder="Choose a end date" required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount . </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Thumbnail Image</label><div class="col-7"><input type="file" id="example-fileinput1" class="form-control-file" name="specialoffer_image" ><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount . </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Special Offer Status</label><div class="col-7"><select id="flashsalePicker1" name="specialoffer_status" class="selectpicker show-tick" data-style="btn-light" style="border: 1px solid lightgrey;"><option value="Active">Active</option><option value="Inactive">Inactive</option></select><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose Active to show this product in special offer. </span></div></div>';
    
    //For % in input (Special Discount)

    $(document).ready(function(){$('[data-toggle="input-mask"]').each(function(a,e){var t=$(e).data("maskFormat"),n=$(e).data("reverse");null!=n?$(e).mask(t,{reverse:n}):$(e).mask(t)})}),jQuery(function(a){a(".autonumber").autoNumeric("init")});
    
    $('#appendSpecialOffer').empty().append(specialOffer);
        
    $('#specialoffer_startdate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
   });
    
    $('#specialoffer_enddate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
   });

   $('#flashsalePicker1').selectpicker('refresh');
   $('#flashsalePicker1').selectpicker('render');
  }else if(value == ''){
    $('#appendSpecialOffer').empty();
  }
}




function editspecialoffer(){

  var value = $(event.currentTarget).val();

  var specialOfferDiscountPercent =  $('#specialDiscountPercent').val();
  var specialOfferStartDate =  $('#specialoffer_startdate').val();
  var specialOfferEndDate =  $('#specialoffer_enddate').val();
 
  
  if(value == 'yes'){
    

    $('#specialDiscountPercent').val(specialOfferDiscountPercent);
  
    $('#appendeditSpecialOffer').css('display','block');


    $('#specialoffer_startdate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
      defaultDate: specialOfferStartDate
   });

   $('#specialoffer_enddate').flatpickr({
      enableTime: false,
      dateFormat: "Y/m/d",
      defaultDate: specialOfferEndDate
   });

   

  }else if(value == ''){
 
    $('#appendeditSpecialOffer').css('display','none');
  }

}



function editbulkdiscount(){

  var value = $(event.currentTarget).val();

  var specialOfferDiscountPercent =  $('#specialDiscountPercent').val();
  var minimum_product =  $('#minimum_product').val();
  var bulkDiscountPercent =  $('#bulkDiscountPercent').val();
   
  if(value == 'yes'){
    
    $('#appendeditBulkDiscount').css('display','block');

  }else if(value == ''){
 
    $('#appendeditBulkDiscount').css('display','none');
    
  }

}







function bulkdiscount(){
  
  var value = $(event.currentTarget).val();

 
  if(value == 'yes'){
    var bulkDiscount = '<div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Minimum No. of Product</label><div class="col-7"><input type="text" name="bulk_minimum_product" id="minimum_product" class="form-control" placeholder="Enter minimum number of product" required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount . </span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Special Discount (%)</label><div class="col-7"><input type="text"  id="bulkDiscountPercent" name="bulkDiscountPercent" placeholder="Please enter discount in %" data-a-sign="%" data-p-sign="s" class="form-control autonumber"><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose offer price discount .</span></div></div><div class="form-group row"><label for="inputEmail3" class="col-3 col-form-label">Bulk Offer Status</label><div class="col-7"><select id="flashsalePicker2" name="bulkoffer_status" class="selectpicker show-tick" data-style="btn-light" style="border: 1px solid lightgrey;"><option value="Active">Active</option><option value="Inactive">Inactive</option></select><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please choose Active to show this product in bulk offer. </span></div></div>';
    
      //For % in input (Bulk Discount)

      $(document).ready(function(){$('[data-toggle="input-mask"]').each(function(a,e){var t=$(e).data("maskFormat"),n=$(e).data("reverse");null!=n?$(e).mask(t,{reverse:n}):$(e).mask(t)})}),jQuery(function(a){a(".autonumber").autoNumeric("init")});
    
   
    $('#appendBulkDiscount').empty().append(bulkDiscount);
    $('#flashsalePicker2').selectpicker('refresh');
    $('#flashsalePicker2').selectpicker('render');

  }else if(value == ''){
    $('#appendBulkDiscount').empty();
  }
  

}


function changePaperbook(){
  if($(event.currentTarget).is(":checked")){
    $('#booktype-error').empty();
    $('#booktypeErr').empty();
  }
}

function changeEbook(){

  var data = '<div style="padding: 25px 0; border: 2px solid lightgrey;margin-bottom: 2.5rem;border-radius: 5px;" ><div class="form-group row"><label for="hori-pass3" class="col-3 col-form-label">E-Book PDF</label><div class="col-7"><span id="pdfError"></span>   <input type="hidden" name="previousPdfFile" value="" > <input type="file" id="pdfFile" class="form-control-file" name="ebook_file" onchange="pdfValidation()" ><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Upload PDF File</span></div></div> <div class="form-group row" style="margin-bottom: 0px;"><label for="inputEmail3" class="col-3 col-form-label">E-Book Price<span class="text-danger">*</span></label><div class="col-7"><input type="text" required parsley-type="text" class="form-control"id="inputEmail4" placeholder="Enter a E-book price" value="" name="ebook_price" required><span class="help-block" style="font-weight: normal;font-size: 11px;margin-bottom: 0;">Please enter a e-book price. </span></div></div></div>';

 if($(event.currentTarget).is(":checked")){
    $('#booktype-error').empty();
    $('#e-book').append(data);
    $('#e-book').css('display','block');
    $('#booktypeErr').empty();
  }else{
    $('#e-book').empty();
  }
 
}

function editchangeEbook(){
  if($(event.currentTarget).is(":checked")){


    $('#booktype-error').empty();
    $('#e-book').css('display','block');
  }else{
    $('#e-book').css('display','none');
  }
 
}




// $("#parsley-examples").submit(function(){
//     if($('#booktypeCheckbox1').is(':checked') || $('#booktypeCheckbox2').is(':checked')){
//       return true;
//   }else{
//     $('#booktype-error').empty().append('<i class="mdi mdi-close-circle"></i>&nbsp;&nbsp;Please select atleast one book type.');
//     return false;
//   }
// });


// $('#submit').on('click',function(){
//   if($('#booktypeCheckbox1').is(':checked') || $('#booktypeCheckbox2').is(':checked')){
//       return true;
//   }else{
//     alert('Please choose atleast one book type');
//     return false;
//   }

// });

// $(document).ready(function(){
//   if($('#booktypeCheckbox1').is(":checked"))
// });





