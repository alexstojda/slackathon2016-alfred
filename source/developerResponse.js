/**
 * Created by robert_Account on 2016-06-04.
 */

var slackbot = require('node-slackbot');
 var bot = new slackbot('xoxb-48203657264-VQPgm03W8yAM3MpXhsjw44em');

 bot.use(function(message, cb) {
 if ((message.type == 'message') && (message.text.includes('<@U1E5ZKB7S>:'))) {
 console.log(message.user + ' said: ' + message.text);

 }
 cb();
 });

 bot.connect();


