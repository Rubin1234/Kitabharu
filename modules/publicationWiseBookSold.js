var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  publicationWiseBookSoldSchema = new Schema({
    publication_name: {
        type: String,
        required: true,
    },
    book_name : {
        type: String,
        required: true,
    },
    book_sold:{
        type: String,
        default: 0
    }, 
});


publicationWiseBookSoldSchema.plugin(timestamps);
var publicationWiseBookSoldModel = mongoose.model('publicationWiseBookSold', publicationWiseBookSoldSchema);

module.exports = publicationWiseBookSoldModel;