/**
 * Created by gabriel on 6/4/2016.
 */

var ticketDB = require('./TicketDatabase');

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
        createChannel(ticketId, title, cbSuccess, cbError);

    }, function(error) {
        //In the event of an error
        cbError(error);
    });

};

var createChannel = function(ticketId, ticketTitle, cbSuccess, cbError) {

    //Some pseudo-code to follow
    /* if (success)
           cbSuccess()
       else
           cbError(Message to display to user on the other end (User friendly));

        return;
    */

};

module.exports.handleFormInput = handleFormInput;
module.exports.checkEmailFormat = checkEmailFormat;