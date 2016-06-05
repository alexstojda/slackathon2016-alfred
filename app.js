var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var workflow = require('./source/Workflow');
var userResponse = require('./source/userResponse');
var developerResponse = require('./source/developerResponse');

var routes = require('./routes/index');
var users = require('./routes/users');
var response = require('./routes/response.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/response', response);

app.listen(3000);

// Upload route.
app.post('/', function(req, res) {
    console.log(req.body);

    workflow.handleFormInput(req.body, function(ticketData) {
        res.render('ticketSent', { title: ticketData.title, ticketId: ticketData.ticketId, ticketDesc: ticketData.description, token: null, formRedirect: 0, CustomFieldsJson: JSON.stringify(ticketData.customFields) });
    },
    function(errorMsg) {
        fs.readFile('./views/redirectErr.ejs', 'utf8', function(err, contents) {
            res.send(contents + errorMsg + "</p></body></html>");
        });
    });
    
});

app.post('/response', function(req, res) {
    console.log(req.body);
    var message = req.body.description;
    var title = req.body.title;
    var token = req.body.token;
    var ticketId = req.body.ticketId;
    userResponse.sendMessageAsBot(message, ticketId, true, function() {
        res.render('ticketSent', { title: title, ticketDesc: message, ticketId: ticketId, token: token, formRedirect: 1, CustomFieldsJson: null });
    }, function (err) {
        res.render('error');
    });
    console.log("response post");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;