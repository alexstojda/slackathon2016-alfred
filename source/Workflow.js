/**
 * Created by gabriel on 6/4/2016.
 */

var ticketDB = require('./TicketDatabase');
var request = require('request');

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

    if (checkEmpty(name))
        throw "Please provide a name!";

    if (checkEmpty(title))
        throw "Please provide a title!";

    if (checkEmpty(description))
        throw "Please provide a description!";

    if (!checkEmailFormat(email)) {
        throw "Invalid email input";
    }

    ticketDB.insertTicketRecord(email, name, customFields, title, description, function(ticketId) {
        createChannel(ticketId, title, cbSuccess, cbError);
    }, function(error) {
        cbError(error);
    });

};

var createChannel = function(ticketId, ticketTitle, cbSuccess, cbError) {
    
    request('https://slack.com/api/channels.create?token=xoxp-34476473665-34483469029-48223068260-3070583ad2&name=' + ticketId, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            //API Error
            cbError("Unable to create channel for this ticket, please try again...")
        }
        
        else {
            //var senderName = body.user.real_name;
            cbSuccess(response);

        }
    });

};




module.exports.handleFormInput = handleFormInput;
module.exports.checkEmailFormat = checkEmailFormat;