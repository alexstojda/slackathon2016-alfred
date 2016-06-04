/**
 * Created by robert_Account on 2016-06-04.
 */

var request = require('request');

module.exports.sendMessageAsBot = function(message, channel, next, error) {

    if (channel.length > 0 && channel[0] != '#')
        channel = '#' + channel;

    var requestData = {
        channel: channel,
        text: message
    };

    request({
        url: "https://hooks.slack.com/services/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",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: requestData
    }, function(err) {
        if (err && error != null)
            error(err);
        else if (next != null)
            next();
    });

};



