

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
            window.location.href = "customer/login";
          }else{
         
              bootoast.toast({
                message: 'Product Added To Cart',
                type: 'success'
              });
        
          }


           });
}