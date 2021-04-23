var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var videosSchema = new Schema({
    video_title: {
        type: String,
        default: null,
    },
    youtube_link:{
        type: String,
    },
    slug:{
        type: String,
    },
    status:{
        type: String,
    },
 
});


videosSchema.plugin(timestamps);
var videosModel = mongoose.model('videos', videosSchema);

module.exports = videosModel;