// mtastatus.js
var request = require('request'),
    parser = require('xml2js'),
    entities = require('entities'),
    webUrl = "http://web.mta.info/status/serviceStatus.txt",
    irc = require('irc'); // used only for irc.colors

var line_colors = {
    '123':  'light_red',
    '456':  'dark_green',
    '7':    'magenta',
    'ACE':  'dark_blue',
    'BDFM': 'orange',
    'G':    'light_green',
    'JZ':   'dark_red',
    'NQR':  'yellow',
    'L':    'gray',
    'S':    'gray',
    'SIR':  'dark_blue',
}

module.exports = {
    name: "MTA Status",
    description: "Gets the current status for the NYC MTA Subway system",
    commands: {
        mta: getMTAStatus
    }
};

function getMTAStatus(client, args) {
    var cmd_args = args.args;

    // Make sure we had a second argument, as we can't continue otherwise
    if (cmd_args.length < 2) {
        client.say(args.replyto, "You must specify a line!");
        return;
    }

    var input_line = cmd_args[1],
        line_key = getLineKey(input_line),
        all_status = [];

    // Make sure we asked for a sane line
    if (line_key == null) {
        client.say(args.replyto, "I don't know that line");
        return;
    }

    request(webUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            parser.parseString(body, function(err, data) {
                for (var i in data.service.subway[0].line) {
                    var line = data.service.subway[0].line[i],
                        name = line.name[0],
                        status = line.status[0],
                        text = sanitize(line.text[0]);

                    all_status[name] = {
                        status: status,
                        text: text,
                    };
                }

                var theLine = all_status[line_key],
                    color = getColorForLine(line_key),
                    outstr = line_key + ": " + theLine.status + "\n" + theLine.text;

                if (color) {
                    outstr = irc.colors.wrap(color, line_key) + ": " + theLine.status + "\n" + theLine.text;
                }

                client.say(args.replyto, outstr);
            });
        }
    });
}

function getLineKey(input) {
    input = input.toUpperCase();
    switch (input) {
        case '1':
        case '2':
        case '3':
            return '123';
        case '4':
        case '5':
        case '6':
            return '456';
        case '7':
            return '7';
        case 'A':
        case 'C':
        case 'E':
            return 'ACE';
        case 'B':
        case 'D':
        case 'F':
        case 'M':
            return 'BDFM';
        case 'G':
            return 'G';
        case 'J':
        case 'Z':
            return 'JZ';
        case 'L':
            return 'L';
        case 'N':
        case 'Q':
        case 'R':
            return 'NQR';
        case 'S':
            return 'S';
        case 'SIR':
            return 'SIR';
        default:
            return null;
    }
}

function getColorForLine(line) {
    if (typeof line_colors[line] != 'undefined') {
        return line_colors[line];
    }
    return null;
}

function sanitize(text) {
    text = text.replace(/<\/?(br *\/?)>/gi, '\r\n');
    text = text.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '');
    text = entities.decodeHTML(text);
    lines = text.split("\r\n");
    for (var l in lines) {
        lines[l] = lines[l].trim();
    }
    lines = lines.filter(function(value) {
        return !(value == '' || value == null)
    });
    text = lines.join("\n");
    return text;
}
