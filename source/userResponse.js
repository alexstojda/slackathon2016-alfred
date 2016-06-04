/**
 * Created by robert_Account on 2016-06-04.
 */

//TEMPLATE CURRENTLY
var request = require('request');
var requestData = {
    "text": "penis"
};

request({
    url: "https://elslackos.slack.com/services/hooks/slackbot?token=xoxb-48203657264-VQPgm03W8yAM3MpXhsjw44em&channel=general",
method: "POST",
    json: true,
    headers: {
    "content-type": "application/json",
},
body: JSON.stringify(requestData)
});
