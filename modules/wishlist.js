var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  wishlistSchema = new Schema({
    products: [],
    customer_id:{
        type: String,
        default: null,
    },
    status: {
        type: String,
        default:'Active',
      },
});
wishlistSchema.plugin(timestamps);

var wishlistModel = mongoose.model('wishlist', wishlistSchema);
module.exports = wishlistModel;