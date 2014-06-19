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

// Performs the ++ command
function doPlus(client, args, nick, pluses) {
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

    client.say(args.replyto, nick + " now has " + pluses + " plus" + ((Math.abs(pluses) == 1)?"":"es") + "!");
}

function doMinus(client, args, nick, pluses) {
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

    client.say(args.replyto, nick + " now has " + pluses + " plus" + ((Math.abs(pluses) == 1)?"":"es") + "!");
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
