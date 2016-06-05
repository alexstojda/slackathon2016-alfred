/**
 * Created by gabriel on 6/4/2016.
 */

var ticketDB = require('./TicketDatabase');
var request = require('request');
var userResponse = require('./userResponse');
var token = require('../token/token.js');
var BOT_HASH = 'U1E5ZKB7S';
var NEW_TICKET_CHANNEL = 'C1E7ETNJH';

var checkEmailFormat = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var checkEmpty = function(text) {
    return text == null || text.trim() == "";
};

var handleFormInput = function(formData, cbSuccess, cbError) {

    //First thing we want to do is get into the database
    //var insertTicketRecord = function(email, name, customFields, ticketTitle, ticketDescription) {
    var email = formData.email;
    var name = formData.name;
    var title = formData.title;
    var description = formData.description;
    var customFields = {};

    if (checkEmpty(name)) {
        cbError("1");
        return;
    }

    if (checkEmpty(title)) {
        cbError("2");
        return;
    }

    if (checkEmpty(description)) {
        cbError("3");
        return;
    }

    if (!checkEmailFormat(email)) {
        cbError("4");
        return;
    }

    ticketDB.insertTicketRecord(email, name, customFields, title, description, function(ticketId) {
        //Next after inserted the ticket data to the DB
        createChannel(ticketId, title, description, name, email, cbSuccess, cbError);

    }, function(error) {
        //In the event of an error
        cbError(error);
    });

};

var createChannel = function(ticketId, ticketTitle, ticketDescription, name, email, cbSuccess, cbError) {

    request('https://slack.com/api/channels.create?token='+token.WEB_HOOK+'&name=' + ticketId.toString(), function (error, response, body) {
        if (error || response.statusCode !== 200) {
            //API Error
            cbError("Unable to create channel for this ticket, please try again...")
        }
        else {

            var body_object = JSON.parse(body);

            if (body_object.ok) {

                var channelId = body_object.channel.id;
                ticketDB.addChannelIdToTicket(ticketId, channelId);
                ticketDB.setTicketToken(ticketId);

                request('https://slack.com/api/channels.setTopic?token='+token.WEB_HOOK+'&channel=' + channelId + '&topic=' + ticketTitle,
                    function (error, response2, body2) {
                        var body2_object = JSON.parse(body2);
                        if (error) {
                            console.error(error.message);
                        } else if (!body2_object.ok)
                            console.error(body2.error);
                        else {
                            console.log('Finished creating channel for ticket #' + ticketId + ' with topic: ' + ticketTitle);
                            var msg = "A new Ticket has been submitted, \""+ticketTitle+"\" => %23"+ticketId;
                            request('https://slack.com/api/chat.postMessage?as_user=true&link_names=true&token='+token.BOT+'&channel='+NEW_TICKET_CHANNEL+"&text="+msg);
                        }
                    });

                var message = name + ' (' + email + ') asks: \n';
                message += ticketDescription;
                userResponse.sendMessageAsBot(message, ticketId.toString(), true, function () {
                    console.log('successfully initialized the channel with the ticket description');
                }, function (error) {
                    console.error('Error in initializing channel for ticket #' + ticketId + '\n\n' + error.message);
                });

                //var senderName = body.user.real_name;
                request('https://slack.com/api/channels.invite?token='+token.WEB_HOOK+'&channel='+channelId+'&user='+BOT_HASH, function(error, response2, body2) {
                    if(error || response2.errorCode !== 200){
                        console.log(error);
                    }
                    else if(!JSON.parse(body2).ok){
                        console.log('Bot could not be added to new channel');
                    }
                });
                cbSuccess({
                    ticketId: ticketId,
                    title: ticketTitle,
                    description: ticketDescription
                });

            } else {
                cbError("Unable to create channel for this ticket, please try again...")
            }
        }
    });

};

module.exports.handleFormInput = handleFormInput;
module.exports.checkEmailFormat = checkEmailFormat;