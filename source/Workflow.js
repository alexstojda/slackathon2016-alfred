/**
 * Created by gabriel on 6/4/2016.
 */

var ticketDB = require('./TicketDatabase');
var request = require('request');
var userResponse = require('./userResponse');

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
        cbError("Please provide a name!");
        return;
    }

    if (checkEmpty(title)) {
        cbError("Please provide a title!");
        return;
    }

    if (checkEmpty(description)) {
        cbError("Please provide a description!");
        return;
    }

    if (!checkEmailFormat(email)) {
        cbError("The email address you entered is invalid!");
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

    request('https://slack.com/api/channels.create?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&name=' + ticketId.toString(), function (error, response, body) {
        if (error || response.statusCode !== 200) {
            //API Error
            cbError("Unable to create channel for this ticket, please try again...")
        }
        else {

            var body_object = JSON.parse(body);

            if (body_object.ok) {

                var channelId = body_object.channel.id;
                ticketDB.addChannelIdToTicket(ticketId, channelId);

                request('https://slack.com/api/channels.setTopic?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&channel=' + channelId + '&topic=' + ticketTitle,
                    function (error, response2, body2) {
                        var body2_object = JSON.parse(body2);
                        if (error) {
                            console.error(error.message);
                        } else if (!body2_object.ok)
                            console.error(body2.error);
                        else
                            console.log('Finished creating channel for ticket #' + ticketId + ' with topic: ' + ticketTitle);
                    });

                var message = name + ' (' + email + ') asks: \n'
                message += ticketDescription;
                userResponse.sendMessageAsBot(message, ticketId.toString(), function () {
                    console.log('successfully initialized the channel with the ticket description');
                }, function (error) {
                    console.error('Error in initializing channel for ticket #' + ticketId + '\n\n' + error.message);
                });

                //var senderName = body.user.real_name;
                cbSuccess(response);

            } else {
                cbError("Unable to create channel for this ticket, please try again...")
            }
        }
    });

};

module.exports.handleFormInput = handleFormInput;
module.exports.checkEmailFormat = checkEmailFormat;