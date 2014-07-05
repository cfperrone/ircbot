// learn.js
var sqlite3 = require('sqlite3'),
    fs = require('fs');

var dbfile = __dirname + "/../data/learn.db";

// If the database doesn't exist, create it
fs.exists(dbfile, function(exists) {
    learn_db = new sqlite3.Database(dbfile);

    if (!exists) {
        createDb();
    }
});

module.exports = {
    name: "Learn",
    description: "This does things",
    commands: {
        learn: doLearn,
        unlearn: doUnlearn,
        list: doList,
        dolookup: doLookup,
    },
    cleanup: function() {
        console.log("Cleanedup!");
        learn_db.close();
    }
};

// Creates a database for learn
function createDb() {
    learn_db.run("CREATE TABLE learn (`key` text, value text)", function(err) {
        if (err) {
            console.log(err);
        }
    });
}

// Performs the learn command
function doLearn(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 3) {
        client.say(args.replyto, "Usage: learn <keyword> <response>");
        return;
    }

    var keyword = cmd_args[1],
        value = cmd_args[2];

    learn_db.run("INSERT INTO learn VALUES (?, ?)", keyword, value, function(err) {
        if (err == null) {
            client.say(args.replyto, "OK. I learned " + keyword);
        }
    });

}

// Performs the unlearn command
function doUnlearn(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, "Usage: unlearn <keyword> (<value>)");
        return;
    }

    var keyword = cmd_args[1];
    if (cmd_args.length == 3) {
        var value = cmd_args[2];
        learn_db.run("DELETE FROM learn WHERE `key`=? AND value=?", keyword, value, function(err) {
            if (err == null) {
                client.say(args.replyto, "OK. I forgot " + keyword);
            }
        });
    } else {
        learn_db.run("DELETE FROM learn WHERE `key`=?", keyword, function(err) {
            if (err == null) {
                client.say(args.replyto, "OK. I forgot " + keyword);
            }
        });
    }
}

// Performs the list command
function doList(client, args) {
    var cmd_args = args.args;

    if (cmd_args.length < 2) {
        client.say(args.replyto, "Usage: list <keyword>");
        return;
    }

    var keyword = cmd_args[1];
    client.say(args.replyto, "OK: I'm going to PM you a list of results");
    var index = 0;
    learn_db.each("SELECT value FROM learn WHERE `key`=?", keyword, function(err, row) {
        if (err) {
            return;
        }

        client.say(args.from, index + ": " + row.value);
        index++;
    }, function(err) {
    });

}

// Performs a learn lookup
function doLookup(client, args) {
    var cmd_args = args.args,
        cmd = cmd_args[0];

    learn_db.all("SELECT value FROM learn WHERE `key`=?", cmd, function(err, rows) {
        if (err) {
            console.log(err);
            return;
        }

        if (rows.length == 0) {
            return;
        }

        var index = Math.floor(Math.random() * rows.length);
        if (cmd_args.length == 2) {
            var newIndex = parseInt(cmd_args[1]);
            if (newIndex >= 0 && newIndex < rows.length) {
                index = newIndex;
            }
        }

        client.say(args.replyto, rows[index].value);
    });
}
