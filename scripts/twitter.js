// twitter.js
// For retrieving posts from Twitter
var qs = require('querystring'),
    request = require('request'),
    moment = require('moment'),
    secrets = require('../includes/twitter_secrets.js');

var api_key = secrets.api_key,
    api_secret = secrets.api_secret,
    token = new Buffer(api_key + ':' + api_secret).toString('base64'),
    auth = 'Basic ' + token;

var api_url_base = 'https://api.twitter.com',
    oauth_url = '/oauth2/token',
    timeline_url = '/1.1/statuses/user_timeline.json';

var twitter_url_base = 'https://twitter.com';

module.exports = {
    name: "Twitter",
    description: "Access to the Twitter API",
    commands: {
        twitter: doTwitterGet,
    }
};

function doTwitterGet(client, args) {
    var cmd_args = args.args;

    // Check that a user was specified
    if (cmd_args.length < 2) {
        client.say(args.replyto, "You must specify a user");
        return;
    }

    getAuthToken(client, args, getRecentPost);
}

function getAuthToken(client, args, then) {
    request.post({
        url: api_url_base + oauth_url,
        headers: {
            Authorization: auth,
        },
        body: 'grant_type=client_credentials'
    }, function(err, response, body) {
        var obj = JSON.parse(body),
            access_token = obj.access_token;

        then(client, args, access_token);
    });
}

function getRecentPost(client, args, access_token) {
    var screen_name = args.args[1],
        offset = (args.args.length == 3) ? parseInt(args.args[2]) : 0;

    var params = {
        screen_name: screen_name,
        count: offset + 1,
    };

    request.get({
        url: api_url_base + timeline_url + '?' + qs.stringify(params),
        headers: {
            Authorization: 'Bearer ' + access_token,
        },
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            return;
        }

        var obj = JSON.parse(body);
        if (typeof obj.error != 'undefined') {
            console.log('Twitter Error: ' + obj.error);
            client.say(args.replyto, 'Error: ' + obj.error);
            return;
        }

        var obj = obj[offset],
            post_text = obj.text,
            screen_name = obj.user.screen_name;
            post_id = obj.id_str,
            post_url = twitter_url_base + '/' + screen_name + '/status/' + post_id,
            post_date = moment(obj.created_at);

        var output = "\"" + post_text + "\" Posted By " + screen_name + " " + post_date.fromNow() + " (" + post_url + ")";

        client.say(args.replyto, output);
    });
}
