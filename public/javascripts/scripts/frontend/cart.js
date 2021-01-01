
$(document).ready(function(){
    var productQuantity = $('.qty1').attr('qty');
    $(".amountPerProduct" ).each(function() {
        var amountPerProduct =  $(this).attr('amountPerProduct');
        var productQuantity =  $(this).parent().siblings('.cart-product-quantity').children().children('.qty').val();
        var totalPrice = amountPerProduct * productQuantity;
        $(this).parent().siblings().last().children('.amountTotal').html('Rs '+ totalPrice);
        $(this).parent().siblings().last().children('.amountTotal').attr('totalPrice',totalPrice);
        
        if(productQuantity == 1){
            $(this).parent().siblings().siblings('.cart-product-quantity').children().children('.minus').prop("disabled", true);
        }

        
    });
});


function removeItem(){
    var productId =  $(event.currentTarget).attr('productId');
    var bookType =  $(event.currentTarget).attr('bookType');
    var cartProduct = $(event.currentTarget).attr('cartProduct');
    var removeItem = $(event.currentTarget).parent().parent().remove();

    axios
    .get('/cart/removeitem',
        {   
            params:{
                productId : productId,
                bookType : bookType,
                cartProduct : cartProduct,
            }
        }).then(function(response){
            bootoast.toast({
                message: 'Cart Item Deleted',
                type: 'success'
            })
        
        });
    console.log(bookType);
}

function productNumberAdd(){
   var quantity =  $(event.currentTarget).siblings('.qty').val();
   var max =  $(event.currentTarget).siblings('.qty').attr('max');
   var totalQuantity = parseInt(quantity) + parseInt(1);

    if(parseInt(totalQuantity) > 1){
        $(event.currentTarget).siblings('.minus').prop("disabled", false);
    }
    
    if(parseInt(totalQuantity) == parseInt(max)){
    $(event.currentTarget).attr("disabled","disabled");
    }else{
        $(event.currentTarget).removeAttr("disabled","");
    }


   var perPrice = $(event.currentTarget).parent().parent().siblings('.cart-product-price').children().attr('amountperproduct');
   var totalPricePerProduct = totalQuantity * parseInt(perPrice);
   $(event.currentTarget).parent().parent().siblings('.cart-product-subtotal').children().html('Rs '+ totalPricePerProduct);
   $(event.currentTarget).parent().parent().siblings('.cart-product-subtotal').children().attr('totalPrice',totalPricePerProduct);

   var totalAmount = 0;
   $('.amountTotal').each(function(){
    var totalPricePerProduct = $(this).attr('totalPrice');
    totalAmount += parseInt(totalPricePerProduct); 
 });

 $('.amount').empty().html('Rs '+ totalAmount);

//Using Axios to change into database of quantity and totalprice
var productId =  $(event.currentTarget).attr('productId');
var bookType =  $(event.currentTarget).attr('bookType');

axios
.get('/cart/updated/add',
    {   
        params:{
            totalQuantity : totalQuantity,
            productId : productId,
            bookType : bookType,
        }
    }).then(function(response){
        bootoast.toast({
            message: 'Cart Updated',
            type: 'success'
          })
       
    });

}



function productNumberSub(){

    var quantity =  $(event.currentTarget).siblings('.qty').val();
    var max =  $(event.currentTarget).siblings('.qty').attr('max');
    var totalQuantity = parseInt(quantity) - parseInt(1);
   
    if(totalQuantity < max){
        $(event.currentTarget).siblings('.plus').prop("disabled", false);
    }
   
    if(totalQuantity == 1){
        $(event.currentTarget).attr("disabled","disabled");
    }
   
    var perPrice = $(event.currentTarget).parent().parent().siblings('.cart-product-price').children().attr('amountperproduct');
    var totalPricePerProduct = totalQuantity * parseInt(perPrice);
    $(event.currentTarget).parent().parent().siblings('.cart-product-subtotal').children().html('Rs '+ totalPricePerProduct);
    $(event.currentTarget).parent().parent().siblings('.cart-product-subtotal').children().attr('totalPrice',totalPricePerProduct);
    
    var totalAmount = 0;
    $('.amountTotal').each(function(){
     var totalPricePerProduct = $(this).attr('totalPrice');
     totalAmount += parseInt(totalPricePerProduct); 
  });
  $('.amount').empty().html('Rs '+ totalAmount);


  //Using Axios to change into database of quantity and totalprice

    var productId =  $(event.currentTarget).attr('productId');
    var bookType =  $(event.currentTarget).attr('bookType');


    axios
    .get('/cart/updated/sub',
        {   
            params:{
                totalQuantity : totalQuantity,
                productId : productId,
                bookType : bookType,
            }
        }).then(function(response){
            bootoast.toast({
                message: 'Cart Updated',
                type: 'success'
            })
        
        });

}