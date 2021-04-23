var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var bookAttributesSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    product_code:{
        type: String,
       required: true,
    },
    author_name:{
        type: String,
        default: null,
        required: false
    },
    publication:{
        type: String,
        default: null,
        required: false
    },

    total_pages:{
       type:String,
       required:false,
    },
    published_year:{
        type:String,
       default:null,
       required: false
     },
     language:{
        type:String,
       default:null,
       required: false
     },

    status: {
        type: String,
        default:'Active',
      },
});

bookAttributesSchema.plugin(timestamps);

var bookAttributesModel = mongoose.model('bookattributes', bookAttributesSchema);
module.exports = bookAttributesModel;