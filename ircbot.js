var irc = require('irc'),
    path = require('path'),
    fs = require('fs');

var config = getConfig(),
    scripts = [],
    commands = [];

// Load scripts and instantiate commands
loadModules();

// Setup the server
var client = new irc.Client(config.server, config.nick, config);
// Crucial server events
client.connect(function() {
    console.log("Connected!");
});
client.addListener('error', function(message) {
    console.log('error: ', message);
});
client.addListener('message', function(from, to, message) {
    // Make sure the message has the server prefix, otherwise ignore
    if (message.substr(0, config.prefix.length) != config.prefix) {
        return;
    }

    console.log(from + ' => ' + to + ': ' + message);

    var replyto = (to == config.nick)?from:to;
    var botmsg = message.substr(config.prefix.length);
    handleRequest(from, to, botmsg, replyto);
});

// Deals with an incoming command to the bot
function handleRequest(from, to, message, replyto) {
    var args = message.split(" "),
        first_arg = args[0],
        funcName = first_arg;

    // If the command doesn't exist fallback to a defined one
    if (!(first_arg in this.commands)) {
        if (typeof config.defaultCommand != 'undefined' &&
            defaultCommand in this.commands) {
            funcName = defaultCommand;
        } else {
            return;
        }
    }

    // Setup args to be sent to the script's command
    var func = this.commands[funcName],
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

// Instantiates all the modules in the scriptDir
// and prepares them for execution by handleRequest
function loadModules() {
    this.scripts = [];
    this.commands = [];

    fs.readdir(config.scriptDir, function(err, files) {
        if (err) {
            console.log("Error when loading files");
            process.exit();
        }

        var script_count = 0,
            command_count = 0;
        for (var i = 0; i < files.length; i++) {
            var filename = files[i],
                abspath = config.scriptDir + "/" + filename,
                ext = path.extname(filename),
                base = path.basename(filename, ext);

            if (ext != '.js') {
                continue;
            }

            var module = require(abspath);
            this.scripts[filename] = module;
            script_count++;

            for (var k in module.commands) {
                this.commands[k] = module.commands[k];
                command_count++;
            }

        }

        console.log("Loaded " + script_count + " modules and " + command_count + " commands");
    });
}

// Reload the modules while the server is running
this.reloadModules = function() {
    console.log("Reloading the modules...");

    // Clear the module cache for all loaded modules
    for (var key in scripts) {
        var filename = scriptDir + '/' + key;
        delete require.cache[require.resolve(filename)];
    }

    loadModules();
}

// Event to disconnect server on process exit and reload modules
process.on('SIGINT', cleanup);
process.on('SIGHUP', this.reloadModules);
process.on('SIGUSR2', cleanup);

// Cleanly disconnects bot from the server
function cleanup() {
    if (typeof client != 'undefined') {
        client.disconnect(function() {
            console.log("Disconnected");
        });
    }

    for (var i in this.scripts) {
        var script = this.scripts[i];

        if (typeof script.cleanup != 'undefined') {
            script.cleanup();
        }
    }
}

// Sets up configuration array combining user-defined
// config with defaults
function getConfig() {
    // Configuration defaults
    var config = {
        nick: 'hal',
        prefix: '?',
        dataDir: __dirname + '/data',
        scriptDir: __dirname + '/scripts',
        defaultcommand: 'doLookup',

        // IRC module options
        userName: 'hal',
        realName: 'An IRC Bot',
        port: 6667,
        autoConnect: false,
        channels: [ ],
    };

    // Override default config with user-specified
    var user_config = require('./config.js').config;
    for (var attr in user_config) {
        config[attr] = user_config[attr];
    }

    return config;
}
