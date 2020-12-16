

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

function mycart(){
  console.log('my cart');

  axios
  .get('/mycart',
  {
  
   }).then(function(response){
    var myCart = response.data.products;
    
    var cart = '';
    var total_price = 0;
    myCart.forEach(function(data){
             
    cart += '<div class="top-cart-item clearfix"><div class="top-cart-item-image"><a href="#"><img src="/images/backend/products/'+data.product_image+'" alt="'+data.product_name+'" /></a></div><div class="top-cart-item-desc"><a href="#">'+data.product_name+'</a><span class="top-cart-item-price">'+data.product_price*data.qty+'</span><span class="top-cart-item-quantity">x '+data.qty+'</span></div></div>';
    
    total_price += data.product_price*data.qty;
  });

  console.log(total_price);
    $('#cartitemtotal').empty().append('$'+total_price);

    $('.top-cart-items').empty().append(cart);
 
    });
}