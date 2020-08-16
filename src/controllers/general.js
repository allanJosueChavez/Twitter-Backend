'use strict'
const md_auth = require('../middlewares/authenticated');
var bcrypt = require("bcrypt-nodejs");
const User = require('../models/user');
const Tweet = require('../models/tweet')
const jwt = require("../services/jwt");

async function commands(req, res) {
    var user = new User();
    var tweet = new Tweet();

    let cmd = req.body.commands;
    var data = cmd.split(' ');
    var command = (data[0] != null && data.length > 0 ? data[0] : "");


    //let command = req.params.action;
    //const {user_name,password} = req.body;

    switch (command) {

        case "LOGIN":
            var user_name = data[1];
            var password = data[2];
            var sessionData = { user_name, password };
            console.log(user_name, password);
            // const sessionData = req.body;
            User.findOne({ user_name: sessionData.user_name }, (error, userLogged) => {
                if (error) return res.status(500).send({ message: 'Error to try login.' })
                if (userLogged) {
                    if (sessionData.password === userLogged.password) {
                        userLogged.password = undefined;

                        return res.status(200).send({ token: jwt.createToken(userLogged) });
                    } else {
                        return res.status(200).send({ message: "The user or password are wrong." })
                    }
                } else {
                    return res.status(404).send({ message: "The user hasn't been can login." })
                }
            })
            break;
            

        case "REGISTER":
            if (data[1] && data[2]) {
                user.user_name = data[1];
                user.password = data[2];
                user.email = data[3];
                user.phone = data[4];

                console.log("An user is trying register. Username: ", data[1], " Password:", data[2]);
                await User.find({ $or: [{ user_name: user.user_name }] }, (error, username) => {
                    if (error) return res.status(400).send({ message: 'The request has failed.' })
                    if (username.length >= 1) {
                        console.log('The user already exists.');
                        return res.status(500).send({ message: 'The user already exists.' })
                    } else {
                        user.save((error, userSave) => {
                            if (error) res.status(400).send({ message: 'The request has failed.' });
                            if (userSave) {
                                res.status(201).send({ message: 'User registered successfully.', usuario: userSave })
                            } else {
                                res.status(400).send({ message: 'Ups! An error has occurred.' })
                            }
                        })
                        { }
                    }
                })
            } else {
                res.status(400).send({ message: 'The registry has not complete, missing data.' });
            }
            break;


        case "EDIT":
            var userId = data[1];
            if (data[2] && data[3]) {
                var user_name = (data[2] != null);
                var password = (data[3] != null);
                var newData = { user_name, password };
                if (userId != req.user.sub) {
                    res.status(500).send({ message: "You don't have permissions for do this action." })
                    console.log("You don't have permissions for do this action.");
                } else {
                    User.findByIdAndUpdate(userId, newData, { new: true }, (err, userUpdated) => {
                        if (err) return res.status(500).send({ message: "The user wasn't found." })
                        if (!user) return res.status(404).send({ message: "An error has ocurred." })
                        return res.status(200).send({ userUpdated })
                    })
                }
            } else {
                return res.status(200).send({ message: "The data cannot be null, try again please." })
            }
            break;


        case "DELETE_USER":
            var username = data[1];
            if (username != req.user.user_name) {
                res.status(500).send({ message: "You don't have permissions for delete this user." })
                console.log("You don't have permissions for do this action.");
            } else {
                User.findOneAndDelete({ user_name: req.user.user_name }, (err, userDeleted) => {
                    if (err) return res.status(404).send({ message: "This user doesn't exist." });
                    if (!userDeleted) return res.status(404).send({ message: "User not found." });
                    return res.status(200).send({ userDeleted });
                });
            }
            break;


        case "PROFILE":
            var username = data[1];
            if (username != req.user.user_name) {
                res.status(500).send({ message: "You don't have permissions for do this action." })
                console.log("You don't have permissions for do this action.");
            } else {
                User.findOne({ user_name: req.user.user_name }, (err, user) => {
                    if (err) return res.status(404).send({ message: "An error has ocurred." })
                    if (!user) return res.status(500).send({ message: "The user wasn't found." })
                    return res.status(200).send({ user })
                })
            }
            break;


        case "ADD_TWEET":
            try {
                var tweet_content = cmd.split('"');
                if (tweet_content[1].trim().length != 0 && tweet_content[1].trim().length <= 140) {
                    if (tweet_content[1]) {
                        tweet.user_name = req.user.user_name;
                        tweet.content = tweet_content[1];
                        tweet.user = req.user.sub;
                        console.log("You are trying to add a new tweet.");
                        tweet.save((err, saveTweet) => {
                            if (err) return res.status(500).send({ message: 'An error to try save the tweet. Please try again.' })
                            if (!saveTweet) return res.status(404).send({ message: 'An error has occurred.' })
                            return res.status(200).send({ message: "Your tweet has been added satisfactorily.", Tweet: saveTweet })
                        })
                    }
                } else {
                    res.status(500).send({ message: 'The character limit has been exceeded.' })
                }
            } catch (error) {
                // console.error(error);
                res.status(500).send({ message: "You must enclose the text of your tweet in quotation marks" });
            }
            break;


        case "DELETE_TWEET":
            Tweet.find({ user: req.user.sub }, (err, permissions) => {
                if (!permissions) {
                    res.status(500).send({ message: "You don't have permissions for delete this tweet." })
                    console.log("You don't have permissions for do this action.");
                } else {
                    Tweet.findByIdAndDelete(data[1], (err, tweetDeleted) => {
                        if (err) return res.status(404).send({ message: "This tweet doesn't exist." });
                        if (!tweetDeleted) return res.status(404).send({ message: "Tweet not found." });
                        return res.status(200).send({ tweetDeleted });
                    });
                }
            })
            break;


        case "EDIT_TWEET":
            Tweet.find({ user: req.user.sub }, (err, permissions) => {
                if (!permissions) {
                    res.status(500).send({ message: "You don't have permissions for delete this tweet." })
                    console.log("You don't have permissions for do this action.");
                } else {
                    if (data[2] != null) {
                        var content = data[2];
                        var newData = { content };
                        // user.content = newContent;
                        Tweet.findByIdAndUpdate(data[1], newData, { new: true }, (err, tweetUpdated) => {
                            if (err) return res.status(500).send({ message: "The tweet wasn't found." })
                            if (!user) return res.status(404).send({ message: "An error has ocurred." })
                            return res.status(200).send({ tweetUpdated })
                        })
                    } else {
                        return res.status(500).send({ message: "The content of the tweet cannot be empty." })
                    }
                }
            })
            break;


        case "VIEW_TWEETS":
            var my_userId = req.user.sub;
            var username = data[1];
            User.findOne({ user_name: username }, (err, user_existing) => {
                if (!user_existing) {
                    return res.status(404).send({ message: "The user doesn't exist, please try again." })
                } else {
                    Tweet.find(({ user_name: username }), (err, tweets) => {
                        if (err) return res.status(500).send({ message: "The user wasn't found." })
                        if (!tweets) return res.status(404).send({ message: "An error has ocurred." })
                        return res.status(200).send({ Tweets: tweets })
                    })
                }
            })
            break;


        case "FOLLOW":
            var username = data[1];
            var my_userId = req.user.sub;

            try {
                User.findOne({ user_name: username }, (err, user) => {
                    if (err) return res.status(500).send({ message: "The user wasn't found. Try again with a user existing please." })
                    if (!user || username == req.user.user_name) {
                        return res.status(404).send({ message: "The user doesn't exist. Please Try again" })
                    } else {
                        User.findOneAndUpdate({ user_name: username }, { $addToSet: { followers: { follower: req.user.sub, username: req.user.user_name } } }, { new: true }, async (err, NewFollow) => {
                            console.log("Now you follow this user.");
                        })
                        User.findByIdAndUpdate(my_userId, { $addToSet: { followed: { followed: user._id, username: username } } }, { new: true }, (err, Followed) => {
                            return res.status(200).send({ message: "Now you follow this user.", Followed })
                        })
                    }
                })

            } catch (error) {
                // console.error(error);
                res.status(500).send({ message: error.message });
                console.error("An error has occurred. Try again please.");
            }
            break;


        case "UNFOLLOW":
            var username = data[1];
            var my_userId = req.user.sub;
            User.findOne({ user_name: username }, (err, user) => {
                if (err) return res.status(500).send({ message: "The user wasn't found. Try again with a user existing please." })
                if (!user || username == req.user.user_name) {
                    return res.status(404).send({ message: "The user doesn't exist. Please Try again" })
                } else {
                    User.findByIdAndUpdate(my_userId, { $pull: { followed: { username: username } } }, { new: true }, (err, userUnfollowed) => {
                        //  if (!followerAdded) return res.status(404).send({ message: "You don't follow this user."  })
                        return res.status(200).send({ message: "You have stopped following this user." })
                    })
                    User.findOneAndUpdate({ user_name: username }, { $pull: { followers: { follower: my_userId } } }, { new: true }, (err, followerAdded) => {
                        console.log("You have stopped following this user.");
                    })
                }
            })
            break;
        
        case "FOLLOW":
            var username = data[1];
            var my_userId = req.user.sub;

            try {
                User.findOne({ user_name: username }, (err, user) => {
                    if (err) return res.status(500).send({ message: "The user wasn't found. Try again with a user existing please." })
                    if (!user || username == req.user.user_name) {
                        return res.status(404).send({ message: "The user doesn't exist. Please Try again" })
                    } else {
                        User.findOneAndUpdate({ user_name: username }, { $addToSet: { followers: { follower: req.user.sub, username: req.user.user_name } } }, { new: true }, async (err, NewFollow) => {
                            console.log("Now you follow this user.");
                        })
                        User.findByIdAndUpdate(my_userId, { $addToSet: { followed: { followed: user._id, username: username } } }, { new: true }, (err, Followed) => {
                            return res.status(200).send({ message: "Now you follow this user.", Followed })
                        })
                    }
                })

            } catch (error) {
                // console.error(error);
                res.status(500).send({ message: error.message });
                console.error("An error has occurred. Try again please.");
            }
            break;   
        
        case "LIKE_TWEET":
            var idTweet = data[1];
            var my_userId = req.user.sub;
            
                try {
                    
                    //Function to remove duplicate data.
                        // Tweet.find({$match:{"_id": idTweet}} ,{ $unwind: '$like'},{"like.user" : req.user.sub}, (err,tweet) =>{
                        // if (tweet) {
                        //     console.log(tweet);
                        //     return res.status(404).send({ message: "You cannot give 'like' twice." })
                        // } else{
                        //     console.log(tweet);
                Tweet.findById(idTweet, (err, tweet) => {
                if (err) return res.status(500).send({ message: "The tweet wasn't found. Try again with a tweet existing please." })
                if (!tweet) {
                        return res.status(404).send({ message: "The tweet doesn't exist. Please Try again" })
                    } else {                               
                                Tweet.aggregate([{ $unwind: "$like" },{$count : "numLikes"}], function (err, count) {  
                                    Tweet.findByIdAndUpdate(idTweet, { $pull: { numLikes: {$ne : count}} }, { new: true }, (err, New) => {
                                    }) 
                                    Tweet.findByIdAndUpdate(idTweet, { $addToSet: { numLikes: count} }, { new: true }, (err, New) => {
                                    })  
                                    })                       
                    
                                Tweet.findByIdAndUpdate(idTweet, { $addToSet: { like: { user: req.user.sub, username: req.user.user_name } }}, { new: true }, async (err, Liked) => {
                                    console.log("You liked this tweet.");
                                    return res.status(200).send({ message: "You liked this tweet.", Liked })
                                })     
                            }
                        })
                        //The problem with the meter still needs to be fixed.
                //     }
                // })
    
                } catch (error) {
                    // console.error(error);
                    res.status(500).send({ message: error.message });
                    console.error("An error has occurred. Try again please.");
                }

                
                break;

                case "DISLIKE_TWEET":
                    var idTweet = data[1];
                    var my_userId = req.user.sub;
                        try {
                        Tweet.findById(idTweet, (err, tweet) => {
                        if (err) return res.status(500).send({ message: "The tweet wasn't found. Try again with a tweet existing please." })
                        if (!tweet) {
                                return res.status(404).send({ message: "The tweet doesn't exist. Please Try again" })
                            } else {
                            
                                // Tweet.find({_id: idTweet},{"like.user" : {$ne :req.user.sub }  } , (err,tweet) =>{
                                //     if (err) return res.status(500).send({ message: "An error has occurred." })
                                //     if (tweet) {
                                //             return res.status(404).send({ message: "You cannot give 'dislike' to a tweet that hasn´t your like." })
                                //     } else {
                                        Tweet.findByIdAndUpdate(idTweet, { $pull: { like: { user: req.user.sub, username: req.user.user_name } } }, { new: true }, async (err, Liked) => {
                                            if(err) return res.status(500)({message: "You don't give dislike to this tweet, because it hasn't your like." })
                                                console.log("You disliked this tweet.");
                                                return res.status(200).send({ message: "You liked this tweet.", Liked })
                                            })
                                    // }
                                    // })
                                
                                }
                            })
            
                        } catch (error) {
                            // console.error(error);
                            res.status(500).send({ message: error.message });
                            console.error("An error has occurred. Try again please.");
                        }
                        break;
        case "REPLY_TWEET":
            var idTweet = data[1];
            var response = data[2]
            var my_userId = req.user.sub;
                try {
                Tweet.findById(idTweet, (err, tweet) => {
                if (err) return res.status(500).send({ message: "The tweet wasn't found. Try again with a tweet existing please." })
                if (!tweet) {
                        return res.status(404).send({ message: "The tweet doesn't exist. Please Try again" })
                    } else {
                          //The problem with the meter still needs to be fixed.
                          Tweet.aggregate([{ $unwind: "$responses" },{$count : "numResponses"}], function (err, count) {  
                            Tweet.findByIdAndUpdate(idTweet, { $pull: { numResponses: {$ne : count}} }, { new: true }, (err, New) => {
                            }) 
                            Tweet.findByIdAndUpdate(idTweet, { $addToSet: { numResponses: count} }, { new: true }, (err, New) => {
                            })  
                            })   

                        Tweet.findByIdAndUpdate(idTweet, { $push: { responses: { user: my_userId, username: req.user.user_name, response : response } } }, { new: true }, async (err, replied) => {
                            if(err) return res.status(500)({message: "An error has occurred." })
                            console.log("You replied this tweet.");
                            return res.status(200).send({ message: "You liked this tweet.", replied})
                        })
                        }
                    })
                } catch (error) {
                    // console.error(error);
                    res.status(500).send({ message: error.message });
                    console.error("An error has occurred. Try again please.");
                }
        break;

        case "RETWEET":
            var idTweet = data[1];
            var comment = data[2]
            var my_userId = req.user.sub;
                try {
                Tweet.findById(idTweet, (err, tweet) => {
                if (err) return res.status(500).send({ message: "The tweet wasn't found. Try again with a tweet existing please." })
                if (!tweet) {
                        return res.status(404).send({ message: "The tweet doesn't exist. Please Try again" })
                    } else{
                        //The problem with the meter still needs to be fixed.
                        User.aggregate([{ $unwind: "$retweet" },{$count : "numRetweets"}], function (err, count) {  
                            Tweet.findByIdAndUpdate(idTweet, { $pull: { numRetweets: {$ne : count}} }, { new: true }, (err, New) => {
                            }) 
                            Tweet.findByIdAndUpdate(idTweet, { $addToSet: { numRetweets: count} }, { new: true }, (err, New) => {
                            })  
                            }) 

                        User.findByIdAndUpdate(my_userId, { $pull: { retweet: { tweet :tweet } } }, { new: true }, async (err, retweet) => {
                            if(err) return res.status(500)({message: "Oops! An error has occurred." })
                            // return res.status(200).send(retweet)    
                        })
                        User.findByIdAndUpdate(my_userId,{ $addToSet: { retweet: { comment: comment, tweet: tweet} } }, { new: true}, async (err, retweet) => {
                            // if(retweet.tweet._id == idTweet) return res.status(500)({message: "An error has occurred." })
                            if(err) return res.status(500)({message: "An error has occurred." })
                            console.log("You have retweeted this tweet.");
                            return res.status(200).send(retweet)
                        })
                        }
                    })
                } catch (error) {
                    // console.error(error);
                    res.status(500).send({ message: error.message });
                    console.error("An error has occurred. Try again please.");
                }
        break;
        default:
            res.status(500).send({ message: 'Invalid option, try again please.' });
            break;
    }
}

module.exports = {
    commands
}



