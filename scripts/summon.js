// summon.js
// For retrieving images from Google image search
var qs = require('querystring'),
    request = require('request');

// Default Goolge Custom Search parameters
var api_url = 'https://www.googleapis.com/customsearch/v1',
    default_args = {
        cx: '017775642205557282560:rjctk0uium8',
        key: 'AIzaSyDvCKb-OZ9lgYbExSZJu098sV1k_EDTUwU',
        searchType: 'image',
        num: '1',
    };

module.exports = {
    name: "Summon",
    description: "Google Image Search",
    commands: {
        summon: doSummon,
        resummon: doResummon,
    }
};

function doSummon(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, "Summon what?");
        return;
    }

    var query_args = {
        q: cmd_args.slice(1).join('+'),
    };

    doCustomSearch(client, args.replyto, query_args);
}

function doResummon(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, "Resummon what?");
        return;
    }

    var query_args = {
        q: cmd_args.slice(1).join('+'),
        start: '2',
    };

    doCustomSearch(client, args.replyto, query_args);
}

// Helper to make Google Custom Search API request and return results
// Takes a map of GET arguments and merges them with defaults
function doCustomSearch(client, replyto, new_args) {
    // Merge default args with new_args
    var args = default_args;
    for (var key in new_args) {
        args[key] = new_args[key];
    }

    // Build the query string
    var query_string = api_url + '?' + qs.stringify(args);

    // Make the request
    request(query_string, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }

        if (response.statusCode != 200) {
            var obj = JSON.parse(body),
                msg = response.statusCode + ": " + obj.error.errors[0].message;
            console.log(msg);
            return;
        }

        // Parse the result
        var obj = JSON.parse(body),
            search_info = obj.searchInformation,
            total_results = parseInt(search_info.totalResults),
            items = obj.items;

        // Make sure we got some results
        if (total_results < 1) {
            client.say(replyto, "Even Google doesn't know what that is...");
        }

        var item = items[0],
            image_url = item.link,
            thumb_url = item.image.thumbnailLink;

        client.say(replyto, image_url);
    });
}
