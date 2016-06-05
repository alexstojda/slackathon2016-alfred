var express = require('express');
var router = express.Router();
var ticketDB = require('../source/TicketDatabase');

/* GET response page. */
router.get('/', function(req, res, next) {
  var ticketId = req.param('id');
  ticketDB.fetchTicketRecord(ticketId, function(ticketData) {
      ticketDB.getTicketMessageHistory(ticketId, function(results) {
              var history = "";
              for (var i = 0; i < results.length; ++i) {
                  var result = results[i];
                  history += result["msg_sender"].replace("alfred", ticketData.name) + ": " + result["msg_text"] + "*np*";
              }
              res.render('userResponse', { historyBlock: history, name: ticketData.name, title: ticketData.title });
          },
          function (err) {
              res.render('error');
          });
  }, function(err) {
      res.render('error');
  });

});

module.exports = router;
