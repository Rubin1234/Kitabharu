var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  publicationSchema = new Schema({
    publication_name: {
        type: String,
        required: true,
    },
    publication_image:{
        type: String,
    },
    publication_description:{
        type: String,
    },
    slug:{
        type: String,
    },
    status:{
        type: String,
    },
 
});


publicationSchema.plugin(timestamps);
var publicationModel = mongoose.model('publications', publicationSchema);

module.exports = publicationModel;