var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const { NotImplemented } = require('http-errors');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var magazineVolumeSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
    },

    volume_part: {
        type: String,
        required:false
    },
    
    magazine_ebook_file:{
        type: String,
       required: false,
    },

});

magazineVolumeSchema.plugin(timestamps);

var magazineVolumeModel = mongoose.model('magazine_volume', magazineVolumeSchema);
module.exports = magazineVolumeModel;