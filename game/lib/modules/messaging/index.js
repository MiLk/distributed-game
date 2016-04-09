'use strict';

var server = require('../../server');

class Messaging {
  constructor() {
    this.messages = {};

    server.on('messaging', (router, message) => {
      if (message[0] !== 'read') {
        return;
      }
      this.read(router, message[1], message[2]);
    });

  }

  send(to, from, message) {
    if (!this.messages.hasOwnProperty(to)) {
      this.messages[to] = [];
    }
    this.messages[to].push(message);
  }

  read(router, to, reqId) {
    server.send(router, ['messaging', 'inbox', reqId, this.messages[to] || []]);
    this.messages[to] = [];
  }
}

module.exports = new Messaging();
