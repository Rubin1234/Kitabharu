var loader  = $('.load');
var array = [];
  function bookSubcategoryCheckbox(){

    if($(event.currentTarget).is(":checked")){

        $('.book-listing-page').empty();
       
        loader.show();
       var subcategory_id =  $(event.currentTarget).attr('subcategory_id');
        array.push(subcategory_id);

        console.log(array);

       axios
       .get('/books/subcategory/changecheckbox',
       {
           params:{
               subcategoryId: array
            }
        })  .then(function(response){
            loader.hide();
            var data = response.data;

            var doc = '';

            if(data.length > 0){
                data.forEach(function(data1){
                    doc += '<div class="col-md-3"><div class="new-arrival-books"> <img src="../images/backend/products/'+data1.product_image+'"  style="width: 100%;height: 235px;"><div class="new-arrival-books-desc"><h4>'+data1.product_name+'</h4><span style="font-size: 14px;color: #8b8b8b">';

                    if(data1.book_attribute.length > 0){
                        doc +=  data1.book_attribute[0].author_name;
                    }

                    doc += '</span>';

                    doc += ' <div class="price-box"><h4>'+data1.product_price+'</h4></div></div> <div class="view-book"><a href="../bookdetails/'+data1.slug+'" ><button type="" class="form-control"><i class="icon-line-eye"></i>&nbsp;&nbsp;View Details</button></a> <button type="" class="form-control"><i class="icon-cart-plus"></i>&nbsp;&nbsp;Add to Cart</button> </div></div></div>';
                });
            
               
            }else{
                doc += ' <h4 style="margin: auto;">Sorry, No Books Available</h4>';
                $('.pagination').remove();
            }
                $('.book-listing-page').empty().append(doc);
              
           });
        }else{
            
            
        $('.book-listing-page').empty();
      
        loader.show();
            var subcategory_id =  $(event.currentTarget).attr('subcategory_id');
            const index = array.indexOf(subcategory_id);

            if(index > -1){
                array.splice(index,1);
            }
       
       axios
       .get('/books/subcategory/changecheckbox',
       {
           params:{
               subcategoryId: array
            }
        })  .then(function(response){
            
            
        loader.hide();
            var data = response.data;

            var doc = '';

            if(data.length > 0){
                data.forEach(function(data1){
                    doc += '<div class="col-md-3"><div class="new-arrival-books"> <img src="../images/backend/products/'+data1.product_image+'"  style="width: 100%;height: 235px;"><div class="new-arrival-books-desc"><h4>'+data1.product_name+'</h4><span style="font-size: 14px;color: #8b8b8b">';

                    if(data1.book_attribute.length > 0){
                        doc +=  data1.book_attribute[0].author_name;
                    }

                    doc += '</span>';

                    doc += ' <div class="price-box"><h4>'+data1.product_price+'</h4></div></div> <div class="view-book"><a href="../bookdetails/'+data1.slug+'" ><button type="" class="form-control"><i class="icon-line-eye"></i>&nbsp;&nbsp;View Details</button></a> <button type="" class="form-control"><i class="icon-cart-plus"></i>&nbsp;&nbsp;Add to Cart</button> </div></div></div>';
                });
            
               
            }else{
                doc += ' <h4 style="margin: auto;">Sorry, No Books Available</h4>';
                $('.pagination').remove();
            }
                $('.book-listing-page').empty().append(doc);
              
           });
            
        }
    }
