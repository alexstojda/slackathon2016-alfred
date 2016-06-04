/**
 * Created by robert_Account on 2016-06-04.
 */

//TEMPLATE CURRENTLY
var request = require('request');
var requestData = {
    "channel": "@gabe",
    "text": "you have a small penis"
};

request({
    url: "https://hooks.slack.com/services/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",
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json"
    },
    body: requestData
});
