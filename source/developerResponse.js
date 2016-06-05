/**
 * Created by robert_Account on 2016-06-04.
 */

var slackbot = require('node-slackbot');
var token = require('../token/token.js');
var request = require('request');
var ticket = require('./TicketDatabase');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('direct:?name=slackos.teambana.com');
var BOT_HASH = '<@U1E5ZKB7S>';
var bot = new slackbot(token.BOT);

var setStatus = function(channelId, status) {

    request('https://slack.com/api/channels.archive?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' + channelId, function(error, response, body) {
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
            
            request('https://slack.com/api/channels.archive?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' + channel, function (error, response, body) {
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

        else if (message.text.includes('MAKE URGENT')){
            var channel = message.channel;

            request('https://slack.com/api/channels.info?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' + channel,
                function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        //API Error
                    }
                    else {

                        var body_object = JSON.parse(body);

                        if (body_object.ok) {
                            var ticketTitle = 'URGENT: ' + body_object.channel.topic.value;
                            var ticketId = body_object.channel.name;
                            ticket.getStatus(ticketId, function(statusCode) {
                                //Check the see if it's already set to urgent
                                if (statusCode == 2) return;

                                ticket.setStatus(ticketId, 2);

                                request('https://slack.com/api/channels.setTopic?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' + channel + '&topic=' + ticketTitle,
                                    function (error, response2, body2) {
                                        var body2_object = JSON.parse(body2);
                                        if (error) {
                                            console.error(error.message);
                                        } else if (!body2_object.ok)
                                            console.error(body2.error);
                                        else
                                            console.log('Success');
                                    });

                            });
                        }
                    }
                });
        }

        else
            request('https://slack.com/api/users.info?token='+token.WEB_HOOK+'&user='+message.user, function(error, response, body) {
                if (error) {} else if (response.statusCode !== 200) {}
                else {
                    var senderName = JSON.parse(body).user.real_name;
                    request('https://slack.com/api/channels.info?token='+token.WEB_HOOK+'&channel='+message.channel, function(error, response, body) {
                        if (error) {} else if (response.statusCode !== 200) {}
                        else {
                            var channel = JSON.parse(body).channel.name;
                            sendEmail(channel, senderName, message.text);
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
    getTicket(ticketID, function(ticket) {

        message = message.replace(BOT_HASH, ticket.name);

        //TODO: Save message in the database.

        console.log(message);

        var text =  "You have recevied a new response from "+respondingUserName+'\n'+
            '"'+message+"\"\n"+
            "To reply to your ticket, please copy and paste this link into your browser \n\n"+
            "<LINK>";//TODO: Add link to response form

        var html = "<h2>You have recevied a new response from "+respondingUserName+" for your ticket \""+ticket.title+"\"</h2>"+
            "<p>"+message+"</p>"+
            "<p><a href='#'>Click here to respond to your ticket</a></p>";


        var mailOptions = {
            from: '"Alfred@El Slackos" <alfred@elslackos.slack.com>', // sender address
            to: ticket.email, // list of receivers
            subject: 'New reply to your ticket: '+ticket.title, // Subject line
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


};

var getTicket = function(ticketID, cbNext, cbError){
    ticket.fetchTicketRecord(ticketID, function(thisTicket) {
        cbNext(thisTicket);
    }, function(err){
        cbError(err);
    });
};


