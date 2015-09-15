var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var cheerio = require('cheerio');
var webshot = require('webshot');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var login, width, height;

var client = new Twitter({
    consumer_key: 'NfFS9bhhE9eVA1lNV9hdl4SWL',
    consumer_secret: 'NvMSceRsOtMbt8LXWzOs7ZFfG7c429x3ha5JPHXJgnemoBLjVM',
    access_token_key: '3642200175-tlhQxsWKDGVEaqJCU6G6zOTB3BDllUgRiJX2tXn',
    access_token_secret: 'NTOKaCuXkMZJwuEi40bP2sO5dVFgoo1PD7T5M826aoHtZ'
});

var params = { cursor: '-1', screen_name: login, skip_status: true, include_user_entities: false };

app.get('/timeline', function (req, res) {
    client.get('users/lookup', params, function (error, tweets, response) {
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

app.get('/collage', function (req, res) {
    client.get('friends/list', { cursor: '-1', screen_name: login, skip_status: true, include_user_entities: true, include_rts:true, count:200 }, function (error, tweets, response) {
        if (!error) {
            //Consist friend's id, screen_name, profile_image_url, amount of tweets
            var friendsData = [];
            $ = cheerio.load("<div id='main' style='width:" + width + "px; height: " + height + "px;'></div>");

            var friends = tweets.users;
            console.log(tweets);
            for (var i = 0; i < friends.length; i++) {
                var obj = { 
                    id: friends[i].id,
                    screen_name: friends[i].screen_name,
                    profile_image_url: friends[i].profile_image_url,
                    tweets_count: friends[i].statuses_count
                };

                $("#main").append("<div style='display: inline-block;'><img src='"+ obj.profile_image_url.replace('_normal', '_bigger') +"'></div>");
                friendsData.push(obj);
                console.log(JSON.stringify(obj) + "\n");
            }

            var resultObject = {
                    friends: friendsData
            };

            console.log($.html());
            
            var randomImageId = Math.floor(Math.random() * 1000000);

            webshot($.html(), 'image'+ randomImageId +'.png', { siteType: 'html' }, function (err) {
                if (!err) {
                    fs.readFile(__dirname + '/image'+ randomImageId +'.png', function (err, data) {
                        if (err) res.redirect('/collage');
                        if (data != null) {
                            res.writeHead(200, { 'Content-Type': 'image/png' });
                            res.end(data);
                            fs.unlink(__dirname + '/image' + randomImageId + '.png', function (err) {
                            });
                        }
                    });
                }

            });

            //res.end($.html());

            //res.end(JSON.stringify(resultObject));
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

app.post('/init', function (req, res) {
    login = req.body.login;
    width = req.body.width;
    height = req.body.height;
    res.send("collage");
    console.log(login, width, height);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;