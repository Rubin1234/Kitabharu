var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  orderSchema = new Schema({
        orderId : {
            type: String,
            required: true
        },
        customerId : {
            type :Schema.Types.ObjectId,
            ref:'customers'
        },
        fullName : {
            type: String,
            required: true
        },
        phoneNumber : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true,
        },
        streetAddress : {
            type : String,
            require : true
        },
        products : [],
        paymentType : {type: String, default: 'COD'},
        totalAmount : {type: String, required:true},
        status : {type:String, default:'order_placed'}
        

});
orderSchema.plugin(timestamps);

var orderModel = mongoose.model('orders', orderSchema);
module.exports = orderModel;