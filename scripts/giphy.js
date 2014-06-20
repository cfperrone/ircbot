// giphy.js
var request = require('request');

var url_base = 'http://api.giphy.com/v1/gifs',
    api_ext = 'api_key=dc6zaTOxFJmzC';

module.exports = {
    name: "Giphy",
    description: "Gets gifs from Giphy",
    commands: {
        giphy: doGiphy
    }
};

function doGiphy(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        // Get a random gif
        var url = url_base + "/random?" + api_ext;

        request(url, function(error, response, body) {
            if (error || response.statusCode != 200) {
                return;
            }

            var obj = JSON.parse(body),
                random_img = obj.data,
                img_url = random_img.image_original_url;

            client.say(args.replyto, img_url);
        });
    } else {
        // Do a search, then a random gif from the results
        var query = cmd_args.splice(1).join('+'),
            url = url_base + "/search?q=" + query + "&" + api_ext;

        request(url, function(error, response, body) {
            if (error || response.statusCode != 200) {
                return;
            }

            var obj = JSON.parse(body),
                images = obj.data;

            if (images.length == 0) {
                client.say(args.replyto, "I've got nothing");
                return;
            }

            var index = Math.floor(Math.random() * images.length),
                random_img = images[index],
                img_url = random_img.images.original.url;

            client.say(args.replyto, img_url);
        });
    }
}

function replyWithGif(client, args, obj) {
    var url = obj.images.original.url;
    client.say(args.replyto, url);
}
