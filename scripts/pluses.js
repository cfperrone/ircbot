// pluses js
var sqlite3 = require('sqlite3'),
    fs = require('fs');

var dbfile = __dirname + "/../data/pluses.db";

// If the database doesn't eixst, create it
fs.exists(dbfile, function(exists) {
    pluses_db = new sqlite3.Database(dbfile);
    if (!exists) {
        createDb();
    }
});

module.exports = {
    name: "Pluses",
    description: "Give people props, yo",
    commands: {
        '++': doP,
        '--': doP,
        pluses: doP,
        donate: doT,
        transfer: doT,
    }
};

// Performs all routing for pluses
function doP(client, args) {
    var cmd_args = args.args,
        cmd = cmd_args[0],
        nick = null;

    if (cmd_args.length == 2) {
        nick = cmd_args[1];
    }

    if (cmd == '++') {
        if (!nick || nick == args.from) {
            client.say(args.replyto, "You'll go blind like that");
            return;
        }

        getPlusesForNick(client, args, nick, doPlus);
    } else if (cmd == '--') {
        getPlusesForNick(client, args, nick, doMinus);
    } else if (cmd == 'pluses') {
        if (!nick) {
            getPlusesForAll(client, args);
        } else {
            getPlusesForNick(client, args, nick, doPluses);
        }
    }
}

function doT(client, args) {
    var cmd_args = args.args,
        cmd = cmd_args[0],
        nick = null;

    if (cmd_args.length == 2) {
        nick = cmd_args[1];
    }

    if (!nick || nick == args.from) {
        client.say(args.replyto, "You'll go blind like that");
        return;
    }

    donatePlusForNicks(client, args, args.from, nick);
}

// Performs the ++ command
function doPlus(client, args, nick, pluses, announce) {
    if (typeof(announce) == 'undefined') announce = true;

    if (pluses == null) {
        pluses = 1;
        pluses_db.run("INSERT INTO pluses VALUES (?, ?)", nick, pluses, function(err) {
            if (err) {
                console.log(err);
                console.log("Couldn't create plusses entry for " + nick);
            }
        });
    } else {
        pluses_db.run("UPDATE pluses SET pluses = ? WHERE nick=?", ++pluses, nick, function(err) {
            if (err) {
                console.log(err);
                console.log("Couldn't add plus for " + nick);
            }
        });
    }

    if (announce) {
        client.say(args.replyto, nick + " now has " + pluses + " plus" + ((Math.abs(pluses) == 1)?"":"es") + "!");
    }

    return pluses;
}

function doMinus(client, args, nick, pluses, announce) {
    if (typeof announce === 'undefined') announce = true;

    if (pluses == null) {
        pluses = -1;
        pluses_db.run("INSERT INTO pluses VALUES (?, ?)", nick, pluses, function(err) {
            if (err) {
                console.log(err);
                console.log("Couldn't create pluses entry for " + nick);
            }
        });
    } else {
        pluses_db.run("UPDATE pluses SET pluses = ? WHERE nick=?", --pluses, nick, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

    if (announce) {
        client.say(args.replyto, nick + " now has " + pluses + " plus" + ((Math.abs(pluses) == 1)?"":"es") + "!");
    }

    return pluses;
}

// Performs the pluses command, shows number of pluses for nick
function doPluses(client, args, nick, pluses) {
    if (pluses == null) {
        pluses = 0;
    }

    client.say(args.replyto, nick + " has " + pluses + " plus" + ((Math.abs(pluses) == 1)?"":"es") + "!");
}

// Every action goes through this function because it must be run first
function getPlusesForNick(client, args, nick, then) {
    pluses_db.all("SELECT pluses FROM pluses WHERE nick=?", nick, function(err, rows) {
        if (err) {
            console.log(err);
            return;
        }

        var pluses = null;
        if (rows.length > 0) {
            pluses = parseInt(rows[0].pluses);
        }

        then(client, args, nick, pluses);
    });
}

function donatePlusForNicks(client, args, from, to) {
    getPlusesForNick(client, args, from, function(client, args, nick, pluses) {
        // Subtract a plus from 'from'
        var new_from = doMinus(client, args, from, pluses, false);
        // Get the pluses for the 'to' user
        getPlusesForNick(client, args, to, function(client, args, nick, pluses) {
            // Add a plus to 'to'
            var new_to = doPlus(client, args, to, pluses, false);
            client.say(args.replyto, from + " transferred a plus to " + to + "! " + from  + " has " + new_from + ", " + to + " has " + new_to);
        });
    });
}

function getPlusesForAll(client, args) {
    var str_out = "Pluses Leaderboard: ";
    pluses_db.each("SELECT * FROM pluses ORDER BY pluses DESC, nick ASC LIMIT 10", function(err, row) {
        if (err) {
            console.log(err);
            return;
        }

        str_out += row.nick + ": " + row.pluses + " ";
    }, function(err, num_rows) {
        client.say(args.replyto, str_out);
    });
}

// Creates a database for pluses
function createDb() {
    pluses_db.run("CREATE TABLE pluses (nick text, pluses)", function(err) {
        if (err) {
            console.log(err);
        }
    });
}
