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

var handleFormInput = function(formData) {
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

    ticketDB.insertTicketRecord(email, name, customFields, title, description);

};

module.exports.handleFormInput = handleFormInput;
module.exports.checkEmailFormat = checkEmailFormat;