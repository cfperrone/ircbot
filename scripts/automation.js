// automation.js
var request = require('request'),
    automation_url = "http://wrct.org/automation-log/display.php?plain=1";

module.exports = {
    name: "Automation",
    description: "Gets the current WRCT automation status",
    commands: {
        automation: getAutomationStatus
    }
};

function getAutomationStatus(client, args) {
    request(automation_url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            client.say(args.replyto, body);
        }
    });
}
