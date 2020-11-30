     
      $('#addAdminBtn').on('click',function(){
        if($('#newpassword').val().trim() != ''){
             
             $('#conpassword').prop('required',true);
          
        }else{
             $('#conpassword').prop('required',false);;
        }
   });
