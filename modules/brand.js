var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  brandSchema = new Schema({
    brand_name: {
        type: String,
        required: true,
    },

    brand_image:{
        type: String,
    },
    status:{
        type: String,
    },
 
});


brandSchema.plugin(timestamps);
var brandModel = mongoose.model('brands', brandSchema);

module.exports = brandModel;