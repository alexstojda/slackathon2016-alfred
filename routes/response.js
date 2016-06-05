var express = require('express');
var router = express.Router();
var ticketDB = require('../source/TicketDatabase');

/* GET response page. */
router.get('/', function(req, res, next) {
  var ticketId = req.param('id');
  ticketDB.fetchTicketRecord(ticketId, function(ticketData) {
      ticketDB.getTicketMessageHistory(ticketId, function(results) {
              var history = "";
              for (var result in results) {
                  history += "<p>" + result["msg_sender"].replace("alfred", ticketData.name) + ": " + result["msg_text"] + "</p>";
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
