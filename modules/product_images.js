var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://mongodb:mongodb@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var productImagesSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    productImage:{
        type: String,
       required: true,
    },   
    status: {
        type: String,
        default:'Active',
      },
});
productImagesSchema.plugin(timestamps);

var productImagesModel = mongoose.model('product_images', productImagesSchema);
module.exports = productImagesModel;