/**
 * Created by robert_Account on 2016-06-04.
 */
var request = require('request');

request('https://slack.com/api/channels.history?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' , function (error, response, body) {
    if (error || response.statusCode !== 200) {
        //API Error
    }

    else {
        //var senderName = body.user.real_name;

    }
});
