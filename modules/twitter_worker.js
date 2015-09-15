var twitter_worker = (function () {
    
    var express = require('express');
    var app = express();
    
    var Twitter = require('twitter');    

var client = new Twitter({
    consumer_key: 'NfFS9bhhE9eVA1lNV9hdl4SWL',
    consumer_secret: 'NvMSceRsOtMbt8LXWzOs7ZFfG7c429x3ha5JPHXJgnemoBLjVM',
    access_token_key: '3642200175-tlhQxsWKDGVEaqJCU6G6zOTB3BDllUgRiJX2tXn',
    access_token_secret: 'NTOKaCuXkMZJwuEi40bP2sO5dVFgoo1PD7T5M826aoHtZ'
});

var params = { cursor: '-1', screen_name: 'maksimkovalko', skip_status: true, include_user_entities: false };

app.get('/timeline', function (req, res) {
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        var user = {};
        if (!error) {
            console.log(tweets);
            for (var i = 0; i < tweets.length; i++) {
                console.log(tweets[i].text + "\n");
                user.id = tweets[i].user.id;
                user.profile_image_url = tweets[i].user.profile_image_url;
                user.tweets_count = tweets.length;
            }
            console.log(JSON.stringify(user));
            res.end(JSON.stringify(user));
        }
    });
});

app.get('/friends', function (req, res) {
    client.get('friends/list', { cursor: '-1', screen_name: 'maksimkovalko', skip_status: true, include_user_entities: false }, function (error, tweets, response) {
        if (!error) {
            //Consist friend's id, screen_name, profile_image_url, amount of tweets
            var friendsData = [];
            var friends = tweets.users;
            console.log(tweets);
            for (var i = 0; i < friends.length; i++) {
                var obj = {
                    id: friends[i].id,
                    screen_name: friends[i].screen_name,
                    profile_image_url: friends[i].profile_image_url,
                    tweets_count: friends[i].statuses_count
                };
                friendsData.push(obj);
                console.log(JSON.stringify(obj) + "\n");
            }
            
            var resultObject = {
                friends: friendsData
            };
            
            res.end(JSON.stringify(resultObject));
        }
    });
});

app.get('/tweet', function (req, res) {
    client.post('statuses/update', { status: 'I am a Node.JS tweet' }, function (error, tweet, response) {
        if (!error) {
            console.log(tweet);
        }
    });
});

});

module.exports = twitter_worker;