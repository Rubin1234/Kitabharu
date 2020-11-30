var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb://localhost:27017/kitabharu', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  subCategorySchema = new Schema({

    subcategory_name: {
        type: String,
        required: true,
    },
    subcategory_image:{
        type: String,
        default: null,
    },
    subcategory_icon:{
        type: String,
        default: null,
    },

    products:[{type:Schema.Types.ObjectId, ref:'product'}],

    
    slug:{
        type: String,
        default: null,
    },
    status: {
        type: String,
        default:'Active',
      },

    category_type_id:{
        type: Schema.Types.ObjectId,
         ref: 'categories',
        },
});
subCategorySchema.plugin(timestamps);

var subCategoryModel = mongoose.model('subcategories', subCategorySchema);
module.exports = subCategoryModel;