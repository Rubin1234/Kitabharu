var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://mongodb:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var specialOfferSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },
    specialoffer_percent:{
        type: String,
       required: true,
    },
    specialoffer_start_date:{
        type: String,
       required: true,
    },
    specialoffer_end_date:{
        type: String,
       required: true,
    }, 
    specialoffer_image:{
        type: String,
        default: null,
    }, 
    status: {
        type: String,
        default:'Active',
      },
});

specialOfferSchema.plugin(timestamps);

var specialOfferModel = mongoose.model('special_offer', specialOfferSchema);
module.exports = specialOfferModel;