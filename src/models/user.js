'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = Schema({ 
    user_name: {type: String, require: true},
    password: {type: String, require: true},     
    followers:[{
      follower: {type: Schema.ObjectId, ref:'user', require:true},
      username: {type:String}
    }], 
    followed:[{
      followed: {type: Schema.ObjectId, ref:'user', require:true},
      username: {type: String}
    
    }],
    phone: {type:Number},
    email: {type:String}
  /*  tweets: [
        {
            idTweet: {type: Schema.ObjectId, ref: 'user'},
            contentTweet: String,
            //privacy:String
        }
    ]*/
});


module.exports = mongoose.model("user", schema);