var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var ebookSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    
    ebook_file:{
        type: String,
       required: false,
    },

    ebook_price:{
        type: String,
       required: false,
    },


});

ebookSchema.plugin(timestamps);

var ebookModel = mongoose.model('ebook', ebookSchema);
module.exports = ebookModel;