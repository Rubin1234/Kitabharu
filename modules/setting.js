var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});
var conn = mongoose.connection;
var Schema = mongoose.Schema; 

var  settingSchema = new Schema({
    location: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    contact:{
        type: String,
        default: null,
    },
    office_reg_no:{
        type: String,
        default: null,
    },
    google_map_link:{
        type: String,
        default: null,
    },
    facebook_link:{
        type: String,
        default: null,
    },
    twitter_link:{
        type: String,
        default: null,
    },
    youtube_link:{
        type: String,
        default: null,
    },
    instagram_link:{
        type: String,
        default: null,
    },
    linkedIn_link:{
        type: String,
        default: null,
    },

});


settingSchema.plugin(timestamps);
var settingModel = mongoose.model('setting', settingSchema);

module.exports = settingModel;