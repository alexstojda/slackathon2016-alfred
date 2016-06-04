/**
 * Created by alex on 2016-06-04.
 */


//Listening code

var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('direct:?name=slackos.teambana.com');
console.log('derp');
transporter.verify(function(error, success) {
    console.log('derp');
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Alfred@El Slackos" <alfred@elslackos.slack.com>', // sender address
    to: 'alexstojda@outlook.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<b>Hello world</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});