// system.js
// For unix & programming commands

module.exports = {
    name: "System",
    description: "Commands for system control and programming helpers",
    commands: {
        unixtime: doUnixtime,
        remind: doRemind,
        reverse: doReverse,
    }
};

function doUnixtime(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, Math.round(Date.now()/1000));
    } else {
        var date_str = cmd_args.slice(1).join(" ");
        client.say(args.replyto, Math.round(Date.parse(date_str)/1000));
    }
}

function doRemind(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 3) {
        client.say(args.replyto, "You must specify a reminder");
        return;
    }

    var minutes = parseInt(cmd_args[1]);
    var message = cmd_args.slice(2).join(" ");

    setTimeout(function() {
        var self = this;
        client.say(args.from, message);
    }, minutes*60*1000);

    client.say(args.replyto, "OK. In " + minutes + " minues, we'll PM you");
}

// Simply reverses the input string
function doReverse(client, args) {
    var cmd_args = args.args;

    client.say(args.replyto, cmd_args.slice(1).join(" ").split("").reverse().join(""));
}
