var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var productAttributeImagesSchema = new Schema({

    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    productAttribute_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    productAttributeImage:{
        type: String,
       required: true,
    },   
    status: {
        type: String,
        default:'Active',
      },
});
productAttributeImagesSchema.plugin(timestamps);

var productAttributeImagesModel = mongoose.model('product_attribute_images', productAttributeImagesSchema);
module.exports = productAttributeImagesModel;