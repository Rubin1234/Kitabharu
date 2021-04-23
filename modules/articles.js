var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});

var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  articlesSchema = new Schema({
    article_title: {
        type: String,
        required: true,
    },
    article_date: {
        type: String,
        required: true,
    },
    article_image:{
        type: String,
    },
    article_description:{
        type: String,
    },
    slug:{
        type: String,
    },
    status:{
        type: String,
    },
 
});


articlesSchema.plugin(timestamps);
var articleModel = mongoose.model('articles', articlesSchema);

module.exports = articleModel;