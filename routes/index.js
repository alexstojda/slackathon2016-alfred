var express = require('express');
var router = express.Router();
var ticketDB = require('../source/TicketDatabase');

/* GET home page. */
router.get('/', function(req, res, next) {
    ticketDB.getCustomFields(function(customFields) {
        var jsonCFields = JSON.stringify(customFields);
        res.render('index', { title: 'El Slackos', CustomFieldsJson: jsonCFields });
    });
});

module.exports = router;
