ircbot
=============

An IRC bot written in Node.js! Inspired by irccat and @ericnorris. Create new modules in scripts/. Each module must have the following declaration to be instantiated:

```
module.exports {
    name: "The module name",
    description: "A description of your module",
    commands: {
        testing: commandFunc
    }
}

function commandFunc(client, args) { }
```

In this example "testing" is what's typed in IRC to trigger the function commandFunc. The argument "client" is a node-irc object and "args" is a map of properties for the command instance with the following mapping:

```
args = {
    from: <nick of the sender>,
    to: <channel or nick of bot if pm>,
    replyto: <who to send replies to (channel or pm),
    raw_msg: <entire command set to bot>,
    args: <array of raw_msg split by a space>
}
```
See provided scripts for examples.

##Prerequisites
* Node.js v0.10.26+
* node-irc (https://github.com/martynsmith/node-irc)
