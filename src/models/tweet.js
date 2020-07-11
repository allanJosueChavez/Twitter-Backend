'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = Schema({
    //user: {type: String, require: true},
    content: {type: String, require: true},
    user_name: {type: String, require: true},
    /* TweetComments: [{
        comment: String,
        userComment: { type: Schema.ObjectId, ref: 'user' }
    }], */
    user: {type: Schema.ObjectId, ref: 'user'}
});
  
  


module.exports = mongoose.model('tweet', tweetSchema);