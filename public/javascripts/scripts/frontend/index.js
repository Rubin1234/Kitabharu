

$(document).ready(function(){
  axios
  .get('/viewcart',
  {
 
   }).then(function(response){
        var productLength = response.data.productitem;
        $('#cartproductnumber').append(productLength);
      });
});





function addtocart(){

  var productId = $(event.currentTarget).attr('productId');


    axios
       .get('/checklogincookies',
       {
        params:{
          productId: productId
       }
          
        }).then(function(response){
        
        
          if(response.data == 'nocookies'){
            window.location.href = "customer/login?n=0";
          }else{
      

            var productLength = response.data.productitem;
            console.log(productLength);

            $('#cartproductnumber').empty().append(productLength);
              bootoast.toast({
                message: 'Product Added To Cart',
                type: 'success'
              });
        
          }


           });
}