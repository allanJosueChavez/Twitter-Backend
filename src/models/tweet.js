'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = Schema({
    content: {type: String, require: true},
    user_name: {type: String, require: true},
    user: {type: Schema.ObjectId, ref: 'user'},
    like:[{
        user: {type: Schema.ObjectId, ref:'user', require:true},
        username: {type:String}
    }], 
    responses:[{
        user: {type: Schema.ObjectId, ref:'user', require:true},
        username: {type:String},
        response: {type:String}
    }], 
    numLikes: {type:Object, require:true},
    numResponses: {type:Object, require:true},
    numRetweets: {type:Object, require:true}
});


module.exports = mongoose.model('tweet', tweetSchema);