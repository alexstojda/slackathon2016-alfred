/**
 * Created by robert_Account on 2016-06-04.
 */
var fs = require('fs');
var slackbot = require('node-slackbot');
var token = require('../token/token.js');
var request = require('request');
var ticket = require('./TicketDatabase');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('direct:?name=slackos.teambana.com');
var BOT_HASH = '<@U1E5ZKB7S>';
var bot = new slackbot(token.BOT);
var userResponse = require('./userResponse.js');
var URGENT_CHANNEL = 'C1E74EV6G';

var setStatus = function (channelId, status) {

    request('https://slack.com/api/channels.archive?token=' + token.WEB_HOOK + '&channel=' + channelId, function(error, response, body) {
        if (error || response.statusCode !== 200) {
            //API Error
        }

        var body_object = JSON.parse(body);
        if (body_object.ok) {
            var ticketId = body_object.channel.name;

            ticket.setStatus(ticketId, status);
        }

    });

};

bot.use(function (message, cb) {
    if ((message.type == 'message') && (message.text.includes(BOT_HASH))) {

        if (message.text.includes('CLOSE TICKET')) {
            var channel = message.channel;

            request('https://slack.com/api/channels.archive?token=' + token.WEB_HOOK + '&channel=' + channel, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    //API Error
                }

                else {
                    //var senderName = body.user.real_name;
                    console.log(body);


                    if (body.ok) {

                        //Set Status of ticket to 1

                        setStatus(channel, 1);

                    }

                }
            });
        }

        else if (message.text.includes('MAKE URGENT')) {
            var channel = message.channel;

            request('https://slack.com/api/channels.info?token=' + token.WEB_HOOK + '&channel=' + channel,
                function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        //API Error
                    }
                    else {

                        var body_object = JSON.parse(body);
                        if (body_object.ok) {
                            var ticketTitle = 'URGENT: ' + body_object.channel.topic.value;
                            var ticketId = body_object.channel.name;
                            ticket.getStatus(ticketId, function (statusCode) {
                                //Check the see if it's already set to urgent
                                if (statusCode == 2) return;

                                ticket.setStatus(ticketId, 2);

                                request('https://slack.com/api/channels.setTopic?token=' + token.WEB_HOOK + '&channel=' + channel + '&topic=' + ticketTitle,
                                    function (error, response2, body2) {
                                        var body2_object = JSON.parse(body2);
                                        if (error) {
                                            console.error(error.message);
                                        } else if (!body2_object.ok)
                                            console.error(body2.error);
                                        else{
                                            var message = 'ticket #' + ticketId + ' has been marked as URGENT by ' + message.user;
                                            var channel = ticketId;
                                            userResponse.sendMessageAsBot(message,channel,false);
                                        }

                                    });

                            });
                        }
                    }
                });
        }

        else if (message.text.includes('ADD CUSTOM FIELD')) {
            var index = message.text.indexOf('ADD CUSTOM FIELD');
            if (index > 0)
                var message = message.text.substr(index);
            message = message.replace('ADD CUSTOM FIELD', '').trim();
            index = message.indexOf(' ');
            var field_name = message.substr(0, index);
            message = message.substr(index).trim();
            var field_desc = message.trim();
            console.log("Implements adding of field " + field_name + " DESCRIPTION: " + field_desc);
            ticket.insertCustomField(field_name, field_desc);
        }

        else if (message.text.includes('REMOVE CUSTOM FIELD')) {
            var index = message.text.indexOf('REMOVE CUSTOM FIELD');
            if (index > 0)
                var message = message.text.substr(index);
            message = message.replace('REMOVE CUSTOM FIELD', '').trim();
            var words = message.split(' ');
            var fieldName = words[0];
            ticket.deleteCustomField(fieldName);
        }

        else
            request('https://slack.com/api/users.info?token=' + token.WEB_HOOK + '&user=' + message.user, function (error, response, body) {
                if (error) {
                } else if (response.statusCode !== 200) {
                }
                else {
                    var senderName = JSON.parse(body).user.real_name;
                    request('https://slack.com/api/channels.info?token=' + token.WEB_HOOK + '&channel=' + message.channel, function (error, response, body) {
                        if (error) {
                        } else if (response.statusCode !== 200) {
                        }
                        else {
                            var channel = JSON.parse(body).channel.name;
                            sendEmail(channel, senderName, message.text);
                            message.text = message.text.replace(BOT_HASH, "");
                            ticket.insertTicketMessage(message.text, senderName, channel);
                        }
                    });
                }
            });
    }
    cb();
});

bot.connect();

var sendEmail = function (ticketID, respondingUserName, message) {
    fs.readFile('./views/email.html', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var html = data;
            getTicket(ticketID, function (ticketData) {
                ticket.getTicketToken(ticketID, function(token) {
                    message = message.replace(BOT_HASH, ticketData.name);

                    console.log(message);

                    var text = "You have received a new response from " + respondingUserName + '\n' +
                        '"' + message + "\"\n" +
                        "To reply to your ticket, please copy and paste this link into your browser \n\n" +
                        "<LINK>";//TODO: Add link to response form

                    html = html.replace(/{{NAME}}/g, ticketData.name);
                    html = html.replace(/{{LINK}}/g, 'http://localhost:3000/response?id='+ticketID+'&token='+token);
                    html = html.replace(/{{MESSAGE}}/g, message);
                    html = html.replace(/{{SENDING_USER}}/g, respondingUserName);
                    html = html.replace(/{{TITLE}}/g, ticketData.title);


                    var mailOptions = {
                        from: '"Alfred@El Slackos" <alfred@elslackos.slack.com>', // sender address
                        to: ticketData.email, // list of receivers
                        subject: 'New reply to your ticket: ' + ticketData.title, // Subject line
                        text: text, // plaintext body
                        html: html // html body
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                },
                function (err) {
                    //error handler
                });
            });
        }
    });
};

var getTicket = function (ticketID, cbNext, cbError) {
    ticket.fetchTicketRecord(ticketID, function (thisTicket) {
        cbNext(thisTicket);
    }, function (err) {
        if (cbError != null)
            cbError(err);
    });
};


