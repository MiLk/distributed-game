'use strict';

var path = require('path');
var express = require('express');
var helmet = require('helmet');
var config = require('config');
var bodyParser = require('body-parser')

var app = express();

app.use(helmet());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', '..', 'client')));

var modules = require('./modules');
modules.initializeRoutes(app);

var port = config.get('http.port');
app.listen(port, function () {
  console.log('Routing server started and listening on port: ' + port + '!');
});
