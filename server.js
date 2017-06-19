// disable eslint es6 specific rules because we're using Node@6.x
/* eslint-disable no-var */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable prefer-template */
/* eslint-disable no-console */

var express = require('express');
var bodyParser = require('body-parser');
var request = require('superagent');
var morgan = require('morgan');
var path = require('path');

// mailchimp API settings are stored in the .env file
var mailchimpAPIKey = process.env.MAILCHIMP_API_KEY;
var mailchimpServerInstance = mailchimpAPIKey.split('-')[1];
var mailchimpListID = process.env.MAILCHIMP_LIST_ID;
// mailchimp API url
var url = `https://${mailchimpServerInstance}.api.mailchimp.com/3.0/lists/${mailchimpListID}/members/`;

var app = express();

// setup logging
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function makePostRequest(strEmail, res) {
  request.post(url)
    .set('Content-Type', 'application/json;charset=utf-8')
    .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpAPIKey).toString('base64'))
    .send({
      email_address: strEmail,
      status: 'subscribed',
    })
    .end(function(error, response) {
      if (response.status < 300 || (response.status === 400 && response.body.title === 'Member Exists')) {
        res.send('Signed Up!');
      } else {
        res.status(500).send('Sign Up Failed :(', error);
      }
    });
}

// Serve static assets
app.use(express.static(path.resolve(__dirname, 'client/dist')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client/dist', 'index.html'));
});

// Handle Mailchimp API calls from the client
app.post('/signup', function(req, res) {
  // validate body content
  if (!req.body || !req.body.email_address) {
    return res.status(500).send('Invalid mailchimp post');
  }

  // validate email address
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email_address)) {
    makePostRequest(req.body.email_address, res);
  } else {
    return res.status(500).send('Invalid email format');
  }
});

app.listen(process.env.PORT || 5001, function() {
  console.log('Listening on http://%s:%d/', this.address().address, this.address().port);
});
