/**
 * Created by gabriel on 6/4/2016.
 */

var mysql = require('mysql');
var randtoken = require('rand-token');

var connection = mysql.createConnection({
    host      : 'YOUR DB SERVER',
    user      : 'YOUR DB USER',
    password  : 'YOUR DB NAME',
    database  : 'YOUR DB PASSWORD'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

connection.on('error', function(err) {
    //TODO: Add error handler
    console.log('Error in mysql connection \n' + JSON.stringify(err));
});

var fetchTicketRecord = function(ticketNumber, cbSuccess, cbError) {
    var query = 'select * from ticket where TKT_ID = ' + ticketNumber.toString();
    connection.query(query, function (err, rows) {
        if (!err) {
            //Successfully pulled up the ticket record, call the success callback
            if (rows.length == 0) {
                cbSuccess({});
            }
            else {
                query = 'select status_desc from status where status_id=' + rows[0]["TKT_STATUS_ID"].toString();
                connection.query(query, function (err2, rows2) {
                    cbSuccess({
                        ticketId: rows[0]["TKT_ID"],
                        email: rows[0]["TKT_EMAIL"],
                        name: rows[0]["TKT_NAME"],
                        title: rows[0]["TKT_TITLE"],
                        channelId: rows[0]["TKT_CHANNEL_ID"],
                        statusId: rows[0]["TKT_STATUS_ID"],
                        status: rows2[0]["status_desc"],
                        description: rows[0]["TKT_DESCRIPTION"],
                        customFields: JSON.parse(rows[0]["TKT_CUSTOM_FIELDS"])
                    });
                });

            }
        } else {
            console.log('database error ' + err);
            cbError(err);
        }

    });
};

var insertTicketRecord = function(email, name, customFields, ticketTitle, ticketDescription, cbNext, cbError) {
    var insertQuery = "insert into ticket (TKT_EMAIL, TKT_NAME, TKT_TITLE, TKT_CUSTOM_FIELDS, TKT_DESCRIPTION)";
    insertQuery += " VALUES (?,?,?,?,?)";
    connection.query(insertQuery, [email, name, ticketTitle, JSON.stringify(customFields), ticketDescription],
        function(err) {
            var passError = function(error) {
                console.error(error.message);
                cbError("There was an error in generating your ticket: Failed to insert record into Database");
            };
            if (err) {
                passError(err);
            }
            else {

                connection.query('select MAX(TKT_ID) from ticket', function(err, rows) {
                    if (rows.length == 0)
                        passError(err);
                    else
                        cbNext(rows[0]["MAX(TKT_ID)"]);
                });

            }
        });
};

var setStatus = function(ticketId, statusCode, cbSuccess, cbError) {
    var query = 'update ticket set TKT_STATUS_ID=' + statusCode.toString() + ' where TKT_ID=' + ticketId.toString();
    connection.query(query, function (err) {
        if (err && cbError != null) {
            cbError(err);
        }
        else if (cbSuccess != null)
            cbSuccess();
    });
};

var getStatus = function(ticketId, cbSuccess, cbError) {
    var query = 'select TKT_STATUS_ID from ticket where TKT_ID=' + ticketId.toString();
    connection.query(query, function (err, rows, fields) {
        if (rows.length == 0)
            cbSuccess(0);
        else if (err && cbError != null)
            cbError(err);
        else
            cbSuccess(rows[0]["TKT_STATUS_ID"]);
    });
};

var insertTicketMessage = function(msgText, msgSender, msgTicketId, cbSuccess, cbError) {
    var query = 'insert into message (msg_text, msg_sender, msg_ticket_id) values (?,?,?)';
    connection.query(query, [msgText, msgSender, msgTicketId], function(err) {
        if (err && cbError != null) {
            cbError(err);
        }
        else if (cbSuccess != null)
            cbSuccess();
    });
};

var addChannelIdToTicket = function(ticketId, channelId) {
    var update = "update ticket set TKT_CHANNEL_ID='" + channelId.toString() + "' where TKT_ID=" + ticketId.toString();
    connection.query(update, function (error, rows, fields) {
        if (error) {
            console.error(error.message);
        }
    });
};

var getTicketMessageHistory = function(ticketId, cbSuccess, cbError) {
    var query = 'select * from message where msg_ticket_id=' + ticketId.toString();
    connection.query(query, function(err, rows) {
        if (err && cbError != null) {
            cbError(err);
        } else {
            cbSuccess(rows);
        }
    });
};

var setTicketToken = function(ticketId, cbSuccess, cbError) {
    var token = randtoken.generate(50);
    var query = "insert into tokens (token_text, token_ticket_id) VALUES ('" + token.toString() + "'," + ticketId.toString() + ")";
    connection.query(query, function (err) {
        if (err && cbError != null)
            cbError(err);
        else if (cbSuccess != null)
            cbSuccess(token);
    });
};

var getTicketToken = function(ticketId, cbSuccess, cbError) {
    var query = 'select token_text from tokens where token_ticket_id=' + ticketId.toString();
    connection.query(query, function (err, rows) {
        if (!rows || err)
            cbError(err);
        else if (rows.length == 0)
            cbError("No token found");
        else {
            cbSuccess(rows[0]["token_text"]);
        }
    });
};

var getCustomFields = function(cbSuccess, cbError) {
    var query = 'select input_name, input_desc from inputs';
    connection.query(query, function(err, rows) {
        if (err)
            cbError(err);
        cbSuccess(rows);
    });
};

var insertCustomField = function (name, description, cbSuccess, cbError) {
    var query = 'insert into inputs (input_name, input_desc) VALUES (?,?)';
    connection.query(query, [name, description], function (err) {
        if (err && cbError != null)
            cbError(err);
        if (cbSuccess != null)
            cbSuccess();
    });
};

var deleteCustomField = function (name, cbSuccess, cbError) {
    var query = 'delete from inputs where input_name=?';
    connection.query(query, [name], function (err) {
        if (err && cbError != null)
            cbError(err);
        if (cbSuccess != null)
            cbSuccess();
    });
};

var validTicketTokenPair = function(ticketId, token, cbSuccess, cbError) {
    var query = 'select count(*) as count from tokens where token_ticket_id=? and token_text=?'
    connection.query(query, [ticketId, token], function (err, rows) {
        if (!rows || err)
            cbError(err);
        else {
            var isValid = (rows[0]["count"] == 1);
            cbSuccess(isValid);
        }
    });
};

module.exports.fetchTicketRecord = fetchTicketRecord;
module.exports.insertTicketRecord = insertTicketRecord;
module.exports.addChannelIdToTicket = addChannelIdToTicket;
module.exports.insertTicketMessage = insertTicketMessage;
module.exports.setStatus = setStatus;
module.exports.getStatus = getStatus;
module.exports.getTicketMessageHistory = getTicketMessageHistory;
module.exports.setTicketToken = setTicketToken;
module.exports.getTicketToken = getTicketToken;
module.exports.validTicketTokenPair = validTicketTokenPair;
module.exports.getCustomFields = getCustomFields;
module.exports.insertCustomField = insertCustomField;
module.exports.deleteCustomField = deleteCustomField;
module.exports.host = connection.host;
module.exports.database = connection.database;
