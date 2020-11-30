
function sortBy(){
    var categories = $(event.currentTarget).val();

    axios
    .get('/subcategories/sortby',
    {
        params:{
            Id: categories
         }
     })
     .then(function(response){
         console.log(response);
         
        var array = response.data;
        
        console.log(array);
    
           var data = '';
          
           if(array.length > 0){ 
            var i = 1; 
           array.forEach(function(record){
                data += '<tr>';
                data += '<td>'+i+'</td>';
                data += '<td>'+ record.subcategory_name+'</td>';

                data += '<td>';
                if(record.subcategory_image != null){ 
                 data += '<img src="../../../images/backend/subcategories/' + record.subcategory_image+'" style="width: 75%;">';
                 }else{
                    data += '<img src="" style="width: 75%;">';
                }
                data += '</td>';
                

                data += '<td>';
                if(record.subcategory_icon != null){
                    data += '<img src="../../../images/backend/subcategories/icons/'+record.subcategory_icon+'" style="width: 70%;">';
                 }else{
                    data +=  '<img src="" style="width: 50%;">';
                }
                data += '</td>';

                data += '<td>';
                 if(record.category_type_id.category_name == 'Book'){
                    data += '<span style="padding: 5px 11px;background-color: #37a1cf;color: white;border-radius: 6px;font-size: 12px;">'+ record.category_type_id.category_name + '</span>';
                 }else if(record.category_type_id.category_name == 'Stationary'){
                    data += '<span style="padding: 5px 11px;background-color: #16b01b;color: white;border-radius: 6px;font-size: 12px;">' + record.category_type_id.category_name + '</span>';
                  }
                  data += '</td>';


                  data += '<td>';
                    if(record.status == 'Active'){
                        data += '<span style="padding: 5px 11px;background-color: #07ddb2;color: white;border-radius: 6px;font-size: 14px;">' + record.status + '</span>';
                  }
                  if(record.status == 'Inactive'){
                    data += '<span style="padding: 5px 11px;background-color: #f1556c;color: white;border-radius: 6px;font-size: 14px;">'+record.status+'</span>';
                       }
                    data += '</td>';


                    data +=  '<td>'
                    data +=  '<a href="/subcategories/edit/'+ record._id +'"><button type="button" class="btn btn-info waves-effect waves-light" style="padding:0px;"> <i class="fe-edit" style="color: white;padding: 7px 10px;font-size: 17px;"></i></button></a>';
                    data += '&nbsp;'
                    data += '<a href="/subcategories/delete/' + record._id + '" ><button type="button" class="btn btn-danger waves-effect waves-light" style="padding:0px;" onclick="return confirm("Are you sure you want to delete?")"> <i class="fe-trash-2" style="color: white;padding: 7px 10px;font-size: 17px;"></i></button</a></td>';
                
                data += '</tr>';                                            
                                            
            i++;
           });
        }else{
            data += '<tr>'
            data += '<td>No records found.</td>';
            data += '</tr>';
        }

        console.log(data);
          $('#sortby').empty().html(data);
    
      
         
       })
 
}

