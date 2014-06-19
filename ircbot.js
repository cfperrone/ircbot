var irc = require('irc'),
    path = require('path'),
    fs = require('fs');

if (process.argv.length < 3) {
    console.log("Usage: node ircbot.js <hostname>");
    process.exit();
}

/* Configuration */
var server = process.argv[2],
    nick = 'hal',
    prefix = '?',
    dataDir = __dirname + '/data',
    scriptDir = __dirname + '/scripts',
    defaultCommand = "dolookup",
    options = {
        userName: nick,
        realName: 'An IRC Bot',
        port: 6667,
        autoConnect: false,
        channels: [
        ],
    };

// Other globals
var scripts = [];
var commands = [];

// Load scripts and instantiate commands
loadModules();

// Setup the server
var client = new irc.Client(server, nick, options);
// Instantiate hooks for various server events
client.connect(function() {
    console.log("Connected!");
});
client.addListener('error', function(message) {
    console.log('error: ', message);
});
client.addListener('message', function(from, to, message) {
    // Make sure the message has the server prefix, otherwise ignore
    if (message.substr(0, prefix.length) != prefix) {
        return;
    }

    console.log(from + ' => ' + to + ': ' + message);

    var replyto = (to == nick)?from:to;
    var botmsg = message.substr(prefix.length);
    handleRequest(from, to, botmsg, replyto);
});

function handleRequest(from, to, message, replyto) {
    var args = message.split(" "),
        first_arg = args[0],
        funcName = first_arg;

    // If the command doesn't exist fallback to a defined one
    if (!(first_arg in commands)) {
        if (typeof defaultCommand != 'undefined' &&
            defaultCommand in commands) {
            funcName = defaultCommand;
        } else {
            return;
        }
    }

    // Setup args to be sent to the script's command
    var func = commands[funcName],
        args = {
            from: from,
            to: to,
            replyto: replyto,
            raw_msg: message,
            args: args,
        };
    console.log("Calling command " + funcName);
    func(client, args);
}

function loadModules() {
    scripts = [];
    commands = [];

    fs.readdir(scriptDir, function(err, files) {
        if (err) {
            console.log("Error when loading files");
            process.exit();
        }

        var script_count = 0,
            command_count = 0;
        for (var i = 0; i < files.length; i++) {
            var filename = files[i],
                abspath = scriptDir + "/" + filename,
                ext = path.extname(filename),
                base = path.basename(filename, ext);

            if (ext != '.js') {
                continue;
            }

            var module = require(abspath);
            scripts[filename] = module;
            script_count++;

            for (var k in module.commands) {
                commands[k] = module.commands[k];
                command_count++;
            }

        }

        console.log("Loaded " + script_count + " modules and " + command_count + " commands");
    });
}
this.reloadModules = function() {
    // Reload the modules while the server is running
    console.log("Reloading the modules...");

    // clear the module cache for all loaded modules
    for (var key in scripts) {
        var filename = scriptDir + '/' + key;
        delete require.cache[require.resolve(filename)];
    }

    loadModules();
}

// Instantiate event to disconnect server on process exit
process.on('SIGINT', cleanup);
process.on('SIGHUP', this.reloadModules);
process.on('SIGUSR2', cleanup);

function cleanup() {
    if (typeof client != 'undefined') {
        client.disconnect(function() {
            console.log("Disconnected");
        });
    }

    for (var i in scripts) {
        var script = scripts[i];

        if (typeof script.cleanup != 'undefined') {
            script.cleanup();
        }
    }
}
