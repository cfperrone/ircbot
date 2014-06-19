// server.js
// For controlling the ircbot

module.exports = {
    name: "Server Controls",
    description: "Commands to control the ircbot",
    commands: {
        join: doJoin,
        part: doPart,
        reload: doReload,
    }
};

function doJoin(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, "Usage: join <channel>");
        return;
    }

    var channel = cmd_args[1];
    client.join(channel);
    client.say(args.replyto, "OK. I joined " + channel);
}

function doPart(client, args) {
    var cmd_args = args.args,
        channel = args.to;

    if (cmd_args.length == 2) {
        channel = cmd_args[1];
        client.say(args.replyto, "OK. I'm leaving " + channel);
    } else {
        client.say(args.replyto, "Bye");
    }

    client.part(channel);
}

function doReload(client, args) {
    var parent = module.parent,
        obj = require(parent.filename);

    obj.reloadModules();
    client.say(args.replyto, "OK. Modules are reloaded!");
}
