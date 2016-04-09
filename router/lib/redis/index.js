'use strict';

var config = require('config');
var redis = require('redis');
var client = redis.createClient(config.get('redis.url'));

process.on('beforeExit', function () {
  client.quit();
});

module.exports = {
  getClient: function () {
    return client;
  }
};
