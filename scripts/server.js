// server.js
// For controlling the ircbot
var irc = require('irc');

module.exports = {
    name: "Server Controls",
    description: "Commands to control the ircbot",
    commands: {
        join: doJoin,
        part: doPart,
        reload_modules: doReload,
        help: doHelp,
    }
};

// Makes the bot join a channel
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

// Makes the bot leave a channel
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

// Performs a reload of the modules
function doReload(client, args) {
    var parent = module.parent,
        obj = require(parent.filename);

    obj.reloadModules();
    client.say(args.replyto, "OK. Modules are reloaded.");
}

// PM the user a list of all the commands available
function doHelp(client, args) {
    client.say(args.replyto, "OK. I'm going to PM you everything I know");

    for (var key in scripts) {
        var script = scripts[key],
            name = script.name,
            desc = script.description,
            cmds = Object.keys(script.commands).join(", ");
        client.say(args.from, irc.colors.wrap('dark_green', name) + " (" + desc + ") | " + irc.colors.wrap('dark_red', 'Cmds') + ": " + cmds);
    }
}
